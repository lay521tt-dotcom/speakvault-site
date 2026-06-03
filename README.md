# SpeakVault Website

SpeakVault is a shareable English study workspace for intensive listening, dictation records, phrase mining, and AI writing feedback.

The old web app has been archived separately. This project is developed and deployed as its own site.

## Structure

- `index.html` - study workspace UI
- `styles.css` - visual design and responsive layout
- `app.js` - local records, filters, subtitles, phrase vault, and AI feedback UI
- `api/analyze-writing.js` - Vercel serverless endpoint for AI text feedback
- `content/corpus.json` - scenario-based listening library
- `PRODUCT.md` - product requirements and schema
- `assets/audio/` - optional local audio files referenced by `audioSrc`
- `site.webmanifest` - install/display metadata

## Local Preview

Run:

```bash
npm start
```

Then visit:

```txt
http://localhost:4173
```

The static UI can be opened directly from `index.html`, but the AI endpoint requires Vercel or another serverless runtime.

## Vercel Environment Variables

Set these in the Vercel project:

```txt
ANTHROPIC_API_KEY=...
SPEAKVAULT_ACCESS_CODE=...
```

Optional:

```txt
ANTHROPIC_MODEL=claude-sonnet-4-6
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1/messages
ANTHROPIC_VERSION=2023-06-01
```

You can also use `.env.example` as the import template. Put real values into Vercel only; do not commit a filled `.env` file.

## Product Boundary

- Included: listening library, scenario/difficulty filters, dictation notes, hidden subtitles, expression mining, phrase vault, local practice records, AI writing feedback.
- Data storage: browser `localStorage` for each user/device.
- AI protection: shared access code for family/friends; Anthropic API key stays server-side.
- Not included in V1: login, cloud sync, uploads, AI pronunciation correction, speech scoring, realtime voice, user management, or licensed external corpus workflow.
