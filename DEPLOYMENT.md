# Deployment

SpeakVault Website is a static site. It can be deployed from the repository root without a build step.

## GitHub Pages

1. Open the GitHub repository:
   `https://github.com/lay521tt-dotcom/speakvault-site`
2. Go to `Settings` -> `Pages`.
3. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
4. Save the settings.
5. Wait for GitHub Pages to publish the site.

The public URL will usually be:

```txt
https://lay521tt-dotcom.github.io/speakvault-site/
```

## Local Preview

Run:

```bash
npm start
```

Then open:

```txt
http://localhost:4173
```

You can also open `index.html` directly in a browser.
