// Generates every SVG and project image in assets/. Run: pnpm build:assets
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { fontFace } from './lib-fonts.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assets = path.join(root, 'assets')
const SITE = '/Users/samwilkie/Documents/Sam Wilkie/public/images'
const PORTRAIT = `${SITE}/profile/samuel-wilkie-portrait.webp`
fs.mkdirSync(path.join(assets, 'projects'), { recursive: true })

const RAMP = ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
const SHADES = 24
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const THEMES = {
  dark: {
    bg: '#000000', grid: 'rgba(255,0,0,0.10)', text: '#f5f5f5', sub: '#a3a3a3', dim: '#6b6b6b',
    red: '#ff0000', border: 'rgba(255,0,0,0.28)', band: '#ffffff', bandOpacity: 0.55,
  },
  light: {
    bg: '#ffffff', grid: 'rgba(0,0,0,0.05)', text: '#0a0a0a', sub: '#525252', dim: '#8a8a8a',
    red: '#ff0000', border: 'rgba(0,0,0,0.18)', band: '#000000', bandOpacity: 0.45,
  },
}

const fontCss = async () =>
  (await Promise.all([
    fontFace('Space Grotesk', 700),
    fontFace('Plus Jakarta Sans', 500),
    fontFace('IBM Plex Mono', 400),
    fontFace('IBM Plex Mono', 500),
    fontFace('IBM Plex Mono', 700),
  ])).join('\n')

const SANS = `'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif`
const HEAD = `'Space Grotesk','Plus Jakarta Sans',system-ui,sans-serif`
const MONO = `'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`

const sharedCss = (t) => `
.h{font-family:${HEAD};font-weight:700;letter-spacing:-0.04em;fill:${t.text}}
.b{font-family:${SANS};font-weight:500}
.m{font-family:${MONO};font-weight:400}
.red{fill:${t.red}}.sub{fill:${t.sub}}.dim{fill:${t.dim}}.fg{fill:${t.text}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
.cur{animation:blink 1.1s steps(1,end) infinite}
@media (prefers-reduced-motion:reduce){.cur{animation:none}}`

const gridPattern = (t) => `<pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${t.grid}" stroke-width="1"/></pattern>`

// ---------------------------------------------------------------- macOS window chrome (shared)
const WIN_PADX = 40, WIN_PADT = 24, WIN_PADB = 56, WIN_TB = 44
const winColors = (light) => light
  ? { win: '#ffffff', edge: '#e5e5e5', panel: '#ffffff', bar: '#f3f3f3', tbar: '#ececec', tedge: '#d0d0d0', wedge: 'rgba(0,0,0,0.22)', ttl: '#6e6e73', shadow: 'rgba(0,0,0,0.30)', key: '#737373', dot: '#d4d4d4', ins: '#262626' }
  : { win: '#0b0b0c', edge: '#1f1f1f', panel: '#050505', bar: '#0f0f0f', tbar: '#2a2a2c', tedge: '#000000', wedge: 'rgba(255,255,255,0.14)', ttl: '#a1a1a6', shadow: 'rgba(0,0,0,0.85)', key: '#8a8a8a', dot: '#3a3a3a', ins: '#e5e5e5' }

// Shadow filter, clip, window body, title bar, border, traffic lights and title.
// Opens a <g> translated by the canvas padding; the caller closes it with </g>.
const windowChrome = (c, light, WW, WH, title) => `<filter id="ws" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="${c.shadow}" flood-opacity="${light ? 0.55 : 1}"/></filter>
<clipPath id="wc"><rect width="${WW}" height="${WH}" rx="12"/></clipPath>
<g transform="translate(${WIN_PADX} ${WIN_PADT})">
<rect width="${WW}" height="${WH}" rx="12" fill="${c.win}" filter="url(#ws)"/>
<g clip-path="url(#wc)"><rect width="${WW}" height="${WIN_TB}" fill="${c.tbar}"/><path d="M0 ${WIN_TB - 0.5}H${WW}" stroke="${c.tedge}"/></g>
<rect x="0.5" y="0.5" width="${WW - 1}" height="${WH - 1}" rx="11.5" fill="none" stroke="${c.wedge}"/>
<circle cx="22" cy="22" r="6" fill="#FF5F57" stroke="#E0443E" stroke-width="0.6"/><circle cx="42" cy="22" r="6" fill="#FEBC2E" stroke="#DEA123" stroke-width="0.6"/><circle cx="62" cy="22" r="6" fill="#28C840" stroke="#1AAB29" stroke-width="0.6"/>
<text x="${WW / 2}" y="27" text-anchor="middle" class="b" font-size="13.5" fill="${c.ttl}">${title}</text>`

