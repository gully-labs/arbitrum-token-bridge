/**
 * Pure helpers for the "GullyChain bridge activity" panel: decode the bridge events of GullyChain Testnet
 * and bucket them for the charts and the transfers list.
 *
 * The Gully indexer (indexer.gullychain.xyz) indexes L3 activity (launches, trades, swaps, wraps) but
 * exposes no bridge data, so the panel reads the chain's own events:
 *   Deposits (Arbitrum Sepolia -> GullyChain), from the public Arbitrum Sepolia RPC:
 *     Bridge.MessageDelivered(messageIndex, beforeInboxAcc, inbox, kind, sender, messageDataHash, baseFeeL1, timestamp)
 *     Inbox.InboxMessageDelivered(messageNum, data)
 *     A deposit is a message of kind 12 (ETH deposit) or 9 (retryable ticket: ETH to another address, or a
 *     token deposit through the gateway router). Kinds 3, 11 and 13 (L2 message, initialise, batch posting
 *     report) are not user deposits.
 *   Withdrawals (GullyChain -> Arbitrum Sepolia), from the GullyChain RPC:
 *     ArbSys(0x64).L2ToL1Tx(caller, destination, hash, position, arbBlockNum, ethBlockNum, timestamp, callvalue, data)
 * Nothing here touches the bridge's own transfer logic.
 */

export type RawLog = {
  blockNumber: string
  transactionHash: string
  topics: string[]
  data: string
}

export type DepositKind = 'eth' | 'retryable-eth' | 'retryable-token'

export type BridgeDeposit = {
  messageIndex: number
  kind: DepositKind
  sender: string
  txHash: string
  blockNumber: number
  /** Parent-chain timestamp, seconds. */
  timestamp: number
  /** Decimal string (wei). ETH deposited; for a token deposit the ETH sent to fund the retryable. */
  valueWei: string
}

export type WithdrawalKind = 'eth' | 'token'

export type BridgeWithdrawal = {
  /** Position in the L2->L1 merkle tree, unique per withdrawal. */
  position: number
  kind: WithdrawalKind
  /** The L3 account that initiated the withdrawal (the gateway for token withdrawals). */
  sender: string
  destination: string
  txHash: string
  /** GullyChain block. */
  blockNumber: number
  /** GullyChain timestamp, seconds. */
  timestamp: number
  /** Decimal string (wei). ETH withdrawn; 0 for a token withdrawal. */
  valueWei: string
}

export const DEPOSIT_KIND_LABEL: Record<DepositKind, string> = {
  eth: 'ETH deposit',
  'retryable-eth': 'ETH deposit (retryable)',
  'retryable-token': 'Token deposit (ETH gas funds)'
}

export const WITHDRAWAL_KIND_LABEL: Record<WithdrawalKind, string> = {
  eth: 'ETH withdrawal',
  token: 'Token withdrawal'
}

/** keccak256("MessageDelivered(uint256,bytes32,address,uint8,address,bytes32,uint256,uint64)") */
export const MESSAGE_DELIVERED_TOPIC =
  '0x5e3c1311ea442664e8b1611bfabef659120ea7a0a2cfc0667700bebc69cbffe1'
/** keccak256("InboxMessageDelivered(uint256,bytes)") */
export const INBOX_MESSAGE_DELIVERED_TOPIC =
  '0xff64905f73a67fb594e0f940a8075a860db489ad991e032f48c81123eb52d60b'
/** keccak256("L2ToL1Tx(address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes)") */
export const L2_TO_L1_TX_TOPIC =
  '0x3e7aafa77dbf186b7fd488006beff893744caa3c4f6f299e8a709fa2087374fc'
/** ArbSys precompile, the same on every Arbitrum chain. */
export const ARB_SYS_ADDRESS = '0x0000000000000000000000000000000000000064'

const KIND_RETRYABLE = 9
const KIND_ETH_DEPOSIT = 12

function strip0x(hex: string): string {
  return hex.startsWith('0x') ? hex.slice(2) : hex
}

function word(hex: string, i: number): string {
  return strip0x(hex).slice(i * 64, (i + 1) * 64)
}

function toNumber(hexWord: string): number {
  return hexWord ? Number(BigInt('0x' + hexWord)) : 0
}

function toAddress(hexWord: string): string {
  return '0x' + strip0x(hexWord).slice(24)
}

export type DeliveredMessage = {
  messageIndex: number
  kind: number
  sender: string
  timestamp: number
  blockNumber: number
  txHash: string
}

/** Decodes one Bridge.MessageDelivered log; null when the log is not that event. */
export function parseMessageDelivered(log: RawLog): DeliveredMessage | null {
  if (log.topics[0] !== MESSAGE_DELIVERED_TOPIC || !log.topics[1]) return null
  if (strip0x(log.data).length < 6 * 64) return null
  return {
    messageIndex: Number(BigInt(log.topics[1])),
    kind: toNumber(word(log.data, 1)),
    sender: toAddress(word(log.data, 2)),
    timestamp: toNumber(word(log.data, 5)),
    blockNumber: Number(BigInt(log.blockNumber)),
    txHash: log.transactionHash
  }
}

