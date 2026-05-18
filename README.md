# ai-pages

Static pages for GitHub Pages.

## Local preview

Run a minimal local server that mirrors the GitHub Pages project path:

```bash
npm run preview
```

Then open:

```text
http://localhost:4173/ai-pages/
```

Useful environment variables:

- `PORT=8080 npm run preview` changes the local port.
- `PAGES_BASE=/ npm run preview` serves the site from the domain root instead of `/ai-pages/`.

## Shared navigation

All pages load the shared navigation from `assets/site-nav.css` and `assets/site-nav.js`.
GitHub Pages serves these files as static assets, so the navigation works in the published site without a build step.