// ---------------------------------------------------------------- banner
async function banner(name, t) {
  const light = name === 'light'
  const c = winColors(light)
  const WW = 1200, BH = 316, WH = WIN_TB + BH
  const W = WW + WIN_PADX * 2, H = WH + WIN_PADT + WIN_PADB
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Sam Wilkie, Full-Stack Developer and SaaS Builder">
<title>Sam Wilkie - Full-Stack Developer &amp; SaaS Builder</title>
<defs><style>${await fontCss()}${sharedCss(t)}</style>${gridPattern(t)}</defs>
${windowChrome(c, light, WW, WH, 'sam \u2014 zsh \u2014 120\u00d724')}
<g clip-path="url(#wc)"><g transform="translate(0 ${WIN_TB})">
<rect width="${WW}" height="${BH}" fill="${t.bg}"/>
<rect width="${WW}" height="${BH}" fill="url(#g)"/>
<rect x="60" y="40" width="48" height="4" fill="${t.red}"/>
<text x="60" y="80" class="m sub" font-size="18">sam@wilkiedevs:~$ whoami</text>
<text x="56" y="184" class="h" font-size="104">Sam Wilkie</text>
<text x="60" y="224" class="b fg" font-size="26">Full-Stack Developer &amp; SaaS Builder</text>
<text x="60" y="254" class="b sub" font-size="18">Founder of Wilkie Devs · Creator of Lookitry</text>
<text x="60" y="282" class="m dim" font-size="15">Cali, Colombia</text>
<text x="${WW - 60}" y="282" text-anchor="end" class="m dim" font-size="15">~/sam $</text>
<rect class="cur" x="${WW - 52}" y="268" width="11" height="18" fill="${t.red}"/>
</g></g>
</g>
</svg>`
  fs.writeFileSync(path.join(assets, `banner-${name}.svg`), svg)
}

// ---------------------------------------------------------------- portrait
async function portraitData() {
  const COLS = 120, ROWS = 120, CELL = 4
  const src = sharp(PORTRAIT)
  // Character grid: object-fit contain, same as the site's canvas sampling.
  const { data } = await src.clone().resize(COLS, ROWS, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'mitchell' })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const luma = new Float32Array(COLS * ROWS)
  for (let i = 0; i < COLS * ROWS; i++) {
    const p = i * 4
    if (data[p + 3] < 100) { luma[i] = -1; continue }
    const l = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255
    luma[i] = Math.min(1, Math.pow(l, 1.1) * 1.08)
  }
  // Depth layer: grayscale(1) brightness(0.42) contrast(1.25), baked to match the CSS filter chain.
  const S = COLS * CELL
  const big = await src.clone().resize(S, S, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha().raw().toBuffer()
  const dim = Buffer.alloc(S * S * 4), dimInv = Buffer.alloc(S * S * 4)
  for (let i = 0; i < S * S; i++) {
    const p = i * 4
    const l = (0.2126 * big[p] + 0.7152 * big[p + 1] + 0.0722 * big[p + 2]) / 255
    const v = Math.min(1, Math.max(0, (l * 0.42 - 0.5) * 1.25 + 0.5))
    const c = Math.round(v * 255), ci = Math.round((0.86 + 0.1 * l) * 255)
    dim[p] = dim[p + 1] = dim[p + 2] = c; dim[p + 3] = big[p + 3]
    dimInv[p] = dimInv[p + 1] = dimInv[p + 2] = ci; dimInv[p + 3] = big[p + 3]
  }
  const toWebp = async (buf) => (await sharp(buf, { raw: { width: S, height: S, channels: 4 } }).webp({ quality: 72 }).toBuffer()).toString('base64')
  return { COLS, ROWS, CELL, S, luma, dark: await toWebp(dim), light: await toWebp(dimInv) }
}

// Logo scenes: rasterized onto the same COLS x ROWS grid as the portrait.
const LOGO_DIR = '/Users/samwilkie/Documents/Sam Wilkie/public'
const LOGO_SRC = {
  wilkie: `${LOGO_DIR}/images/logos/Wilkie-devs-light.svg`,
  claude: `${LOGO_DIR}/images/tech/claude.svg`,
}
async function logoData(kind, COLS = 120, ROWS = 120, FILL = 100) {
  let img = sharp(LOGO_SRC[kind], { density: 600 })
  if (kind === 'wilkie') {
    // keep only the aperture + heart mark (left ~30% of the wordmark artwork)
    const meta = await img.clone().metadata()
    img = sharp(await img.clone().extract({ left: 0, top: 0, width: Math.round(meta.width * 0.31), height: meta.height }).png().toBuffer())
  }
  const trimmed = await sharp(await img.png().toBuffer()).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 }).png().toBuffer()
  const { data } = await sharp(trimmed).resize(FILL, FILL, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
    .extend({ top: Math.floor((ROWS - FILL) / 2), bottom: Math.ceil((ROWS - FILL) / 2), left: Math.floor((COLS - FILL) / 2), right: Math.ceil((COLS - FILL) / 2), background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const luma = new Float32Array(COLS * ROWS), red = new Uint8Array(COLS * ROWS)
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const i = y * COLS + x, q = i * 4
    const a = data[q + 3] / 255
    if (a < 0.25) { luma[i] = -1; continue }
    const isRed = data[q] > 110 && data[q + 1] < 70 && data[q + 2] < 80
    // light from the top-left plus a gentle radial falloff gives the flat mark some depth
    const dx = x / COLS - 0.5, dy = y / ROWS - 0.5
    const lit = 1 - (dx + dy + 1) / 2 * 0.55 - Math.hypot(dx, dy) * 0.5
    luma[i] = Math.max(0.12, Math.min(1, a * (0.35 + 0.75 * lit)))
    if (kind === 'wilkie' && isRed) { red[i] = 1; luma[i] = Math.max(0.5, luma[i]) }
    if (kind === 'claude') red[i] = 1
  }
  return { COLS, ROWS, luma, red, noInvert: true }
}

function portraitChars(p, light, id = 's') {
  const { COLS, ROWS, CELL = 4, luma } = p
  const top = RAMP.length - 1
  const half = CELL / 2
  const rowsByShade = Array.from({ length: SHADES * 2 }, () => new Map()) // [0,SHADES) grey, [SHADES,2*SHADES) red
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let l = luma[y * COLS + x]
      if (l < 0) continue
      if (light && !p.noInvert) l = 1 - l // positive photo on white: dark areas get dense ink
      if (l < 0.04) continue
      const s = Math.min(SHADES - 1, Math.floor(l * SHADES))
      if (s < 1) continue
      const k = s / (SHADES - 1)
      const ch = RAMP[Math.round(k * top)]
      if (ch === ' ') continue
      const m = rowsByShade[s + (p.red?.[y * COLS + x] ? SHADES : 0)]
      if (!m.has(y)) m.set(y, { xs: [], cs: '' })
      const r = m.get(y)
      r.xs.push(x * CELL + half); r.cs += esc(ch)
    }
  }
  let out = '', css = ''
  for (let s = 1; s < SHADES; s++) {
    const k = s / (SHADES - 1)
    let g = Math.round(55 + Math.pow(k, 1.25) * 200)
    let fill = `rgb(${g},${g},${Math.min(255, g + 4)})`
    if (light) { const d = 255 - g; fill = `rgb(${Math.max(0, d - 20)},${Math.max(0, d - 20)},${d - 16 < 0 ? 0 : d - 16})` }
    css += `.s${s}{fill:${fill}}.r${s}{fill:#ff0000;fill-opacity:${(light ? 0.62 + 0.38 * k : 0.4 + 0.6 * k).toFixed(2)}}`
    for (const [cls, idx] of [['s', s], ['r', s + SHADES]]) {
      for (const [y, r] of rowsByShade[idx]) {
        out += `<text class="${cls}${s}" y="${(y * CELL + half).toFixed(1)}" x="${r.xs.join(' ')}">${r.cs}</text>`
      }
    }
  }
  return { out, css }
}

