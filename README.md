# CleanText

**by WaweUp** — https://cleantext.waweup.com

Remove invisible and unwanted characters from your text. Everything runs
client-side; text is never sent to a server.

## Features

- Auto-detects issues as you paste: zero-width characters, non-breaking
  spaces, unusual spaces, extra spaces, hidden Unicode, line-break issues,
  trailing whitespace
- Toggleable cleaning options (zero-width, space normalization, hidden
  Unicode on by default; line breaks and line-ending trim off by default)
- Copy the cleaned text or download it as `.txt`
- Per-codepoint breakdown of removed characters (`U+200B Zero Width Space × 2`)

## Stack

- Next.js (App Router) + React, TypeScript
- Geist / Geist Mono
- Plain CSS styled after ReUI (Hero 10 reference), neutral palette

## Development

```bash
npm install
npm run dev
```

## Deployment

Independent Vercel project. `npm run build` produces a fully static page —
no server-side processing of user text.