/** The `bytes data` of an Inbox.InboxMessageDelivered log, as hex without 0x. */
export function inboxPayload(data: string): string {
  const h = strip0x(data)
  const offset = toNumber(h.slice(0, 64))
  const length = toNumber(h.slice(offset * 2, offset * 2 + 64))
  const start = offset * 2 + 64
  return h.slice(start, start + length * 2)
}

/**
 * Value of a deposit from its inbox payload.
 * kind 12: abi.encodePacked(dest address, uint256 amount)
 * kind 9:  abi.encodePacked(uint256 dest, l2CallValue, msgValue, maxSubmissionCost, excessFeeRefund,
 *          callValueRefund, gasLimit, maxFeePerGas, dataLength, data)
 */
export function depositFromPayload(
  kind: number,
  payload: string
): { kind: DepositKind; valueWei: bigint } | null {
  if (kind === KIND_ETH_DEPOSIT) {
    if (payload.length < 104) return null
    return { kind: 'eth', valueWei: BigInt('0x' + payload.slice(40, 104)) }
  }
  if (kind === KIND_RETRYABLE) {
    if (payload.length < 3 * 64) return null
    const l2CallValue = BigInt('0x' + payload.slice(64, 128))
    const msgValue = BigInt('0x' + payload.slice(128, 192))
    if (l2CallValue > BigInt(0)) {
      return { kind: 'retryable-eth', valueWei: l2CallValue }
    }
    return { kind: 'retryable-token', valueWei: msgValue }
  }
  return null
}

/** Joins Bridge and Inbox logs on the message index and keeps the user deposits. */
export function buildDeposits(
  bridgeLogs: RawLog[],
  inboxLogs: RawLog[]
): BridgeDeposit[] {
  const payloads = new Map<number, string>()
  for (const log of inboxLogs) {
    if (log.topics[0] !== INBOX_MESSAGE_DELIVERED_TOPIC || !log.topics[1]) {
      continue
    }
    payloads.set(Number(BigInt(log.topics[1])), inboxPayload(log.data))
  }

  const deposits: BridgeDeposit[] = []
  for (const log of bridgeLogs) {
    const message = parseMessageDelivered(log)
    if (!message) continue
    const payload = payloads.get(message.messageIndex)
    if (payload === undefined) continue
    const deposit = depositFromPayload(message.kind, payload)
    if (!deposit) continue
    deposits.push({
      messageIndex: message.messageIndex,
      kind: deposit.kind,
      sender: message.sender,
      txHash: message.txHash,
      blockNumber: message.blockNumber,
      timestamp: message.timestamp,
      valueWei: deposit.valueWei.toString()
    })
  }
  return deposits
}

/** Decodes one ArbSys.L2ToL1Tx log (a withdrawal initiated on GullyChain); null for anything else. */
export function parseL2ToL1Tx(log: RawLog): BridgeWithdrawal | null {
  if (log.topics[0] !== L2_TO_L1_TX_TOPIC || log.topics.length < 4) return null
  if (strip0x(log.data).length < 5 * 64) return null
  const destination = log.topics[1]
  const position = log.topics[3]
  if (!destination || !position) return null
  const callvalue = BigInt('0x' + word(log.data, 4))
  return {
    position: Number(BigInt(position)),
    kind: callvalue > BigInt(0) ? 'eth' : 'token',
    sender: toAddress(word(log.data, 0)),
    destination: toAddress(destination),
    txHash: log.transactionHash,
    blockNumber: Number(BigInt(log.blockNumber)),
    timestamp: toNumber(word(log.data, 3)),
    valueWei: callvalue.toString()
  }
}

export function buildWithdrawals(logs: RawLog[]): BridgeWithdrawal[] {
  const withdrawals: BridgeWithdrawal[] = []
  for (const log of logs) {
    const withdrawal = parseL2ToL1Tx(log)
    if (withdrawal) withdrawals.push(withdrawal)
  }
  return withdrawals
}

/** Union of two deposit lists, de-duplicated on the message index, oldest first. */
export function mergeDeposits(
  a: BridgeDeposit[],
  b: BridgeDeposit[]
): BridgeDeposit[] {
  const byIndex = new Map<number, BridgeDeposit>()
  for (const d of a) byIndex.set(d.messageIndex, d)
  for (const d of b) byIndex.set(d.messageIndex, d)
  return [...byIndex.values()].sort((x, y) => x.messageIndex - y.messageIndex)
}

/** Union of two withdrawal lists, de-duplicated on the position, oldest first. */
export function mergeWithdrawals(
  a: BridgeWithdrawal[],
  b: BridgeWithdrawal[]
): BridgeWithdrawal[] {
  const byPosition = new Map<number, BridgeWithdrawal>()
  for (const w of a) byPosition.set(w.position, w)
  for (const w of b) byPosition.set(w.position, w)
  return [...byPosition.values()].sort((x, y) => x.position - y.position)
}

