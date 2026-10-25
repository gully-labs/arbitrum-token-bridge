import { describe, expect, it } from 'vitest'
import {
  INBOX_MESSAGE_DELIVERED_TOPIC,
  L2_TO_L1_TX_TOPIC,
  MESSAGE_DELIVERED_TOPIC,
  buildDeposits,
  buildWithdrawals,
  chunkRanges,
  depositFromPayload,
  depositsPerDay,
  formatEth,
  inboxPayload,
  mergeDeposits,
  mergeWithdrawals,
  parseL2ToL1Tx,
  parseMessageDelivered,
  recentTransfers,
  relativeTime,
  shortHex,
  totalWei,
  weiToEthNumber,
  type RawLog
} from './bridgeActivity'

const w = (v: bigint | number | string) =>
  BigInt(v).toString(16).padStart(64, '0')
const addrWord = (addr: string) => addr.slice(2).toLowerCase().padStart(64, '0')

const INBOX = '0x7B8499f1C058c9bdE2Bc9BdFEBE40364232C52B5'
const SENDER = '0x3fab184622dc19b6109349b94811493bf2a45362'
const DEST = '0x12fa4f1f2b90422da4d425fbcf4be50e80fd7a93'

function bridgeLog(
  messageIndex: number,
  kind: number,
  timestamp: number,
  block = 322610844
): RawLog {
  return {
    blockNumber: '0x' + block.toString(16),
    transactionHash: '0x' + messageIndex.toString(16).padStart(64, 'a'),
    topics: [MESSAGE_DELIVERED_TOPIC, '0x' + w(messageIndex), '0x' + w(0)],
    data:
      '0x' +
      addrWord(INBOX) +
      w(kind) +
      addrWord(SENDER) +
      w(0) +
      w(100000000) +
      w(timestamp)
  }
}

function inboxLog(messageIndex: number, payloadHex: string): RawLog {
  const length = payloadHex.length / 2
  const padded = payloadHex.padEnd(Math.ceil(payloadHex.length / 64) * 64, '0')
  return {
    blockNumber: '0x133cf11c',
    transactionHash: '0x' + messageIndex.toString(16).padStart(64, 'a'),
    topics: [INBOX_MESSAGE_DELIVERED_TOPIC, '0x' + w(messageIndex)],
    data: '0x' + w(32) + w(length) + padded
  }
}

function withdrawalLog(
  position: number,
  callvalue: bigint | string | number,
  timestamp: number,
  block = 190
): RawLog {
  return {
    blockNumber: '0x' + block.toString(16),
    transactionHash: '0x' + position.toString(16).padStart(64, 'b'),
    topics: [
      L2_TO_L1_TX_TOPIC,
      '0x' + addrWord(DEST),
      '0x' + w(123456),
      '0x' + w(position)
    ],
    data:
      '0x' +
      addrWord(SENDER) +
      w(block) +
      w(322700000) +
      w(timestamp) +
      w(callvalue) +
      w(192) +
      w(0)
  }
}

// Retryable with 0.01 ETH call value (the chain's message #1 on Arbitrum Sepolia had these three words).
const RETRYABLE_ETH_PAYLOAD =
  addrWord(SENDER) +
  w('0x2386f26fc10000') +
  w('0x2388e1e9712b00') +
  w(0) +
  addrWord(SENDER) +
  addrWord(SENDER) +
  w(21000) +
  w(100000000) +
  w(0)
// Token deposit through the router: no call value, 0.0005 ETH sent to fund the ticket.
const RETRYABLE_TOKEN_PAYLOAD =
  addrWord(SENDER) +
  w(0) +
  w('0x1c6bf52634000') +
  w('0x5af3107a4000') +
  addrWord(SENDER) +
  addrWord(SENDER) +
  w(300000) +
  w(100000000) +
  w(0)
// Plain ETH deposit: dest ++ amount (packed, 52 bytes).
const ETH_PAYLOAD = SENDER.slice(2) + w('0x16345785d8a0000') // 0.1 ETH

describe('parseMessageDelivered', () => {
  it('decodes index, kind, sender and timestamp', () => {
    const m = parseMessageDelivered(bridgeLog(7, 12, 1792900000))
    expect(m).toEqual({
      messageIndex: 7,
      kind: 12,
      sender: SENDER,
      timestamp: 1792900000,
      blockNumber: 322610844,
      txHash: bridgeLog(7, 12, 0).transactionHash
    })
  })

  it('ignores other events', () => {
    const log = bridgeLog(1, 12, 1)
    expect(parseMessageDelivered({ ...log, topics: ['0x00'] })).toBeNull()
  })
})

