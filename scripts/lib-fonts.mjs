// Fetches subsetted woff2 fonts from Google Fonts and returns base64 @font-face CSS.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cacheDir = path.join(root, '.cache')
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
// Printable ASCII plus the middle dot and em dash used in copy.
export const CHARSET = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '·—├╰─│'

async function fetchBuf(url, headers = {}) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

export async function fontFace(family, weight) {
  fs.mkdirSync(cacheDir, { recursive: true })
  const key = `${family.replace(/\s+/g, '')}-${weight}-v3.woff2`
  const file = path.join(cacheDir, key)
  if (!fs.existsSync(file)) {
    const css = (await fetchBuf(
      `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(CHARSET)}`,
      { 'User-Agent': UA },
    )).toString()
    const m = css.match(/src:\s*url\(([^)]+)\)/)
    if (!m) throw new Error('no font url for ' + family)
    fs.writeFileSync(file, await fetchBuf(m[1]))
  }
  const b64 = fs.readFileSync(file).toString('base64')
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${b64}) format('woff2')}`
}