// 15s cycle: 3 scenes x (4s hold + 1s dissolve). Percentages are of 15s (1s = 6.667%).
function sceneCss(scanH) {
  // out: 4 -> 5s (26.67% -> 33.33%); in: 9 -> 10 and so on
  const out = (a) => `${a}%{opacity:1;filter:blur(0);transform:none}${(a + 1.6).toFixed(2)}%{opacity:.72;filter:blur(1.5px);transform:translateX(-4px)}${(a + 3).toFixed(2)}%{opacity:.4;filter:blur(3px);transform:translateX(5px)}${(a + 4.6).toFixed(2)}%{opacity:.14;filter:blur(5px);transform:translateX(-3px)}${(a + 6.67).toFixed(2)}%{opacity:0;filter:blur(7px);transform:none}`
  const inn = (a) => `${a}%{opacity:0;filter:blur(7px);transform:none}${(a + 1.6).toFixed(2)}%{opacity:.18;filter:blur(5px);transform:translateX(4px)}${(a + 3).toFixed(2)}%{opacity:.5;filter:blur(3px);transform:translateX(-5px)}${(a + 4.6).toFixed(2)}%{opacity:.85;filter:blur(1.5px);transform:translateX(3px)}${(a + 6.67).toFixed(2)}%{opacity:1;filter:blur(0);transform:none}`
  return `.a0,.a1,.a2{animation-duration:15s;animation-iteration-count:infinite;animation-timing-function:linear}
.a1,.a2{opacity:0}
.a0{animation-name:k0}.a1{animation-name:k1}.a2{animation-name:k2}
@keyframes k0{0%{opacity:1;filter:blur(0);transform:none}${out(26.67)}93.33%{opacity:0;filter:blur(7px)}${inn(93.33).replace(/^93\.33%\{[^}]*\}/, '')}}
@keyframes k1{0%,26.67%{opacity:0}${inn(26.67).replace(/^26\.67%\{[^}]*\}/, '')}${out(60)}100%{opacity:0}}
@keyframes k2{0%,60%{opacity:0}${inn(60).replace(/^60%\{[^}]*\}/, '')}93.33%{opacity:1;filter:blur(0);transform:none}${out(93.33).replace(/^93\.33%\{[^}]*\}/, '')}}
@keyframes lab0{0%,29.9%{opacity:1}30%,96.6%{opacity:0}96.7%,100%{opacity:1}}
@keyframes lab1{0%,29.9%{opacity:0}30%,63.2%{opacity:1}63.3%,100%{opacity:0}}
@keyframes lab2{0%,63.2%{opacity:0}63.3%,96.6%{opacity:1}96.7%,100%{opacity:0}}
.f0,.f1,.f2{animation-duration:15s;animation-iteration-count:infinite;animation-timing-function:step-end}
.f0{animation-name:lab0}.f1{animation-name:lab1;opacity:0}.f2{animation-name:lab2;opacity:0}
@keyframes scan{0%,26.67%{opacity:0;transform:translateY(0)}27.5%{opacity:1}33.2%{opacity:1;transform:translateY(${scanH}px)}33.3%,60%{opacity:0;transform:translateY(0)}60.83%{opacity:1}66.5%{opacity:1;transform:translateY(${scanH}px)}66.67%,93.33%{opacity:0;transform:translateY(0)}94.17%{opacity:1}99.9%{opacity:1;transform:translateY(${scanH}px)}100%{opacity:0;transform:translateY(0)}}
.scan{animation:scan 15s linear infinite}`
}

