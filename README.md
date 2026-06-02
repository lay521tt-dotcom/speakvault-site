# SpeakVault Website

This folder is the standalone static site for SpeakVault.

The old web app has been archived separately. This project is now a first-version personal English study workspace and
should be developed, committed, and deployed on its own.

## Structure

- `index.html` - public website homepage
- `styles.css` - website styling
- `app.js` - lightweight static interaction for selecting corpus scenarios
- `content/corpus.json` - seed corpus data using the schema in `PRODUCT.md`
- `PRODUCT.md` - product requirements and corpus schema
- `assets/product-preview.svg` - archived product visual from the earlier public-page concept
- `assets/favicon.svg` - browser tab icon
- `assets/og-image.svg` - social sharing preview image
- `site.webmanifest` - basic install/display metadata

## Local Preview

Open `index.html` directly in a browser, or run:

```bash
npm start
```

Then visit:

```txt
http://localhost:4173
```

## Deployment

This is a static site and can be deployed directly from the repository root.

Recommended first deployment: GitHub Pages. See `DEPLOYMENT.md`.

Before publishing, preview the site locally and confirm the homepage, stylesheet, favicon, manifest, and social preview
asset all return `200`.

## Product Boundary

- Website: static personal study workspace for listening, shadowing, scenario-based corpus cards, and a sample phrase vault.
- Tone: simple, elegant, and calm, closer to a study desk than a SaaS landing page.
- Content model: scenario cards with Chinese thought, natural English, polished English, culture note, tags, audio slot, and vault phrases. See `PRODUCT.md` and `content/corpus.json`.
- Interaction model: client-side scenario selection only; no persistence or account state.
- Not included in this v1: login, Supabase sync, OpenAI calls, uploads, private user libraries, speech scoring, or persistent phrase saving.
