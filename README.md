# SpeakVault Website

This folder is the standalone public website for SpeakVault.

The old web app has been archived separately. This project is now the active website project and should be developed,
committed, and deployed on its own.

## Structure

- `index.html` - public website homepage
- `styles.css` - website styling
- `assets/product-preview.svg` - product visual used by the homepage
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

- Website: public positioning, product explanation, examples, practice paths, and early-access calls to action.
- Not included in this website: login, Supabase sync, OpenAI calls, private user libraries, or authenticated app flows.
