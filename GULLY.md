# Gully Bridge

Gully Bridge is the Gully Labs fork of the [Arbitrum token bridge](https://github.com/OffchainLabs/arbitrum-token-bridge)
(Apache-2.0, see `LICENSE`). The branch `gully/brand` is branding only. The branch `gully/testnet` registers **Gully Chain Testnet**
(chain id 485590, L3 on Arbitrum Sepolia) and adds the Docker deploy under `gully/`.

## Gully Chain Testnet (branch `gully/testnet`)

| What | Where |
| --- | --- |
| Chain record (core + token bridge contracts, `confirmPeriodBlocks` 150 read from the rollup, slug `gully-chain-testnet`) | first entry of `testnet` in `packages/arb-token-bridge-ui/src/util/orbitChainsData.json` |
| Chain logo | `packages/app/public/images/GullyChainLogo.png` (copy of the kit icon `icon-192.png`) |
| Default pair Arbitrum Sepolia -> Gully Chain (redirect of `/` without chain params, only when `GULLY_DEFAULT_QUERY` is set at build) | `packages/app/next.config.js` |
| Browser-wallets-only mode when `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is empty (RainbowKit throws otherwise) | `getInjectedOnlyProps` in `src/util/wagmi/setup.ts` |
| Public build env (free public RPCs, no secrets) | `gully/testnet.env` |
| Image and service (`next start` standalone, port 3000 -> `172.17.0.1:8084`) | `gully/Dockerfile`, `gully/compose.yaml` |

Contract addresses come from `gully-ops/l3/generated/deployment.json` and `token-bridge.json`; `parentProxyAdmin` is
the EIP-1967 admin of the parent gateways (the rollup's `adminProxy`).

Deploy on the gully-l3 box (only `/srv/gully-bridge` and the `gully-bridge` container):

```sh
git -c core.autocrlf=false archive --format=tar <branch> | ssh deploy@57.129.137.57 'find /srv/gully-bridge -mindepth 1 -maxdepth 1 ! -name .deploy-logs -exec rm -rf {} + && tar -x -C /srv/gully-bridge'
ssh deploy@57.129.137.57 'cd /srv/gully-bridge && docker compose -f gully/compose.yaml up -d --build'
```

`core.autocrlf=false` keeps LF endings in the tarball (with `true`, a Windows checkout ships CRLF files and the env
file inlined the WalletConnect id as a bare carriage return). `.gitattributes` pins `gully/**`, env, shell and YAML
files to LF as well, the Dockerfile strips carriage returns from `testnet.env`, and `packages/app/next.config.js` fails
the build on a `NEXT_PUBLIC_*`/`GULLY_*` value holding one or on a malformed WalletConnect id. Check on the box with
`grep -c $'\r' /srv/gully-bridge/gully/testnet.env` (must print 0).

A WalletConnect id can be passed at build without committing it: `WALLETCONNECT_PROJECT_ID=<id> docker compose -f
gully/compose.yaml up -d --build` (compose forwards it as a build arg). Without it the site offers browser wallets only.

## Branding layer (what the fork changes, and where)

Brand: the **GullyChain brand kit** (`Desktop\GULLY LABS GRAPHICS\Gully Chain\brand-kit`: read its `CLAUDE_PROMPT.md`
and `tokens.json`). The name is always written "GullyChain". Branch `gully/brand-v2` replaced the earlier Gully Labs
frog/gold branding; the interim "kit v2" (Blue Crown) colours were replaced by this kit before it shipped.

| What | Where |
| --- | --- |
| Name, links, "Powered by Arbitrum" credit, read-only endpoints of the activity panel, kit asset paths | `packages/arb-token-bridge-ui/src/gully/brand.ts` |
| Design tokens (night page, ink cards, blue, cyan, green, white, muted, chain gradient; derived hairline `--gc-line` and `--gc-down`; 22px card and pill radii) | `:root` in `src/styles/tailwind.css`, wired into Tailwind in the root `tailwind.config.js` (`gc-*` colours re-skin the upstream palette in place) |
| Font (Exo 2, 600 UI / 800 headlines, one face for everything) | `src/components/common/Font.ts` (keeps the upstream export `unica` and variable `--font-unica77`), classes `.font-gully-*` in `tailwind.css` |
| Header logo (kit `logo/gullychain-logo-transparent.png` at 40px), sidebar nav with Lucide icons, footer attribution and the "Powered by GullyChain" badge | `src/gully/GullySidebar.tsx` |
| Signature buttons (pill, cyan/night primary, blue/white secondary, ghost tertiary, left icon, sliding arrow, shine sweep, 0.98 pressed) | `src/components/common/Button.tsx`, `.gc-shine` in `tailwind.css` |
| Chart-led header: stat tiles with sparklines, transfers ticker tape (landing "Direction A: Terminal" language) | `src/gully/activity/GullyStatsStrip.tsx`, `GullyTape.tsx`, `sparkline.ts`, rendered by `MainContent.tsx` |
| Bridge-flow stepper (Connect, Amount, Confirm, Track) | `src/gully/GullyStepper.tsx`, rendered by `MainContent.tsx` |
| Kit toasts (bottom-right, ink surface, 22px, Lucide icon, cyan progress bar) | `src/components/common/atoms/Toast.tsx`, `.Toastify__*` in `tailwind.css` |
| Nav icons (Lucide, 20px, stroke 1.75, muted/cyan active) | `TopNavBar.tsx`, `HeaderAccountPopover.tsx`, `Sidebar/AccountMenuItem.tsx`, `SettingsDialog.tsx`, `GullySidebar.tsx` |
| Default theme (22px radius, ink widget background), wallet modal theme | `src/hooks/useTheme.ts`, `src/components/App/AppProviders.tsx` |
| Icons, logo, badges, mascots, share image (kit section 1, copied byte for byte) | `packages/app/public/brand/{logo,badges,mascots}/*`, `public/favicon-16|32.png`, `favicon.ico`, `apple-touch-icon.png`, `android-chrome-192|512.png`, `og-image.png`, written by `packages/app/scripts/brand-from-kit.mjs` |
| Head tags (kit section 2: favicons, `site.webmanifest`, theme colour, absolute OG image `https://bridge.gullychain.xyz/og-image.png`) | `packages/app/src/app/layout.tsx`, `packages/app/src/app/(bridge)/page.tsx`, `packages/app/public/site.webmanifest` |
| Chain accent colour (`bridgeUiConfig.color`, cyan) | the Gully Chain Testnet record in `src/util/orbitChainsData.json` |

Regenerate the brand assets with `node packages/app/scripts/brand-from-kit.mjs` (kit path defaults to
`C:/Users/Admin/Desktop/GULLY LABS GRAPHICS/Gully Chain/brand-kit`). Never resize, recompress, recolour or crop a kit
file: the script copies them byte for byte (the kit's done-check compares hashes).

## GullyChain bridge activity panel

`src/gully/activity/` (desktop: in the sidebar; phones: under the bridge panel). Live, read-only, no keys:

| Data | Source |
| --- | --- |
| Block height and gas price ticker (every 4 s) | `https://testnet-rpc.gullychain.xyz` (`eth_blockNumber` + `eth_gasPrice`, batched) |
| Deposits (Arbitrum Sepolia -> GullyChain): per-day chart, recent sizes chart, transfers list | `Bridge.MessageDelivered` + `Inbox.InboxMessageDelivered` on the public Arbitrum Sepolia RPC, read from block 322568124 in 50k-block chunks, cached in `localStorage`, topped up every 30 s. Kinds 12 (ETH deposit) and 9 (retryable: ETH, or token deposit with its gas funds) count; 3/11/13 do not. |
| Withdrawals (GullyChain -> Arbitrum Sepolia) in the transfers list | `ArbSys.L2ToL1Tx` on the GullyChain RPC |

The Gully indexer (`https://indexer.gullychain.xyz`, `/feed`, `/status`, `/head`) indexes L3 launches, trades, swaps and
wraps, but no bridge data, hence the RPC reads. Charts: Recharts 2.15.4 (MIT, pinned) in the panel, inline-SVG sparklines in the stat tiles; single series, no
legend, hover tooltips, animation off under `prefers-reduced-motion`; each chart has a visually hidden table with the
same values. One `GullyActivityProvider` (mounted in `Layout.tsx`) feeds every surface, so the chains are polled once.
Decoders and bucketing are pure functions in `bridgeActivity.ts` with unit tests (`bridgeActivity.test.ts`).

## How an Orbit chain is registered

The bridge learns about an Orbit chain (an L3 on Arbitrum Sepolia, or an L2 on Sepolia) from one record. Two
registration routes exist in this codebase; use the first for the real thing.

### 1. Permanent: `packages/arb-token-bridge-ui/src/util/orbitChainsData.json`

Add an object to the `testnet` array (later `mainnet`). This list feeds `orbitChainsList.ts`, which is consumed by
`initialization.ts` (registers each chain with `@arbitrum/sdk` via `registerCustomArbitrumNetwork`), by
`util/wagmi/getWagmiChain.ts` and `util/wagmi/setup.ts` (wallet chain list) and by `util/bridgeUiConfig.ts` (name, logo,
colour). Required values:

| Field | Meaning |
| --- | --- |
| `chainId` | The L3 chain id |
| `parentChainId` | Parent chain: must be one of `supportedCustomOrbitParentChains` in `util/networks.ts` (Arbitrum Sepolia `421614` for an L3 testnet) |
| `name`, `slug` | Display name and URL slug (`?destinationChain=<slug>`) |
| `rpcUrl`, `explorerUrl` | Public RPC and block explorer of the L3 |
| `isCustom: true`, `isTestnet: true` | Flags |
| `confirmPeriodBlocks` | Challenge period in parent-chain blocks |
| `ethBridge` | `bridge`, `inbox`, `outbox`, `rollup`, `sequencerInbox` core contracts on the parent chain |
| `tokenBridge` | `parent*` and `child*` addresses: `CustomGateway`, `Erc20Gateway`, `GatewayRouter`, `MultiCall`, `ProxyAdmin`, `Weth`, `WethGateway` |
| `nativeToken` | ERC-20 address on the parent chain if the chain uses a custom gas token, omitted for ETH |
| `bridgeUiConfig.color` | Accent colour for the chain (hex) |
| `bridgeUiConfig.network` | `name`, `logo` (file under `packages/app/public/images/`, use a Gully kit asset), optional `description` |
| `bridgeUiConfig.nativeTokenData` | `name`, `symbol`, `logoUrl` of the gas token, if custom |
| `bridgeUiConfig.fastWithdrawalTime` | Optional, only if a fast-withdrawal route is offered |

The contract addresses come from the Orbit deployment output (the `orbit-setup-script` / chain config JSON produced when
the L3 and its token bridge are deployed). Also needed: an RPC URL for the parent chain in `packages/app/.env.local`
(`NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA` or provider keys), and a WalletConnect project id.

Upstream's own chain-add flow is `.github/workflows/add-orbit-chain.yml`; its inputs are the same record.

### 2. Per-user, no code: custom chain in the UI

`AddCustomChain.tsx` stores a chain in `localStorage` under `arbitrum:custom:chains` (`util/networks.ts`,
`getCustomChainsFromLocalStorage`). Useful for testing the L3 before it is committed to `orbitChainsData.json`; the
object shape is the same as above (`ChainWithRpcUrl`).

### Local testing

`ChainId.L3Local` and `registerLocalNetwork()` register a Nitro testnode L3 (`NEXT_PUBLIC_RPC_URL_NITRO_TESTNODE_L3`)
outside production builds. They are upstream's test scaffolding; leave them alone.

## Merging upstream

`git fetch upstream && git merge upstream/master` into `gully/main`. The Gully changes are small edits to a handful of
upstream files plus new files under `src/gully/`, `packages/app/public/brand/` and `packages/app/scripts/`. Likely
conflict spots: `tailwind.config.js` (colour values), `Font.ts`, `layout.tsx`, `(bridge)/page.tsx`,
`Header.tsx`, `Button.tsx`, `TopNavBar.tsx`, `atoms/Toast.tsx` and the sidebar wrappers.
