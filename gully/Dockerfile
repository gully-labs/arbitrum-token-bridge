# Gully Bridge (fork of OffchainLabs/arbitrum-token-bridge), Next.js standalone server.
# Build context: repo root.  docker compose -f gully/compose.yaml up -d --build
FROM node:22-bookworm-slim AS build
WORKDIR /src
ENV NEXT_TELEMETRY_DISABLED=1 \
    CYPRESS_INSTALL_BINARY=0 \
    PUPPETEER_SKIP_DOWNLOAD=1
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ ca-certificates git \
 && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
COPY packages/app/package.json packages/app/
COPY packages/arb-token-bridge-ui/package.json packages/arb-token-bridge-ui/
COPY packages/scripts/package.json packages/scripts/
# --ignore-scripts skips the root chromium download (e2e only) and cypress; patch-package has no patches.
RUN yarn install --frozen-lockfile --ignore-scripts --network-timeout 600000

COPY . .
ARG WALLETCONNECT_PROJECT_ID=""
# Load the public build env, optionally add a WalletConnect id passed as a build arg, then build.
# Carriage returns are stripped first: a CRLF copy of testnet.env once inlined the WalletConnect id as "\r" (projectId=%0D).
# packages/app/next.config.js fails the build if a NEXT_PUBLIC_/GULLY_ value still holds one, or the id is malformed.
RUN tr -d '\r' < ./gully/testnet.env > /tmp/gully-build.env \
 && set -a && . /tmp/gully-build.env && set +a \
 && if [ -n "$WALLETCONNECT_PROJECT_ID" ]; then export NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="$WALLETCONNECT_PROJECT_ID"; fi \
 && export GULLY_STANDALONE=1 NODE_OPTIONS=--max-old-space-size=8192 \
 && yarn build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /src/packages/app/build/standalone ./
COPY --from=build --chown=node:node /src/packages/app/build/static ./packages/app/build/static
COPY --from=build --chown=node:node /src/packages/app/public ./packages/app/public
USER node
EXPOSE 3000
CMD ["node", "packages/app/server.js"]