/** [from, to] block ranges of at most `size` blocks covering from..to inclusive. */
export function chunkRanges(
  from: number,
  to: number,
  size: number
): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  if (size < 1 || to < from) return ranges
  for (let start = from; start <= to; start += size) {
    ranges.push([start, Math.min(start + size - 1, to)])
  }
  return ranges
}

export type DayBucket = {
  /** YYYY-MM-DD (UTC) */
  day: string
  /** Short label for the axis, e.g. "Oct 25" */
  label: string
  count: number
  valueWei: string
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

function dayLabel(ms: number): string {
  const d = new Date(ms)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** Deposits per UTC day for the last `days` days ending today (days with no deposits included). */
export function depositsPerDay(
  deposits: BridgeDeposit[],
  days: number,
  nowMs: number = Date.now()
): DayBucket[] {
  const buckets = new Map<string, DayBucket>()
  const dayMs = 24 * 60 * 60 * 1000
  const todayStart = Math.floor(nowMs / dayMs) * dayMs
  for (let i = days - 1; i >= 0; i--) {
    const ms = todayStart - i * dayMs
    buckets.set(dayKey(ms), {
      day: dayKey(ms),
      label: dayLabel(ms),
      count: 0,
      valueWei: '0'
    })
  }
  for (const d of deposits) {
    const bucket = buckets.get(dayKey(d.timestamp * 1000))
    if (!bucket) continue
    bucket.count += 1
    bucket.valueWei = (BigInt(bucket.valueWei) + BigInt(d.valueWei)).toString()
  }
  return [...buckets.values()]
}

/** Sum of the values, wei. */
export function totalWei(items: Array<{ valueWei: string }>): bigint {
  return items.reduce((acc, d) => acc + BigInt(d.valueWei), BigInt(0))
}

export type BridgeTransfer = {
  id: string
  direction: 'deposit' | 'withdrawal'
  label: string
  sender: string
  txHash: string
  explorerTxUrl: string
  timestamp: number
  valueWei: string
}

/** The last `limit` transfers in both directions, newest first. */
export function recentTransfers(
  deposits: BridgeDeposit[],
  withdrawals: BridgeWithdrawal[],
  limit: number,
  explorers: { parent: string; chain: string }
): BridgeTransfer[] {
  const all: BridgeTransfer[] = [
    ...deposits.map<BridgeTransfer>(d => ({
      id: `deposit-${d.messageIndex}`,
      direction: 'deposit',
      label: DEPOSIT_KIND_LABEL[d.kind],
      sender: d.sender,
      txHash: d.txHash,
      explorerTxUrl: `${explorers.parent}/tx/${d.txHash}`,
      timestamp: d.timestamp,
      valueWei: d.valueWei
    })),
    ...withdrawals.map<BridgeTransfer>(w => ({
      id: `withdrawal-${w.position}`,
      direction: 'withdrawal',
      label: WITHDRAWAL_KIND_LABEL[w.kind],
      sender: w.sender,
      txHash: w.txHash,
      explorerTxUrl: `${explorers.chain}/tx/${w.txHash}`,
      timestamp: w.timestamp,
      valueWei: w.valueWei
    }))
  ]
  all.sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id))
  return all.slice(0, limit)
}

/** "12s ago", "3m ago", "5h ago", "2d ago" */
export function relativeTime(
  seconds: number,
  nowMs: number = Date.now()
): string {
  const diff = Math.max(0, Math.floor(nowMs / 1000) - seconds)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/** wei -> ETH with up to `maxFractionDigits` decimals, trailing zeros trimmed. */
export function formatEth(wei: bigint | string, maxFractionDigits = 4): string {
  const value = typeof wei === 'string' ? BigInt(wei) : wei
  const base = BigInt('1000000000000000000')
  const whole = value / base
  const frac = value % base
  if (maxFractionDigits <= 0 || frac === BigInt(0)) return whole.toString()
  const fracStr = frac
    .toString()
    .padStart(18, '0')
    .slice(0, maxFractionDigits)
    .replace(/0+$/, '')
  if (fracStr === '') {
    return value > BigInt(0) && whole === BigInt(0)
      ? `<0.${'0'.repeat(maxFractionDigits - 1)}1`
      : whole.toString()
  }
  return `${whole.toString()}.${fracStr}`
}

/** wei -> ETH as a JS number (chart scale only; never for display of exact amounts). */
export function weiToEthNumber(wei: string): number {
  return Number(BigInt(wei) / BigInt('1000000000000')) / 1e6
}

export function shortHex(hex: string, chars = 4): string {
  if (hex.length <= 2 + chars * 2) return hex
  return `${hex.slice(0, 2 + chars)}…${hex.slice(-chars)}`
}
