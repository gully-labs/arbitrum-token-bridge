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
git archive --format=tar gully/testnet | ssh deploy@57.129.137.57 'rm -rf /srv/gully-bridge/src && mkdir -p /srv/gully-bridge/src && tar -x -C /srv/gully-bridge/src'
ssh deploy@57.129.137.57 'cd /srv/gully-bridge/src && docker compose -f gully/compose.yaml up -d --build'
```

A WalletConnect id can be passed at build without committing it: `WALLETCONNECT_PROJECT_ID=<id> docker compose -f
gully/compose.yaml up -d --build` (compose forwards it as a build arg). Without it the site offers browser wallets only.

## Branding layer (what the fork changes, and where)

| What | Where |
| --- | --- |
| Name, links, tagline, "Powered by Arbitrum" credit | `packages/arb-token-bridge-ui/src/gully/brand.ts` |
| Colours (kit tokens re-skin the upstream palette in place) | root `tailwind.config.js` (`theme.extend.colors`), CSS variables in `src/styles/tailwind.css` |
| Fonts (Barlow, Barlow Condensed, JetBrains Mono) | `src/components/common/Font.ts` (keeps the upstream export `unica` and variable `--font-unica77`) |
| Default theme (radius, widget background) | `src/hooks/useTheme.ts` |
| Wallet modal theme | `src/components/App/AppProviders.tsx` |
| Logos, icons, share image | `packages/app/public/brand/*` and `packages/app/public/*.png|ico|jpg`, written by `packages/app/scripts/brand-from-kit.mjs` from the Gully Labs brand kit |
| Page title, meta, Open Graph | `packages/app/src/app/layout.tsx`, `packages/app/src/app/(bridge)/page.tsx`, `packages/app/public/manifest.json` |

Regenerate the brand assets with `node packages/app/scripts/brand-from-kit.mjs` (kit path defaults to
`C:/Users/Admin/Desktop/GRAPHICS/Gully Labs`). Never redraw the logo: the script copies the kit masters byte for byte.

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
`Header.tsx` and the sidebar wrappers.
