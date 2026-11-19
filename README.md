# TypingOcto

Free typing tutor: 100 lessons, WPM typing tests, practice modes, a weekly challenge and Inky the octopus. Live at <https://typingocto.com> (GitHub Pages).

## Build & deploy

```bash
node tools/build.js   # generates typingocto/ (pages, blog, sitemap.xml, blog/feed.xml, robots.txt)
node tools/check.js   # technical SEO + safety checks (fails on errors)
```

Every push to `main` runs `.github/workflows/deploy.yml`: build → checks → publish `typingocto/` to the `gh-pages` branch (the GitHub Pages source) → live smoke test. `tools/deploy.sh` still works for manual deploys.

## Blog

- Hand-written articles: `tools/articles.js`.
- Articles approved in **TypingOcto SEO Intelligence** (`Yian2/typingocto-seo`): `content/blog/<slug>.json`, committed automatically on their scheduled date, only after explicit human approval. The build validates them (slug, required fields, no unsafe HTML) and renders them as static, indexable pages with canonical, Open Graph, JSON-LD, breadcrumbs, categories, search and RSS.

## Analytics events (GA4)

`typing_start` (mode, lesson), `typing_complete` (mode, wpm, accuracy, lesson), `share`, `blog_cta_click` (link_url, article). GA4 loads only after cookie consent.

## Optional Google sign-in

Set `CONFIG.FIREBASE` in `typingocto/assets/core.js` to the public Firebase web config to show a "Sign in" button that syncs progress to Firestore (`users/{uid}`). With `null`, the site works in guest mode only (localStorage), as before.
