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

List pages should not show "view source" actions. Keep card actions reader-facing: open the page/article, and optionally jump to the related topic index.

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

## Shared Component Usage

The site should feel mostly flat and editorial. Use color, spacing, borders, and typography for hierarchy; avoid adding large shadows, strong gradients, glossy surfaces, hover lift effects, or 3D-looking blocks.

Use `.card` for repeated comparable items. If several adjacent cards represent different categories, preserve semantic color variation with `.tag`, `.tag green`, `.tag orange`, `.tag purple`, or `.tag red`. These classes intentionally add subtle card color cues through the shared stylesheet. Do not flatten them back to one color unless the cards are truly equivalent.

For dense repeated card groups where tag semantics alone are not enough, use the shared six-color rotation pattern from `assets/site-nav.css`. Add one body-level page class, then scope rotation rules to that page class in shared CSS. Current examples include `system-judgment-page`, `knowledge-map-page`, and `bipartite-matching-page`. The rotation palette is intentionally soft and flat:

- teal: `#2f6f68` / `#f2faf7`
- green: `#5f7f55` / `#fbfef9`
- orange: `#9f5a2f` / `#fff7ed`
- purple: `#76527f` / `#fcf9fd`
- red: `#9f4d3f` / `#fff8f5`
- blue-gray: `#596f86` / `#f6f8fa`

Do not use brown as the first rotation color for multi-card groups; it blends too easily into the warm paper background. Keep rotation effects flat: light background tint plus a solid top border/color bar is enough.

Use `.quote` or native `blockquote` for key judgments, short conclusions, or memorable claims. Both share the same highlighted quote style. Avoid plain paragraphs for important pull quotes such as "核心结论" takeaways.

Use `.summary`, `.note`, `.warning` / `.warn`, `.good`, and `.example` for callouts with distinct meaning:

- `.summary`: compact conclusion or executive summary
- `.note`: neutral explanation or learning reminder
- `.warning` / `.warn`: risk, limitation, or caveat
- `.good`: positive pattern or recommended direction
- `.example`: concrete example

Use `.bad` and `.good` together for shallow/deeper understanding, wrong/right, or weak/strong comparison blocks. Both must keep visible solid borders so the compare layout feels consistent.

Use `pre > code` for code snippets and `pre` or `.diagram` for monospace diagrams. Use `.formula` for math/modeling expressions, and `.formula formula-block` when the expression is long and should wrap. Do not style code blocks locally; shared CSS handles inline `code`, `pre`, `pre code`, `.code`, `.codebox`, `.diagram`, and `.formula`.

Use `.map-line` with `.node` and `.arrow` for flow diagrams. Nodes should remain flat: solid soft background, border, no shadows or gradients.

Use `.score` for compact table judgments such as "高", "中", or "低". Scores should be text emphasis only, without solid background blocks.

When a single article needs page-specific card coloring, prefer adding one body-level page class and writing scoped shared CSS rules, rather than reintroducing a local `<style>` block.

## Page Style Guidance

Keep page-local styles focused on layout, spacing, typography, and article-specific components. Avoid page-local color systems unless the shared theme cannot express the need.

Do not add strong blue, purple, or multicolor gradient page headers. List pages and article pages should sit on the same warm background so navigation between pages does not produce a visible color flash.

### Article Hero

Article hero areas should use the shared `.hero` component as the first article block. The canonical article hero shape is:

```html
<section class="hero">
  <div class="eyebrow">...</div>
  <h1>...</h1>
  <p class="intro">...</p>
  <div class="meta"><span class="tag">...</span></div>
</section>
```

For new pages, use `.intro` for the hero description and `.meta` for hero tags/dates. Older `.subtitle` and `.tags` are normalized by shared CSS, but should not be introduced in new pages.

Do not add page-local hero spacing, title sizing, tag layout, or color rules. Shared CSS already normalizes direct `.hero` blocks, `main > header > .hero`, and older `main.page > section.hero` structures. If all article hero spacing needs adjustment, update the shared hero rules in `assets/site-nav.css`.

### Article TOC

Use `.article-toc` for article-level tables of contents when a page has several major sections:

```html
<nav class="article-toc" aria-label="文章目录">
  <a href="#sec1">一、...</a>
  <a href="#sec2">二、...</a>
</nav>
```

Place `.article-toc` immediately after the hero/header and before summary, note, intro, or other post-hero callouts. For pages containing `.article-toc`, shared CSS uses a two-column article grid: left column for hero/content, right column for the TOC. The TOC starts aligned with the hero and then sticks while scrolling.

Do not combine `.article-toc` with the legacy `.toc` class, wrap it in `.card`, or add page-local TOC offsets. On narrower viewports, `assets/site-nav.js` clones `.article-toc` links into the shared mobile TOC drawer; keep the article's `.article-toc` as the single source of truth.

If a page needs repeated content blocks, prefer `.card`, `.section`, `.mini`, or `.box` instead of inventing new surface styles.

Article pages should read as separate content blocks, not one large document surface with a single background. Prefer a `hero` plus `summary` / `card` sections over wrapping the whole article in one prominent `.doc` container.

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