describe('inboxPayload / depositFromPayload', () => {
  it('unwraps the abi-encoded bytes', () => {
    expect(inboxPayload(inboxLog(1, ETH_PAYLOAD).data)).toBe(ETH_PAYLOAD)
  })

  it('reads the amount of an ETH deposit (kind 12)', () => {
    expect(depositFromPayload(12, ETH_PAYLOAD)).toEqual({
      kind: 'eth',
      valueWei: BigInt('0x16345785d8a0000')
    })
  })

  it('reads the call value of an ETH retryable (kind 9)', () => {
    expect(depositFromPayload(9, RETRYABLE_ETH_PAYLOAD)).toEqual({
      kind: 'retryable-eth',
      valueWei: BigInt('0x2386f26fc10000')
    })
  })

  it('reads the gas funds of a token deposit (kind 9, no call value)', () => {
    expect(depositFromPayload(9, RETRYABLE_TOKEN_PAYLOAD)).toEqual({
      kind: 'retryable-token',
      valueWei: BigInt('0x1c6bf52634000')
    })
  })

  it('is null for non-deposit kinds (batch posting reports, L2 messages)', () => {
    expect(depositFromPayload(13, ETH_PAYLOAD)).toBeNull()
    expect(depositFromPayload(3, RETRYABLE_ETH_PAYLOAD)).toBeNull()
  })
})

describe('buildDeposits', () => {
  it('joins bridge and inbox logs on the message index and skips non-deposits', () => {
    const bridgeLogs = [
      bridgeLog(0, 11, 1792000000),
      bridgeLog(1, 9, 1792000100),
      bridgeLog(2, 3, 1792000200),
      bridgeLog(3, 12, 1792000300),
      bridgeLog(4, 13, 1792000400),
      bridgeLog(5, 9, 1792000500)
    ]
    const inboxLogs = [
      inboxLog(1, RETRYABLE_ETH_PAYLOAD),
      inboxLog(2, '00'),
      inboxLog(3, ETH_PAYLOAD),
      inboxLog(5, RETRYABLE_TOKEN_PAYLOAD)
    ]
    const deposits = buildDeposits(bridgeLogs, inboxLogs)
    expect(deposits.map(d => [d.messageIndex, d.kind, d.valueWei])).toEqual([
      [1, 'retryable-eth', BigInt('0x2386f26fc10000').toString()],
      [3, 'eth', BigInt('0x16345785d8a0000').toString()],
      [5, 'retryable-token', BigInt('0x1c6bf52634000').toString()]
    ])
    expect(deposits[0]?.sender).toBe(SENDER)
    expect(deposits[0]?.timestamp).toBe(1792000100)
  })

  it('skips a bridge message whose inbox log is missing (other chunk)', () => {
    expect(buildDeposits([bridgeLog(9, 12, 1)], [])).toEqual([])
  })
})

describe('withdrawals (ArbSys.L2ToL1Tx)', () => {
  it('decodes an ETH withdrawal', () => {
    expect(
      parseL2ToL1Tx(withdrawalLog(4, '0x2386f26fc10000', 1792950000))
    ).toEqual({
      position: 4,
      kind: 'eth',
      sender: SENDER,
      destination: DEST,
      txHash: withdrawalLog(4, 0, 0).transactionHash,
      blockNumber: 190,
      timestamp: 1792950000,
      valueWei: BigInt('0x2386f26fc10000').toString()
    })
  })

  it('treats a zero call value as a token withdrawal and ignores other events', () => {
    const withdrawals = buildWithdrawals([
      withdrawalLog(1, 0, 1792950000),
      { ...withdrawalLog(2, 1, 1792950001), topics: ['0x00'] }
    ])
    expect(withdrawals.map(x => [x.position, x.kind, x.valueWei])).toEqual([
      [1, 'token', '0']
    ])
  })

  it('merges on the position', () => {
    const a = buildWithdrawals([withdrawalLog(2, 1, 2), withdrawalLog(1, 1, 1)])
    const b = buildWithdrawals([withdrawalLog(2, 1, 2), withdrawalLog(3, 1, 3)])
    expect(mergeWithdrawals(a, b).map(x => x.position)).toEqual([1, 2, 3])
  })
})