// ---------------------------------------------------------------- hero ("vim profile.yml" window)
const YAML = [
  [0, 'profile', null], [1, 'name', 'Sam Wilkie'], [1, 'role', 'Full-Stack Developer & SaaS Builder'],
  [1, 'origin', 'Cali, Colombia'], [1, 'company', 'Wilkie Devs (founder)'], [1, 'product', 'Lookitry (creator)'],
  [1, 'focus', 'AI products · Agentic workflows · MCP tooling'], [1, 'experience', '7+ years in production'],
  [0, 'stack', null], [1, 'frontend', 'TypeScript · React · Next.js'], [1, 'backend', 'Node.js · Express · Python · PostgreSQL'],
  [1, 'ai', 'Claude API · MCP · n8n'], [1, 'infra', 'Docker · Azure · Cloudflare'],
  [0, 'contact', null], [1, 'web', 'sam.wilkiedevs.com'], [1, 'linkedin', '/in/sam-wilkie'], [1, 'github', 'depper-IA'],
]

async function hero(name, t, p, logos) {
  const light = name === 'light'
  const WW = 1200, WH = 720
  const W = WW + WIN_PADX * 2, H = WH + WIN_PADT + WIN_PADB
  const c = winColors(light)
  const TB = WIN_TB, HH = 52, FH = 44, SBH = 36, PAD = 24
  const PY = TB + 28, PH = WH - PY - 28
  const LX = 28, LW = 480, RX = LX + LW + 24, RW = WW - 28 - RX
  const { out, css } = portraitChars(p, light)
  const wk = portraitChars({ ...p, ...logos.wilkie }, light), cl = portraitChars({ ...p, ...logos.claude }, light)
  const scan0 = PY + HH, scanH = PH - HH - FH
  const labels = ['SRC portrait.webp \u00b7 CALI/CO', 'SRC wilkie-devs.svg \u00b7 WILKIE DEVS', 'SRC claude.svg \u00b7 AI / AGENTIC']
  // left panel: portrait scaled into the area between header and footer
  const area = PH - HH - FH, PS = 400, sc = PS / p.S
  const px = LX + LW / 2 - PS / 2, py = PY + HH + (area - PS) / 2
  const br = (x, y, dx, dy) => `<path d="M${x} ${y + dy * 14}V${y}H${x + dx * 14}" fill="none" stroke="${t.red}" stroke-width="1.5"/>`
  const bx0 = LX + 18, bx1 = LX + LW - 18, by0 = PY + HH + 18, by1 = PY + PH - FH - 18
  const brackets = br(bx0, by0, 1, 1) + br(bx1, by0, -1, 1) + br(bx0, by1, 1, -1) + br(bx1, by1, -1, -1)
  // right panel: YAML
  const FS = 15.5, CW = FS * 0.6, LH = 28.5, GX = RX + 56, TX = RX + 74, Y0 = PY + HH + 39
  const STEP = 0.12, TYPE_END = (YAML.length * STEP + 0.4).toFixed(2)
  let lines = ''
  YAML.forEach(([ind, k, v], i) => {
    const y = (Y0 + i * LH).toFixed(1), x = TX + ind * 2 * CW
    const key = ind === 0 ? `<tspan fill="${t.red}" fill-opacity="0.85">${k}:</tspan>` : `<tspan fill="${c.key}">${k}:</tspan>`
    const val = v ? `<tspan x="${(x + (k.length + 2) * CW).toFixed(1)}" fill="${t.text}">${esc(v)}</tspan>` : ''
    lines += `<g class="ln" style="animation-delay:${(i * STEP).toFixed(2)}s"><text class="m" x="${GX}" y="${y}" text-anchor="end" font-size="13" fill="${t.dim}">${i + 1}</text><text class="m" x="${x}" y="${y}" font-size="${FS}">${key}${val}</text></g>`
  })
  const last = YAML[YAML.length - 1]
  const cx = TX + (last[0] * 2 + last[1].length + 2 + last[2].length) * CW + 4
  const cy = Y0 + (YAML.length - 1) * LH
  const SY = PY + PH - SBH
  const nL = YAML.length
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Sam Wilkie, Full-Stack Developer and SaaS Builder in Cali, Colombia. Profile shown as a vim profile.yml window next to an ASCII portrait.">
<title>Sam Wilkie - vim profile.yml</title>
<defs><style>${await fontCss()}${sharedCss(t)}
.m{font-weight:500}
.pt text{font-family:${MONO};font-weight:500;font-size:${p.CELL * 1.12}px;text-anchor:middle;dominant-baseline:central}
${css}
@keyframes sweep{0%{transform:translate(-160px,-110px)}70%,100%{transform:translate(640px,430px)}}
.sweep{animation:sweep 8s linear infinite}
${sceneCss(scanH)}
@keyframes type{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
.ln,.cw{animation:type .35s ease-out both}
.cw{animation-delay:${TYPE_END}s}
@keyframes insOut{0%,99%{opacity:1}100%{opacity:0}}
@keyframes norIn{from{opacity:0}to{opacity:1}}
.ins{animation:insOut ${TYPE_END}s linear forwards}
.nor{animation:norIn .01s linear ${TYPE_END}s both}
@media (prefers-reduced-motion:reduce){.sweep{animation:none;opacity:0}.a0{animation:none;opacity:1;filter:none;transform:none}.a1,.a2,.f1,.f2,.scan{animation:none;opacity:0}.f0{animation:none;opacity:1}.ln,.cw,.nor{animation:none}.ins{animation:none;opacity:0}}
</style>
<linearGradient id="band" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="180" y2="120">
<stop offset="0.30" stop-color="${t.band}" stop-opacity="0"/><stop offset="0.5" stop-color="${t.band}" stop-opacity="${t.bandOpacity}"/><stop offset="0.70" stop-color="${t.band}" stop-opacity="0"/></linearGradient>
<filter id="white" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
<g id="sc0" class="pt">${out}</g><g id="sc1" class="pt">${wk.out}</g><g id="sc2" class="pt">${cl.out}</g>
<linearGradient id="trail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.red}" stop-opacity="0"/><stop offset="1" stop-color="${t.red}" stop-opacity="0.22"/></linearGradient>
<mask id="chars" maskUnits="userSpaceOnUse" x="0" y="0" width="${p.S}" height="${p.S}"><g filter="url(#white)"><use href="#sc0" class="a0"/><use href="#sc1" class="a1"/><use href="#sc2" class="a2"/></g></mask>
<clipPath id="lp"><rect x="${LX}" y="${PY}" width="${LW}" height="${PH}" rx="8"/></clipPath>
<clipPath id="rp"><rect x="${RX}" y="${PY}" width="${RW}" height="${PH}" rx="8"/></clipPath>
</defs>
${windowChrome(c, light, WW, WH, 'sam \u2014 vim profile.yml \u2014 120\u00d734')}

<rect x="${LX + 0.5}" y="${PY + 0.5}" width="${LW - 1}" height="${PH - 1}" rx="8" fill="${c.panel}" stroke="${c.edge}"/>
<text x="${LX + PAD}" y="${PY + 32}" class="m fg" font-size="13" font-weight="500" letter-spacing="1.5">VISUAL.MAP</text>
<text x="${LX + LW - PAD}" y="${PY + 32}" text-anchor="end" class="m dim" font-size="12" letter-spacing="1">ASCII / 24-SHADE</text>
<path d="M${LX + 1} ${PY + HH}H${LX + LW - 1}" stroke="${c.edge}"/>
<g clip-path="url(#lp)"><g transform="translate(${px.toFixed(1)} ${py}) scale(${sc.toFixed(4)})">
<g class="a0"><image href="data:image/webp;base64,${p[name]}" width="${p.S}" height="${p.S}"/><use href="#sc0"/></g>
<use href="#sc1" class="a1"/><use href="#sc2" class="a2"/>
<g mask="url(#chars)"><rect class="sweep" x="-900" y="-900" width="2400" height="2400" fill="url(#band)"/></g>
</g></g>
<g clip-path="url(#lp)"><g class="scan" opacity="0"><rect x="${LX}" y="${scan0 - 28}" width="${LW}" height="28" fill="url(#trail)"/><rect x="${LX}" y="${scan0}" width="${LW}" height="2" fill="${t.red}"/></g></g>
${brackets}
<path d="M${LX + 1} ${PY + PH - FH}H${LX + LW - 1}" stroke="${c.edge}"/>
${labels.map((l, i) => `<g class="f${i}"><text x="${LX + PAD}" y="${PY + PH - 17}" class="m dim" font-size="12">${l}</text></g>`).join('')}

<rect x="${RX + 0.5}" y="${PY + 0.5}" width="${RW - 1}" height="${PH - 1}" rx="8" fill="${c.panel}" stroke="${c.edge}"/>
<text x="${RX + PAD}" y="${PY + 32}" class="m fg" font-size="14" font-weight="500">profile.yml</text>
<text x="${RX + PAD + 11 * 8.4 + 10}" y="${PY + 32}" class="m dim" font-size="11" letter-spacing="1">[YAML]</text>
<rect x="${RX + RW - PAD - 108}" y="${PY + 15}" width="108" height="22" rx="11" fill="none" stroke="${t.red}" stroke-opacity="0.8"/>
<text x="${RX + RW - PAD - 54}" y="${PY + 30}" text-anchor="middle" class="m red" font-size="12">@depper-IA</text>
<path d="M${RX + 1} ${PY + HH}H${RX + RW - 1}" stroke="${c.edge}"/>
${lines}
<g class="cw"><rect class="cur" x="${cx.toFixed(1)}" y="${(cy - 13).toFixed(1)}" width="${CW.toFixed(1)}" height="18" fill="${t.red}"/></g>
<g clip-path="url(#rp)"><rect x="${RX}" y="${SY}" width="${RW}" height="${SBH}" fill="${c.bar}"/></g>
<path d="M${RX + 1} ${SY}H${RX + RW - 1}" stroke="${c.edge}"/>
<rect class="ins" x="${RX + 1}" y="${SY + 1}" width="92" height="${SBH - 1}" fill="${c.ins}"/>
<text class="m ins" x="${RX + 46}" y="${SY + 23}" text-anchor="middle" font-size="12" letter-spacing="1" fill="${light ? '#ffffff' : '#000000'}">INSERT</text>
<rect class="nor" x="${RX + 1}" y="${SY + 1}" width="92" height="${SBH - 1}" fill="${t.red}"/>
<text class="m nor" x="${RX + 46}" y="${SY + 23}" text-anchor="middle" font-size="12" letter-spacing="1" fill="#ffffff">NORMAL</text>
<text x="${RX + 110}" y="${SY + 23}" class="m fg" font-size="12">profile.yml</text>
<text x="${RX + 198}" y="${SY + 23}" class="m dim" font-size="12">[utf-8]</text>
<text x="${RX + RW - PAD}" y="${SY + 23}" text-anchor="end" class="m sub" font-size="12" xml:space="preserve">${nL}L  100%  ${nL}:1</text>
</g>
</svg>`
  fs.writeFileSync(path.join(assets, `hero-${name}.svg`), svg)
}

// ---------------------------------------------------------------- typing headline
const PHRASES = [
  'Sam Wilkie \u2014 Full-Stack Developer & SaaS Builder',
  'Founder of Wilkie Devs \u00b7 Creator of Lookitry',
  'AI Products \u00b7 Agentic Workflows \u00b7 MCP Tooling',
  'Building from Cali, Colombia for the world',
]
async function typing(name, t) {
  const W = 900, H = 60, FS = 26, CW = FS * 0.6
  const TYPE = 0.065, ERASE = 0.03, HOLD = 1.9, GAP = 0.35
  const dur = PHRASES.map((s) => [...s].length * TYPE + HOLD + [...s].length * ERASE + GAP)
  const total = dur.reduce((a, b) => a + b, 0)
  const pc = (x) => ((x / total) * 100).toFixed(3)
  let css = '', body = ''
  let t0 = 0
  PHRASES.forEach((ph, i) => {
    const n = [...ph].length, w = n * CW, x0 = (W - w) / 2
    const tIn = t0 + 0.0001, tFull = t0 + n * TYPE, tHold = tFull + HOLD, tOut = tHold + n * ERASE
    // clip width: steps(n) while typing and erasing, held between
    css += `@keyframes w${i}{0%{width:0}${pc(tIn)}%{width:0;animation-timing-function:steps(${n},end)}${pc(tFull)}%{width:${w.toFixed(1)}px}${pc(tHold)}%{width:${w.toFixed(1)}px;animation-timing-function:steps(${n},end)}${pc(tOut)}%{width:0}100%{width:0}}`
    css += `@keyframes c${i}{0%,${pc(Math.max(0, tIn - 0.01))}%{opacity:0;transform:translateX(0)}${pc(tIn)}%{opacity:1;transform:translateX(0);animation-timing-function:steps(${n},end)}${pc(tFull)}%{opacity:1;transform:translateX(${w.toFixed(1)}px)}${pc(tHold)}%{opacity:1;transform:translateX(${w.toFixed(1)}px);animation-timing-function:steps(${n},end)}${pc(tOut)}%{opacity:1;transform:translateX(0)}${pc(tOut + GAP - 0.01)}%{opacity:1}${pc(tOut + GAP)}%,100%{opacity:0;transform:translateX(0)}}`
    css += `.w${i}{width:0;animation:w${i} ${total.toFixed(2)}s linear infinite}.c${i}{opacity:0;animation:c${i} ${total.toFixed(2)}s linear infinite}`
    body += `<clipPath id="k${i}"><rect class="w${i}" x="${x0.toFixed(1)}" y="0" height="${H}"/></clipPath><g clip-path="url(#k${i})"><text class="tx t${i}" x="${x0.toFixed(1)}" y="39" font-size="${FS}" xml:space="preserve">${esc(ph)}</text></g>`
    body += `<g class="c${i}"><rect class="blk" x="${(x0 + 1).toFixed(1)}" y="12" width="3" height="34" fill="${t.red}"/></g>`
    t0 += dur[i]
  })
  const w0 = [...PHRASES[0]].length * CW
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(PHRASES.join('. '))}">
<title>${esc(PHRASES.join(' | '))}</title>
<defs><style>${await fontCss()}
.tx{font-family:${MONO};font-weight:700;fill:${t.red}}
${css}
@keyframes bl{0%,49%{opacity:1}50%,100%{opacity:0}}
.blk{animation:bl 1s steps(1,end) infinite}
@media (prefers-reduced-motion:reduce){.w0{animation:none;width:${w0.toFixed(1)}px}.w1,.w2,.w3,.c0,.c1,.c2,.c3{animation:none;opacity:0}.c0{opacity:0}.blk{animation:none}}
</style></defs>
${body}
</svg>`
  fs.writeFileSync(path.join(assets, `typing-${name}.svg`), svg)
}

// ---------------------------------------------------------------- stack
const STACK = [
  ['ai_models_agents', [['claude', 'Claude'], ['openai', 'OpenAI'], ['gemini', 'Gemini'], ['mcp', 'MCP'], ['kiro', 'Kiro'], ['opencode', 'OpenCode']]],
  ['automation', [['n8n', 'n8n'], ['make', 'Make'], ['mqtt', 'MQTT'], ['microsoft', 'Microsoft 365']]],
  ['frontend', [['typescript', 'TypeScript'], ['react', 'React'], ['nextjs', 'Next.js'], ['vuejs', 'Vue.js'], ['tailwindcss', 'Tailwind'], ['gsap', 'GSAP'], ['threejs', 'Three.js']]],
  ['backend_data', [['nodejs', 'Node.js'], ['express', 'Express'], ['python', 'Python'], ['php', 'PHP'], ['postgresql', 'PostgreSQL'], ['prisma', 'Prisma'], ['supabase', 'Supabase'], ['sqlite', 'SQLite']]],
  ['cloud_devops', [['gcp', 'Google Cloud'], ['aws-white', 'AWS'], ['azure', 'Azure'], ['firebase', 'Firebase'], ['docker', 'Docker'], ['vercel', 'Vercel'], ['sentry', 'Sentry']]],
  ['messaging', [['twilio', 'Twilio'], ['resend', 'Resend'], ['telegram', 'Telegram']]],
  ['hardware_iot', [['c', 'C'], ['esp32', 'ESP32']]],
  ['crm', [['kommo', 'Kommo CRM'], ['zoho', 'Zoho CRM'], ['gohighlevel', 'GoHighLevel']]],
].map(([l, items]) => [l, items.filter(([f]) => fs.existsSync(path.join(assets, 'tech', `${f}.svg`)) || (console.log('missing icon, skipped:', f), false))])

const WIDE = { zoho: 46 }

// Greedy word wrap on " · " separators; mono width is 0.6em.
function wrapNames(names, maxChars) {
  const lines = []
  let cur = ''
  for (const n of names) {
    const next = cur ? `${cur} · ${n}` : n
    if (cur && next.length > maxChars) { lines.push(cur + ' ·'); cur = n } else cur = next
  }
  if (cur) lines.push(cur)
  return lines
}

async function stack(name, t) {
  const light = name === 'light'
  const ink = light ? '#0a0a0a' : '#f5f5f5'
  const tileFill = light ? '#f4f4f4' : '#141414', tileStroke = light ? '#e5e5e5' : '#222222'
  const boxStroke = light ? '#d4d4d4' : '#2a2a2a', cellStroke = light ? '#e5e5e5' : '#1f1f1f'
  const chipFill = light ? '#f4f4f4' : '#0d0d0d'
  const W = 1200, PAD = 20, GAP = 16, HEAD_H = 60, FOOT_H = 52
  const CW = (W - PAD * 2 - GAP) / 2
  const CP = 18, CHIP_H = 28, TILE = 56, TG = 10, ICON = 28, FS = 13, CHAR = FS * 0.6, LH = 20
  const maxChars = Math.floor((CW - CP * 2) / CHAR)
  const cells = STACK.map(([label, items], i) => ({ label, items, lines: wrapNames(items.map((x) => x[1]), maxChars), last: i === STACK.length - 1 }))
  const rows = [0, 1, 2, 3].map((r) => Math.max(...cells.slice(r * 2, r * 2 + 2).map((c) => c.lines.length)))
  const cellH = rows.map((l) => CP + CHIP_H + 14 + TILE + 14 + l * LH + CP - 4)
  const gridTop = HEAD_H + PAD
  const gridH = cellH.reduce((a, b) => a + b, 0) + GAP * 3
  const H = gridTop + gridH + PAD + FOOT_H
  const chip = (x, y, text, spans) => {
    const w = Math.round(text.length * 8.4 + 24)
    return `<rect x="${x}" y="${y}" width="${w}" height="${CHIP_H}" rx="6" fill="${chipFill}" stroke="${tileStroke}"/><text x="${x + 12}" y="${y + 18.5}" class="m" font-size="14" fill="${t.sub}" xml:space="preserve">${spans}</text>`
  }
  let body = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${t.bg}" stroke="${boxStroke}"/>`
  body += chip(PAD, (HEAD_H - CHIP_H) / 2 + 2, 'sam@wilkiedevs:~$ cat tech-stack.yaml', `sam@wilkiedevs:~<tspan fill="${t.red}">$</tspan> <tspan fill="${ink}">cat tech-stack.yaml</tspan>`)
  body += `<line x1="0" y1="${HEAD_H}" x2="${W}" y2="${HEAD_H}" stroke="${cellStroke}"/>`
  cells.forEach((c, i) => {
    const r = Math.floor(i / 2), col = i % 2
    const x = PAD + col * (CW + GAP)
    const y = gridTop + rows.slice(0, r).reduce((a, _, k) => a + cellH[k], 0) + r * GAP
    body += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${CW - 1}" height="${cellH[r] - 1}" rx="10" fill="none" stroke="${cellStroke}"/>`
    const tree = c.last ? '╰─' : '├─'
    body += chip(x + CP, y + CP, `${tree} * ${c.label}:`, `<tspan fill="${t.red}">${tree}</tspan> <tspan fill="${t.red}">*</tspan> <tspan fill="${ink}">${esc(c.label)}:</tspan>`)
    const ty = y + CP + CHIP_H + 14
    c.items.forEach(([file], k) => {
      const raw = fs.readFileSync(path.join(assets, 'tech', `${file}.svg`), 'utf8')
      const vb = (raw.match(/<svg[^>]*viewBox="([^"]+)"/) || [])[1] || '0 0 24 24'
      const fr = /<svg[^>]*fill-rule="evenodd"/.test(raw) ? ' fill-rule="evenodd"' : ''
      const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>[\s\S]*?<\/title>/, '')
      const tx = x + CP + k * (TILE + TG)
      const sz = WIDE[file] || ICON, off = (TILE - sz) / 2
      body += `<rect x="${tx + 0.5}" y="${ty + 0.5}" width="${TILE - 1}" height="${TILE - 1}" rx="12" fill="${tileFill}" stroke="${tileStroke}"/>`
      body += `<svg x="${tx + off}" y="${ty + off}" width="${sz}" height="${sz}" viewBox="${vb}" fill="${ink}"${fr}>${inner}</svg>`
    })
    c.lines.forEach((ln, k) => { body += `<text x="${x + CP}" y="${ty + TILE + 14 + 14 + k * LH}" class="m" font-size="${FS}" fill="${t.sub}">${esc(ln)}</text>` })
  })
  const fy = H - FOOT_H
  body += `<line x1="0" y1="${fy}" x2="${W}" y2="${fy}" stroke="${cellStroke}"/>`
  body += `<text x="${PAD + 4}" y="${fy + 31}" class="m" font-size="14" fill="${t.dim}" xml:space="preserve">status: <tspan fill="${ink}">ready</tspan>  ·  environment: <tspan fill="${ink}">production</tspan></text>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc('Tech stack: ' + STACK.map(([l, it]) => l + ': ' + it.map((x) => x[1]).join(', ')).join('; '))}">
<title>Tech stack</title>
<defs><style>${await fontCss()}${sharedCss(t)}</style></defs>
${body}
</svg>`
  fs.writeFileSync(path.join(assets, `stack-${name}.svg`), svg)
}

