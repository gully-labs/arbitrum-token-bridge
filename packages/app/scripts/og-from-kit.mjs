#!/usr/bin/env node
/* Composes the 1200x630 Open Graph image (public/og-image.jpg) from the Gully Labs brand kit, following the
   kit's CLAUDE_PROMPT.md hero recipe: navy radial background, faint 1px grid, gold glow behind the mascot,
   wordmark on the left, mascot bust on the right, tagline, then `gullylabs.xyz · @Gully_Labs` in mono gold.
   The wordmark and mascot are the kit's own transparent PNGs (public/brand, copied by brand-from-kit.mjs);
   the text is set in the kit's fonts (Barlow Condensed 700, Barlow 500, JetBrains Mono 500).

     node packages/app/scripts/og-from-kit.mjs <dir with BarlowCondensed.ttf, Barlow.ttf, JetBrainsMono.ttf> */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')
const satori = (await import('satori')).default

const here = dirname(fileURLToPath(import.meta.url))
const pub = join(here, '..', 'public')
const fontDir = process.argv[2]
if (!fontDir) {
  console.error('usage: og-from-kit.mjs <font dir>')
  process.exit(2)
}
const font = (file, name, weight) => ({ name, data: readFileSync(join(fontDir, file)), weight, style: 'normal' })
const uri = (f) => `data:image/png;base64,${readFileSync(join(pub, 'brand', f)).toString('base64')}`
const W = 1200
const H = 630

const h = (type, style, children, props = {}) => ({ type, props: { style: { display: 'flex', ...style }, children, ...props } })

// Kit background: radial navy, 1px grid at rgba(244,242,236,0.035) every 60px, gold glow behind the mascot.
const bg = h('div', {
  position: 'absolute', left: 0, top: 0, width: W, height: H,
  backgroundImage: 'radial-gradient(ellipse at 70% 40%, #1D2836 0%, #111923 50%, #0B1118 100%)'
}, [])
const grid = h('div', {
  position: 'absolute', left: 0, top: 0, width: W, height: H,
  backgroundImage: 'linear-gradient(rgba(244,242,236,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(244,242,236,0.035) 1px, transparent 1px)',
  backgroundSize: '60px 60px'
}, [])
const glow = h('div', {
  position: 'absolute', left: 640, top: 40, width: 560, height: 560,
  backgroundImage: 'radial-gradient(circle, rgba(217,181,99,0.16) 0%, rgba(217,181,99,0) 65%)'
}, [])
// bust-2x is 880x840: shown at 500x477
const bust = h('img', { position: 'absolute', left: 660, top: 100, width: 500, height: 477 }, [], { src: uri('gullylabs-mascot-bust-2x.png') })
// wordmark-2x aspect is read below
const meta = await sharp(join(pub, 'brand', 'gullylabs-wordmark-on-dark-2x.png')).metadata()
const wmW = 520
const wmH = Math.round((wmW * meta.height) / meta.width)
const wordmark = h('img', { position: 'absolute', left: 80, top: 96, width: wmW, height: wmH }, [], { src: uri('gullylabs-wordmark-on-dark-2x.png') })
const title = h('div', {
  position: 'absolute', left: 80, top: 96 + wmH + 40, fontFamily: 'Barlow Condensed', fontWeight: 700,
  fontSize: 132, lineHeight: 0.9, color: '#F4F2EC', textTransform: 'uppercase', letterSpacing: 1
}, 'Bridge')
const tag = h('div', {
  position: 'absolute', left: 80, top: 96 + wmH + 40 + 132 + 28, width: 520, fontFamily: 'Barlow', fontWeight: 500,
  fontSize: 30, lineHeight: 1.3, color: '#AEB5BE'
}, 'Move assets between a Gully chain and its parent chain.')
const url = h('div', {
  position: 'absolute', left: 80, top: 546, fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 24, color: '#D9B563'
}, 'gullylabs.xyz  ·  @Gully_Labs')

const tree = h('div', { position: 'relative', width: W, height: H, backgroundColor: '#0D141C' }, [bg, grid, glow, bust, wordmark, title, tag, url])
const svg = await satori(tree, {
  width: W, height: H,
  fonts: [font('BarlowCondensed.ttf', 'Barlow Condensed', 700), font('Barlow.ttf', 'Barlow', 500), font('JetBrainsMono.ttf', 'JetBrains Mono', 500)]
})
writeFileSync(join(pub, 'og-image.jpg'), await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer())
console.log('og-image.jpg written')
