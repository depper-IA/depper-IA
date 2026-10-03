// Renders README.md to preview.html with GitHub markdown styling (dark). Run: pnpm exec node scripts/build-preview.mjs
import fs from 'node:fs'
import { marked } from 'marked'
const body = marked.parse(fs.readFileSync('README.md', 'utf8'), { gfm: true })
fs.writeFileSync('preview.html', `<!doctype html><html data-theme="dark"><head><meta charset="utf-8"><meta name="color-scheme" content="dark">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.6.1/github-markdown-dark.css">
<style>body{background:#0d1117;margin:0;padding:32px}.markdown-body{max-width:880px;margin:0 auto;padding:32px;border:1px solid #30363d;border-radius:6px}</style></head>
<body><article class="markdown-body">${body}</article></body></html>`)
