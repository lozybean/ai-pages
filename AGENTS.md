# AGENTS.md

## Project Shape

This repository is a static GitHub Pages site. There is no build step, templating engine, or server-side include support in production.

GitHub Pages will serve `.html`, `.css`, and `.js` files as static assets. Shared HTML fragments will not be expanded automatically, so shared UI should be implemented with browser-loaded CSS and JavaScript.

## Local Preview

Use the minimal preview server when checking changes:

```bash
npm run preview
```

Default URL:

```text
http://127.0.0.1:4173/ai-pages/
```

The `/ai-pages/` base path intentionally mirrors the GitHub Pages project site path. Use `PAGES_BASE=/ npm run preview` only when testing root-hosted behavior.

## Shared Navigation

All pages should load the shared navigation assets:

```html
<link rel="stylesheet" href="assets/site-nav.css" />
<script src="assets/site-nav.js" defer></script>
```

Adjust the relative prefix by page depth:

- Root pages: `assets/site-nav.css`, `assets/site-nav.js`
- Pages under `pages/`: `../assets/site-nav.css`, `../assets/site-nav.js`
- Pages under `topics/<topic>/`: `../../assets/site-nav.css`, `../../assets/site-nav.js`

`assets/site-nav.js` creates the global nav in the browser. If a page still has an old top-level `.site-nav`, the script replaces it. If not, the script prepends the shared nav to `body`.

When adding nav items, edit only the `links` array in `assets/site-nav.js`. Keep the nav focused on site navigation; do not add per-article links such as source-code links.

Avoid page-local back links near the top of articles when the shared nav already provides the same route. They tend to look inconsistent across older pages.

## Shared Theme

The visual theme lives in `assets/site-nav.css`. Despite the filename, this file is also the shared site theme.

The current theme follows the warm "思考专题" palette:

- Background: warm paper, `#f7f4ee`
- Content surfaces: `#fffdf8`
- Accent: brown, `#8a5a35`
- Soft accent: `#f1e5d7`
- Borders: `#e4dbcf`

Prefer using the shared CSS variables instead of hard-coded page colors:

```css
var(--bg)
var(--paper)
var(--ink)
var(--muted)
var(--line)
var(--accent)
var(--accent-soft)
```

The shared theme intentionally overrides common legacy classes such as `.hero`, `.card`, `.section`, `.toc a`, `.tag`, `.date`, `.badge`, `.note`, `.summary`, `.warning`, `.good`, `.example`, `.formula`, `blockquote`, `code`, `pre`, and `.diagram`.

When creating a new page, reuse these class names where possible. That lets the shared theme normalize older and newer pages without copying large CSS blocks.

`assets/site-nav.css` also owns common layout and article/list components:

- Page shells: `.wrap`, `.page`, `.container`, `.doc`
- Headings and article rhythm: `h1`, `h2`, `h3`, `p`, `ul`, `ol`, `li`
- List-page cards: `.section-title`, `.grid`, `.card-head`, `.desc`, `.meta`, `.actions`, `.button`, `.primary`, `.secondary`
- Article components: `.toc`, `.quote`, `.notice`, `.box`, `.mini`, `.mini-card`, `.compare`, `.grid-2`, `.grid2`, `.grid3`, `.summary-grid`
- Data/code blocks: `table`, `th`, `td`, `.formula`, `.code`, `.codebox`, `pre`, `code`

For index and topic-list pages, prefer no page-local `<style>` block at all. Load the shared CSS/JS, then use the shared classes directly.

For article pages, page-local CSS is acceptable only for article-specific diagrams, unusual layouts, or one-off components. Do not duplicate the shared shell, card, button, table, tag, note, quote, or code-block rules unless the article genuinely needs a different structure.

## Page Style Guidance

Keep page-local styles focused on layout, spacing, typography, and article-specific components. Avoid page-local color systems unless the shared theme cannot express the need.

Do not add strong blue, purple, or multicolor gradient page headers. List pages and article pages should sit on the same warm background so navigation between pages does not produce a visible color flash.

If a page needs a header area, prefer:

```html
<section class="hero">
  <h1>...</h1>
  <p class="intro">...</p>
</section>
```

If a page needs repeated content blocks, prefer `.card`, `.section`, `.mini`, or `.box` instead of inventing new surface styles.

## Adding New Pages

When adding a new page:

1. Add the shared nav CSS and JS with the correct relative path.
2. Use the shared theme variables for colors.
3. Avoid local `.site-nav` markup.
4. Avoid top-of-page "back" links that duplicate shared navigation.
5. Update `index.html` and any relevant topic index.
6. Run `npm run preview` and open the page under `/ai-pages/`.
7. Check that CSS and JS load with `200 OK`.

Useful checks:

```bash
rg -n "assets/site-nav" -g "*.html"
node --check assets/site-nav.js
curl -I http://127.0.0.1:4173/ai-pages/assets/site-nav.css
curl -I http://127.0.0.1:4173/ai-pages/assets/site-nav.js
```

## GitHub Pages Compatibility

Safe:

- Relative links to local CSS and JS assets
- Browser-side DOM rendering from `assets/site-nav.js`
- Static HTML pages under nested folders
- Directory URLs that resolve to `index.html`

Not safe:

- HTML includes that require server-side processing
- Assuming GitHub Pages will rewrite relative asset paths
- Depending on a local Node server feature that is not present in static hosting