// ---------------------------------------------------------------- project images
async function projects() {
  const names = ['lookitry', 'rendertry', 'nexus', 'atlas', 'gmcapital', 'kommokiropower', 'margaritatank', 'espetralrescue', 'grietasvivas']
  for (const n of names) {
    // Local override (assets/src/<name>.webp) wins over the portfolio screenshot
    const local = path.join(assets, 'src', `${n}.webp`)
    const f = fs.existsSync(local) ? local : `${SITE}/projects/${n}.webp`
    if (!fs.existsSync(f)) { console.log('missing source image:', n); continue }
    // Corners are baked into the image (transparent) because GitHub strips CSS border-radius
    const mask = Buffer.from('<svg width="800" height="500"><rect width="800" height="500" rx="24" ry="24"/></svg>')
    await sharp(f).resize({ width: 800, height: 500, fit: "cover", position: f === local ? "centre" : "top" })
      .composite([{ input: mask, blend: 'dest-in' }])
      .webp({ quality: 80, alphaQuality: 100 }).toFile(path.join(assets, 'projects', `${n}.webp`))
  }
}

const p = await portraitData()
const logos = { wilkie: await logoData('wilkie', 120, 120, 58), claude: await logoData('claude', 120, 120, 58) }
for (const [n, t] of Object.entries(THEMES)) { await banner(n, t); await hero(n, t, p, logos); await typing(n, t); await stack(n, t) }
await projects()
for (const f of fs.readdirSync(assets)) if (f.endsWith('.svg')) console.log(f, (fs.statSync(path.join(assets, f)).size / 1024).toFixed(0) + 'KB')
