# Deployment

SpeakVault Shareable V1 should be deployed on Vercel because the app now includes a serverless AI endpoint.

## Vercel

1. Connect the GitHub repository:
   `https://github.com/lay521tt-dotcom/speakvault-site`
2. Create or select the Vercel project.
3. Use the repository root as the project root.
4. No build command is required.
5. Add environment variables:

```txt
OPENAI_API_KEY=...
SPEAKVAULT_ACCESS_CODE=...
```

Optional:

```txt
OPENAI_MODEL=gpt-4.1-mini
```

6. Deploy to production.

## Acceptance Checks

- Production URL loads the study workspace.
- `content/corpus.json`, `styles.css`, `app.js`, favicon, manifest, and social preview assets return `200`.
- `POST /api/analyze-writing` rejects missing or wrong access code.
- `POST /api/analyze-writing` returns structured feedback when the correct access code and OpenAI key are configured.
- `OPENAI_API_KEY` does not appear in browser source, static files, or network responses.

## Local Preview

Run:

```bash
npm start
```

Then open:

```txt
http://localhost:4173
```

Local static preview does not execute the Vercel serverless function.