describe('mergeDeposits', () => {
  it('de-duplicates on the message index and sorts', () => {
    const a = buildDeposits(
      [bridgeLog(3, 12, 30), bridgeLog(1, 12, 10)],
      [inboxLog(3, ETH_PAYLOAD), inboxLog(1, ETH_PAYLOAD)]
    )
    const b = buildDeposits(
      [bridgeLog(3, 12, 30), bridgeLog(2, 12, 20)],
      [inboxLog(3, ETH_PAYLOAD), inboxLog(2, ETH_PAYLOAD)]
    )
    expect(mergeDeposits(a, b).map(d => d.messageIndex)).toEqual([1, 2, 3])
  })
})

describe('recentTransfers', () => {
  it('interleaves both directions, newest first, capped', () => {
    const deposits = buildDeposits(
      [bridgeLog(1, 12, 100), bridgeLog(2, 12, 300), bridgeLog(3, 12, 500)],
      [1, 2, 3].map(i => inboxLog(i, ETH_PAYLOAD))
    )
    const withdrawals = buildWithdrawals([
      withdrawalLog(1, '0x2386f26fc10000', 200),
      withdrawalLog(2, 0, 400)
    ])
    const transfers = recentTransfers(deposits, withdrawals, 4, {
      parent: 'https://sepolia.arbiscan.io',
      chain: 'https://testnet-explorer.gullychain.xyz'
    })
    expect(transfers.map(t => [t.id, t.direction, t.timestamp])).toEqual([
      ['deposit-3', 'deposit', 500],
      ['withdrawal-2', 'withdrawal', 400],
      ['deposit-2', 'deposit', 300],
      ['withdrawal-1', 'withdrawal', 200]
    ])
    expect(transfers[1]?.label).toBe('Token withdrawal')
    expect(transfers[1]?.explorerTxUrl).toBe(
      `https://testnet-explorer.gullychain.xyz/tx/${
        withdrawalLog(2, 0, 0).transactionHash
      }`
    )
    expect(transfers[0]?.explorerTxUrl).toBe(
      `https://sepolia.arbiscan.io/tx/${bridgeLog(3, 12, 0).transactionHash}`
    )
  })
})

describe('chunkRanges', () => {
  it('covers the range inclusively in fixed-size chunks', () => {
    expect(chunkRanges(100, 349, 100)).toEqual([
      [100, 199],
      [200, 299],
      [300, 349]
    ])
    expect(chunkRanges(5, 5, 10)).toEqual([[5, 5]])
    expect(chunkRanges(10, 5, 10)).toEqual([])
  })
})

describe('depositsPerDay', () => {
  it('buckets by UTC day over the window, including empty days', () => {
    const now = Date.UTC(2026, 9, 25, 12) // 2026-10-25T12:00Z
    const day = 24 * 3600
    const deposits = buildDeposits(
      [
        bridgeLog(1, 12, now / 1000 - 2 * day),
        bridgeLog(2, 12, now / 1000 - 2 * day + 60),
        bridgeLog(3, 12, now / 1000),
        bridgeLog(4, 12, now / 1000 - 40 * day)
      ],
      [1, 2, 3, 4].map(i => inboxLog(i, ETH_PAYLOAD))
    )
    const buckets = depositsPerDay(deposits, 3, now)
    expect(buckets.map(b => [b.day, b.label, b.count])).toEqual([
      ['2026-10-23', 'Oct 23', 2],
      ['2026-10-24', 'Oct 24', 0],
      ['2026-10-25', 'Oct 25', 1]
    ])
    expect(buckets[0]?.valueWei).toBe(
      (BigInt('0x16345785d8a0000') * BigInt(2)).toString()
    )
  })
})

describe('formatting', () => {
  it('formats wei as ETH', () => {
    expect(formatEth(BigInt('1000000000000000000'))).toBe('1')
    expect(formatEth('10000000000000000')).toBe('0.01')
    expect(formatEth('123456789000000000', 4)).toBe('0.1234')
    expect(formatEth('1', 4)).toBe('<0.0001')
    expect(formatEth('0')).toBe('0')
    expect(weiToEthNumber('10000000000000000')).toBeCloseTo(0.01)
    expect(totalWei(buildDeposits([], []))).toBe(BigInt(0))
    expect(shortHex('0xabcdef1234567890abcdef1234567890abcdef12')).toBe(
      '0xabcd…ef12'
    )
  })

  it('formats relative time', () => {
    const now = 1_792_958_885_000
    expect(relativeTime(1_792_958_880, now)).toBe('5s ago')
    expect(relativeTime(1_792_958_885 - 150, now)).toBe('2m ago')
    expect(relativeTime(1_792_958_885 - 7200, now)).toBe('2h ago')
    expect(relativeTime(1_792_958_885 - 3 * 86400, now)).toBe('3d ago')
    expect(relativeTime(1_792_958_999, now)).toBe('0s ago')
  })
})
