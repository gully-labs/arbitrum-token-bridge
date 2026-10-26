#!/usr/bin/env node
/* Brings the GullyChain brand kit into the bridge app. Nothing is resized, recompressed, recoloured or
   cropped: every file is copied byte for byte, as the kit's CLAUDE_PROMPT.md requires.

     node packages/app/scripts/brand-from-kit.mjs [path/to/brand-kit]

   Kit (source of truth): C:\Users\Admin\Desktop\GULLY LABS GRAPHICS\Gully Chain\brand-kit (read CLAUDE_PROMPT.md, tokens.json)
   Writes into packages/app/public (kit section 1):
   - favicon-16.png, favicon-32.png, apple-touch-icon.png, android-chrome-192.png, android-chrome-512.png, og-image.png
   - brand/logo/*, brand/badges/*, brand/mascots/*
   - favicon.ico (the kit's own 16 and 32px PNG frames, no resampling)
   - images/GullyChainLogo.png  the chain logo referenced by orbitChainsData.json (the kit's transparent icon)
   - brand/tokens.css           the kit's design tokens (tokens.json), verbatim */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pub = join(here, '..', 'public')
const KIT =
  process.argv[2] ||
  process.env.GULLY_BRAND_KIT ||
  'C:/Users/Admin/Desktop/GULLY LABS GRAPHICS/Gully Chain/brand-kit'
if (!existsSync(join(KIT, 'tokens.json'))) {
  console.error(`GullyChain brand kit not found at ${KIT} (pass the path, or set GULLY_BRAND_KIT)`)
  process.exit(2)
}

for (const dir of ['brand/logo', 'brand/badges', 'brand/mascots', 'images']) {
  mkdirSync(join(pub, dir), { recursive: true })
}

const COPIES = [
  ['icon/favicon-16.png', 'favicon-16.png'],
  ['icon/favicon-32.png', 'favicon-32.png'],
  ['icon/apple-touch-icon-180.png', 'apple-touch-icon.png'],
  ['icon/android-chrome-192.png', 'android-chrome-192.png'],
  ['icon/gullychain-icon-dark-512.png', 'android-chrome-512.png'],
  ['icon/gullychain-icon-transparent-512.png', 'brand/gullychain-icon-transparent-512.png'],
  ['icon/gullychain-icon-transparent-512.png', 'images/GullyChainLogo.png'],
  ['og/og-image-1200x630.png', 'og-image.png']
]
for (const dir of ['logo', 'badges', 'mascots']) {
  for (const file of readdirSync(join(KIT, dir))) COPIES.push([`${dir}/${file}`, `brand/${dir}/${file}`])
}
for (const [from, to] of COPIES) copyFileSync(join(KIT, from), join(pub, to))

// Design tokens (kit section 3, from tokens.json). Mirrored in src/styles/tailwind.css and tailwind.config.js.
const tokens = JSON.parse(readFileSync(join(KIT, 'tokens.json'), 'utf8'))
const c = tokens.colors
writeFileSync(
  join(pub, 'brand', 'tokens.css'),
  `:root{
  --gc-night:${c.night}; --gc-ink:${c.ink}; --gc-blue:${c.blue};
  --gc-cyan:${c.cyan};  --gc-green:${c.green}; --gc-white:${c.white}; --gc-muted:${c.muted};
  --gc-chain-gradient:${c.chainGradient};
  --gc-font:'${tokens.font.family}',system-ui,sans-serif;
}
`
)

// favicon.ico with the kit's own 16 and 32px PNG frames (PNG-in-ICO, no resampling).
const frames = [16, 32].map(s => readFileSync(join(KIT, 'icon', `favicon-${s}.png`)))
const head = Buffer.alloc(6)
head.writeUInt16LE(1, 2)
head.writeUInt16LE(frames.length, 4)
let offset = 6 + 16 * frames.length
const dirs = frames.map((buf, i) => {
  const e = Buffer.alloc(16)
  const s = [16, 32][i]
  e[0] = s
  e[1] = s
  e.writeUInt16LE(1, 4)
  e.writeUInt16LE(32, 6)
  e.writeUInt32LE(buf.length, 8)
  e.writeUInt32LE(offset, 12)
  offset += buf.length
  return e
})
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([head, ...dirs, ...frames]))

console.log('GullyChain brand assets written to', pub)
