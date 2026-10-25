#!/usr/bin/env node
/* Brings the GullyChain brand kit (v2, Blue Crown logo) into the bridge app. Nothing brand-shaped is drawn
   by hand: every icon, mascot and share image is the kit's own file, copied byte for byte. The wordmark is
   live text (Poppins 800, gradient "Chain") in src/gully/GullySidebar.tsx, as the kit asks.

     node packages/app/scripts/brand-from-kit.mjs [path/to/gullychain-brand-kit-v2]

   Kit (source of truth): C:\Users\Admin\Desktop\GRAPHICS\gullychain-brand-kit-v2 (read CLAUDE_PROMPT.md there)
   Writes into packages/app/public:
   - brand/gc-icon-192.png, brand/gc-icon-512.png     kit icon, transparent (dark backgrounds only, never recoloured)
   - brand/gc-mascot-05-rapid-transaction.png         pose 05 on its dark ground, for speed/settlement messaging
   - brand/gc-mascot-05-rapid-transaction-cut.png     the kit's transparent cutout of the same pose
   - brand/tokens.css                                 the kit's design tokens, verbatim
   - favicon-16|32|48|180|192|512.png, apple-touch-icon.png, favicon.ico, icon-192.png, logo.png
   - images/GullyChainLogo.png                        the chain logo referenced by orbitChainsData.json
   - og-image.png                                     the kit's default Open Graph image */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pub = join(here, '..', 'public')
const KIT =
  process.argv[2] ||
  process.env.GULLY_BRAND_KIT ||
  'C:/Users/Admin/Desktop/GRAPHICS/gullychain-brand-kit-v2'
if (!existsSync(join(KIT, 'logos', 'icon-1024.png'))) {
  console.error(`GullyChain brand kit not found at ${KIT} (pass the path, or set GULLY_BRAND_KIT)`)
  process.exit(2)
}

const out = join(pub, 'brand')
mkdirSync(out, { recursive: true })
mkdirSync(join(pub, 'images'), { recursive: true })

const COPIES = [
  ['favicons/favicon-192.png', 'brand/gc-icon-192.png'],
  ['favicons/favicon-512.png', 'brand/gc-icon-512.png'],
  ['mascot/05-rapid-transaction.png', 'brand/gc-mascot-05-rapid-transaction.png'],
  ['mascot/transparent/05-rapid-transaction-transparent.png', 'brand/gc-mascot-05-rapid-transaction-cut.png'],
  ['favicons/favicon-16.png', 'favicon-16.png'],
  ['favicons/favicon-32.png', 'favicon-32.png'],
  ['favicons/favicon-48.png', 'favicon-48.png'],
  ['favicons/favicon-180.png', 'favicon-180.png'],
  ['favicons/favicon-192.png', 'favicon-192.png'],
  ['favicons/favicon-512.png', 'favicon-512.png'],
  ['favicons/apple-touch-icon-180.png', 'apple-touch-icon.png'],
  ['favicons/favicon-192.png', 'icon-192.png'],
  ['favicons/favicon-512.png', 'logo.png'],
  ['favicons/favicon-192.png', 'images/GullyChainLogo.png'],
  ['og/og-1200x630.png', 'og-image.png']
]
for (const [from, to] of COPIES) copyFileSync(join(KIT, from), join(pub, to))

// Design tokens, exactly as CLAUDE_PROMPT.md section 2 lists them (also mirrored in src/styles/tailwind.css).
writeFileSync(
  join(out, 'tokens.css'),
  `:root {
  --gc-black:    #000000;  /* Void Black: page ground */
  --gc-night:    #0A0F1A;  /* cards, surfaces */
  --gc-line:     #16213A;  /* 1px borders */
  --gc-royal:    #1567F9;  /* Royal Blue: gradient start, secondary action */
  --gc-electric: #0F89F7;  /* Electric Blue: gradient mid */
  --gc-cyan:     #01D9FA;  /* Cyan: primary accent, CTAs */
  --gc-indigo:   #2E36F7;  /* Indigo: base of the icon gradient */
  --gc-text:     #FFFFFF;
  --gc-muted:    #9FB3CC;
  --gc-up:       #2E7D32;
  --gc-down:     #C0392B;
  --gc-chain-gradient: linear-gradient(90deg,#1567F9 0%,#0F89F7 35%,#01D9FA 100%);
  --gc-icon-gradient: linear-gradient(180deg,#01D9F9 0%,#2E36F7 100%);
  --gc-radius-card: 22px;
  --gc-radius-pill: 9999px;
}
`
)

// favicon.ico with the kit's own 16, 32 and 48px PNG frames (PNG-in-ICO, no resampling).
const frames = [16, 32, 48].map(s => readFileSync(join(KIT, 'favicons', `favicon-${s}.png`)))
const head = Buffer.alloc(6)
head.writeUInt16LE(1, 2)
head.writeUInt16LE(frames.length, 4)
let offset = 6 + 16 * frames.length
const dirs = frames.map((buf, i) => {
  const e = Buffer.alloc(16)
  const s = [16, 32, 48][i]
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
