#!/usr/bin/env node
/* Brings the Gully Labs brand kit into the bridge app. Nothing brand-shaped is drawn by hand:
   every logo, icon and share image comes from the kit's own files through this script.

     node packages/app/scripts/brand-from-kit.mjs [path/to/Gully Labs]

   Kit (source of truth): C:\Users\Admin\Desktop\GRAPHICS\Gully Labs
   Writes into packages/app/public:
   - brand/        kit masters, byte for byte (horizontal lockup PNG, mascot bust, wordmark, icon master, tokens)
   - og-image.jpg  is made by og-from-kit.mjs from these masters
   - logo.png, icons: cut from the kit's icon master (telegram channel 640x640) by downscaling only, never upscaled */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const here = dirname(fileURLToPath(import.meta.url))
const pub = join(here, '..', 'public')
const ROOT = process.argv[2] || process.env.GULLY_BRAND_KIT || 'C:/Users/Admin/Desktop/GRAPHICS/Gully Labs'
const KIT = join(ROOT, 'design_handoff_gully_labs_brand_kit')
if (!existsSync(join(KIT, 'svg', 'gullylabs-wordmark-on-dark.svg'))) {
  console.error(`brand kit not found at ${ROOT} (pass the path, or set GULLY_BRAND_KIT)`)
  process.exit(2)
}

const out = join(pub, 'brand')
mkdirSync(out, { recursive: true })
const MASTERS = [
  ['svg/gullylabs-wordmark-on-dark.svg', 'gullylabs-wordmark-on-dark.svg'],
  // The lockup SVGs link their mascot PNG, which browsers refuse to load when an SVG is used as an <img>,
  // so the app uses the kit's transparent lockup PNGs instead. Same artwork, nothing linked.
  ['png/transparent/gullylabs-logo-horizontal-on-dark.png', 'gullylabs-logo-horizontal-on-dark.png'],
  ['png/transparent/gullylabs-mascot-bust.png', 'gullylabs-mascot-bust.png'],
  ['png/transparent/gullylabs-mascot-bust-2x.png', 'gullylabs-mascot-bust-2x.png'],
  ['png/transparent/gullylabs-wordmark-on-dark-2x.png', 'gullylabs-wordmark-on-dark-2x.png'],
  ['png/social/telegram/gullylabs-telegram-channel-640x640.png', 'gullylabs-mark-640.png'],
  ['tokens/tokens.css', 'tokens.css']
]
for (const [from, to] of MASTERS) copyFileSync(join(KIT, from), join(out, to))

const master = join(out, 'gullylabs-mark-640.png')
const png = (size) => sharp(master).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toBuffer()
const sizes = { 'logo.png': 512, 'icon-192.png': 192, 'apple-touch-icon.png': 180, 'favicon-32.png': 32, 'favicon-16.png': 16 }
for (const [name, size] of Object.entries(sizes)) writeFileSync(join(pub, name), await png(size))

// favicon.ico with PNG frames at 16, 32 and 48
const frames = await Promise.all([16, 32, 48].map(png))
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

console.log('brand assets written to', pub, '(run og-from-kit.mjs for og-image.jpg)')
