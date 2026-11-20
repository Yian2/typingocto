// Technical SEO + safety checks on the built site. Fails (exit 1) so a broken build is never deployed.
// Usage: node tools/check.js
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'typingocto');
const SITE = 'https://typingocto.com';
const errors = [], warnings = [];
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) files.push(p); } })(OUT);

const sitemap = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const inSitemap = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
const titles = new Map(), descs = new Map();
const get = (html, re) => (html.match(re) || [])[1];

for (const file of files) {
  const rel = path.relative(OUT, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const title = get(html, /<title>([^<]*)<\/title>/);
  const desc = get(html, /<meta name="description" content="([^"]*)"/);
  const canonical = get(html, /<link rel="canonical" href="([^"]+)"/);
  if (!title) errors.push(`${rel}: missing <title>`);
  if (!desc) errors.push(`${rel}: missing meta description`);
  if (!canonical) errors.push(`${rel}: missing canonical`);
  if (!/<html lang="/.test(html)) errors.push(`${rel}: missing lang`);
  if (!/property="og:title"/.test(html) || !/property="og:image"/.test(html)) errors.push(`${rel}: missing Open Graph tags`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1 && !['lesson.html'].includes(rel)) warnings.push(`${rel}: ${(html.match(/<h1[\s>]/g) || []).length} h1`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { errors.push(`${rel}: invalid JSON-LD`); } }
  if (!noindex) {
    if (titles.has(title)) errors.push(`${rel}: duplicated title with ${titles.get(title)}`); else titles.set(title, rel);
    if (descs.has(desc)) warnings.push(`${rel}: duplicated description with ${descs.get(desc)}`); else descs.set(desc, rel);
    if (canonical && !inSitemap.has(canonical) && !['lesson.html', 'progress.html'].includes(rel)) errors.push(`${rel}: indexable page not in sitemap (${canonical})`);
  }
  if (rel.startsWith('blog/') && rel !== 'blog/index.html') {
    if (noindex) errors.push(`${rel}: blog article is noindex`);
    if (!/"@type":"Article"/.test(html)) errors.push(`${rel}: missing Article structured data`);
    if (!/"@type":"BreadcrumbList"/.test(html)) errors.push(`${rel}: missing breadcrumbs`);
    // The article text must be in the HTML (no JS needed to see it)
    const text = (get(html, /<article class="article">([\s\S]*?)<\/article>/) || '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    if (text < 250) errors.push(`${rel}: only ${text} words of server-rendered text`);
    const body = get(html, /<article class="article">([\s\S]*?)<\/article>/) || '';
    if (/<script|\son[a-z]+=|javascript:/i.test(body)) errors.push(`${rel}: unsafe markup inside the article`);
  }
  // internal links point to files that exist
  for (const m of html.matchAll(/href="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const h = m[1];
    if (/^(https?:|mailto:|\/\/)/.test(h) || h.endsWith('.css') || h.endsWith('.webmanifest') || /\.(png|svg|xml|ico)$/.test(h)) continue;
    let target = h.startsWith('/') ? path.join(OUT, h) : path.join(path.dirname(file), h);
    if (h.endsWith('/') || fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) errors.push(`${rel}: broken internal link ${h}`);
  }
}
for (const loc of inSitemap) {
  const rel = loc.replace(SITE + '/', '') || 'index.html';
  const f = path.join(OUT, rel.endsWith('/') || rel === '' ? rel + 'index.html' : rel);
  if (!fs.existsSync(f)) errors.push(`sitemap: ${loc} does not exist`);
  else if (/<meta name="robots" content="noindex/.test(fs.readFileSync(f, 'utf8'))) errors.push(`sitemap: ${loc} is noindex`);
}
const robots = fs.readFileSync(path.join(OUT, 'robots.txt'), 'utf8');
if (!/Sitemap: https:\/\/typingocto\.com\/sitemap\.xml/.test(robots) || /Disallow: \/\s*$/m.test(robots)) errors.push('robots.txt: wrong content');
if (fs.readFileSync(path.join(OUT, 'CNAME'), 'utf8').trim() !== 'typingocto.com') errors.push('CNAME must be typingocto.com');
if (!fs.existsSync(path.join(OUT, '404.html'))) errors.push('404.html missing');
if (!fs.existsSync(path.join(OUT, '.nojekyll'))) errors.push('.nojekyll missing');
if (!fs.existsSync(path.join(OUT, 'blog/feed.xml'))) errors.push('RSS feed missing');

warnings.forEach(w => console.warn('WARN ', w));
errors.forEach(e => console.error('ERROR', e));
console.log(`Checked ${files.length} HTML files, ${inSitemap.size} sitemap URLs: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
