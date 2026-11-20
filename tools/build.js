// TypingOcto static site builder.
// Usage:  node tools/build.js      (writes HTML pages, blog, sitemap, robots into ./typingocto)
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'typingocto');
const SITE = 'https://typingocto.com';
const TODAY = new Date().toISOString().slice(0, 10);

// Load shared JS (octopus art + lessons) in Node.
global.window = {};
eval(fs.readFileSync(path.join(OUT, 'assets/core.js'), 'utf8'));
eval(fs.readFileSync(path.join(OUT, 'assets/lessons.js'), 'utf8'));
const TO = window.TO, LESSONS = window.LESSONS;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MANUAL_ARTICLES = require('./articles.js');

/* ---- Articles approved in TypingOcto SEO Intelligence (content/blog/*.json, committed by the publisher) ---- */
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blog');
const CATEGORY_OF = { 'how-to-type-faster': 'Typing speed', 'good-typing-speed': 'Typing speed', 'typing-speed-chart': 'Typing speed', 'touch-typing-for-beginners': 'Touch typing basics', 'home-row-keys': 'Touch typing basics', 'how-long-to-learn-typing': 'Touch typing basics', 'typing-for-kids': 'Kids & schools', 'typing-posture': 'Ergonomics' };
const BGS = ['linear-gradient(135deg,#4a2a45,#2a3550)', 'linear-gradient(135deg,#2a4a45,#2a3050)', 'linear-gradient(135deg,#4a3a2a,#2a3550)', 'linear-gradient(135deg,#3a2a4a,#25443a)', 'linear-gradient(135deg,#2a3a4a,#4a2a3a)'];
const EQS = [{ hat: 'hat-phones' }, { glasses: 'glasses-round' }, { hat: 'hat-cap' }, { hat: 'hat-beanie' }, { hat: 'hat-party' }];
const hashStr = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
function loadGenerated() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json')).sort().map(f => {
    const a = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8'));
    const where = `content/blog/${f}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug) || a.slug + '.json' !== f) throw new Error(`${where}: invalid slug`);
    for (const k of ['title', 'seoTitle', 'desc', 'date', 'lead', 'body', 'cta', 'articleId', 'version']) if (a[k] === undefined || a[k] === '') throw new Error(`${where}: missing ${k}`);
    if (/<\s*(script|iframe|object|embed|style|form|input)\b|\son[a-z]+\s*=|javascript:/i.test(a.body)) throw new Error(`${where}: unsafe HTML in body`);
    if (!/^[a-z0-9-]+\.html(\?n=\d+)?$|^$/.test(a.cta.href)) throw new Error(`${where}: invalid CTA ${a.cta.href}`);
    const h = hashStr(a.slug);
    return Object.assign({ bg: BGS[h % BGS.length], eq: EQS[h % EQS.length], faq: [], sources: [] }, a, { generated: true, leadHtml: esc(a.lead) });
  });
}
const GENERATED = loadGenerated();
for (const g of GENERATED) if (MANUAL_ARTICLES.some(m => m.slug === g.slug)) throw new Error(`Duplicated blog slug: ${g.slug}`);
const ARTICLES = MANUAL_ARTICLES.map(a => Object.assign({ category: CATEGORY_OF[a.slug] || 'Typing speed', leadHtml: a.lead }, a))
  .concat(GENERATED).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
const CATEGORIES = [...new Set(ARTICLES.map(a => a.category))];
const catSlug = c => c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const octo = (eq, mood) => TO.octo({ mood: mood || 'happy', eq: Object.assign({ color: 'color-coral', hat: null, glasses: null, neck: null }, eq || {}) });

const ORG = { '@type': 'Organization', name: 'TypingOcto', url: SITE + '/', logo: SITE + '/assets/icon-512.png' };

function head(o) {
  const url = SITE + '/' + o.path;
  const img = SITE + '/assets/og-image.png';
  const R = o.R || '';
  const ld = (o.jsonld || []).map(j => `<script type="application/ld+json">${JSON.stringify(Object.assign({ '@context': 'https://schema.org' }, j))}</script>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${o.title}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${o.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<meta property="og:type" content="${o.type || 'website'}">
<meta property="og:site_name" content="TypingOcto">
<meta property="og:title" content="${esc(o.ogTitle || o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Inky the octopus from TypingOcto, a free typing tutor">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.ogTitle || o.title)}">
<meta name="twitter:description" content="${esc(o.desc)}">
<meta name="twitter:image" content="${img}">
<meta name="theme-color" content="#15111e">
<link rel="icon" type="image/svg+xml" href="${R}assets/icon.svg">
<link rel="icon" type="image/png" sizes="192x192" href="${R}assets/icon-192.png">
<link rel="apple-touch-icon" href="${R}assets/icon-180.png">
<link rel="manifest" href="${R}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${R}assets/style.css">
${o.extraHead ? o.extraHead + '\n' : ''}${ld}
</head>`;
}
const NAV = [['lessons.html', 'Lessons', 'lessons'], ['typing-test.html', 'Typing Test', 'test'], ['practice.html', 'Practice', 'practice'], ['challenge.html', 'Challenge', 'challenge'], ['blog/', 'Blog', 'blog'], ['progress.html', 'My Progress', 'progress']];
const header = (active, R) => `<header id="hdr" class="hdr" data-active="${active}"><a class="brand" href="${R || './'}" aria-label="TypingOcto home">${octo({ hat: 'hat-phones' })}<span class="txt">Typing<b>Octo</b></span></a>
<nav class="nav" aria-label="Main">${NAV.map(([h, t, k]) => `<a href="${R}${h}"${k === active ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
<a class="pet-chip" href="${R}inky.html">Inky</a></header>`;
const footer = R => `<footer class="ftr"><nav aria-label="Footer"><a href="${R}lessons.html">Typing lessons</a><a href="${R}typing-test.html">Typing speed test</a><a href="${R}typing-test-1-minute.html">1 minute typing test</a><a href="${R}typing-test-for-kids.html">Typing test for kids</a><a href="${R}practice.html">Typing practice</a><a href="${R}challenge.html">Weekly challenge</a><a href="${R}blog/">Typing blog</a><a href="${R}inky.html">Meet Inky</a><a href="${R}about.html">About &amp; contact</a><a href="${R}privacy.html">Privacy &amp; cookies</a></nav>
<p>© ${new Date().getFullYear()} TypingOcto · Free typing lessons, no sign-up. Progress is saved in your browser.</p></footer>`;
const scripts = R => ['core', 'lessons', 'trainer', 'pages'].map(s => `<script src="${R}assets/${s}.js"></script>`).join('\n');

const pages = [];
function page(file, o, body, js) {
  const R = file.includes('/') ? '../' : '';
  o.R = R;
  o.path = file === 'index.html' ? '' : file.endsWith('/index.html') ? file.replace('index.html', '') : file;
  const html = `${head(o)}
<body>
${header(o.active || '', R)}
${body}
${footer(R)}
${scripts(R)}
<script>TO.init();${js || ''}</script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
  fs.writeFileSync(path.join(OUT, file), html);
  if (!o.noindex && file !== '404.html') pages.push({ loc: SITE + '/' + o.path, lastmod: o.lastmod || TODAY, pri: o.pri || 0.6 });
}
const ad = (size, extra) => `<div class="ad-wrap"${extra ? ` style="${extra}"` : ''}><div class="ad" data-size="${size}"></div></div>`;

/* ---------------- HOME ---------------- */
page('index.html', {
  title: 'TypingOcto — Free Typing Lessons, Typing Test &amp; Practice',
  ogTitle: 'TypingOcto — Learn to type fast with a pet octopus',
  desc: 'Learn to type fast for free with 100 typing lessons, a WPM typing speed test and Inky, the octopus you feed as you practise. No sign-up needed.',
  active: '', pri: 1.0,
  jsonld: [
    { '@type': 'WebSite', name: 'TypingOcto', url: SITE + '/', description: 'Free typing lessons, typing speed test and practice.' },
    ORG,
    { '@type': 'FAQPage', mainEntity: [
      ['How fast should I type?', 'The average person types around 40 words per minute (WPM). With daily practice many people reach 50–60 WPM.'],
      ['Do I need an account?', 'No. Your progress, stars and your octopus are saved in your browser, completely free.'],
      ['Is TypingOcto free?', 'Yes. All 100 lessons, the typing test, practice modes and the weekly challenge are free.']
    ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ]
}, `<main class="wrap">
  <section class="hero">
    <div>
      <div class="eyebrow">Free · No sign-up · 100 lessons</div>
      <h1>Learn to type <em>fast</em>.<br>Feed your octopus. 🐙</h1>
      <p>Free touch typing lessons from zero to 60+ WPM. Every lesson earns coins to feed and dress up Inky, so you'll want to come back tomorrow.</p>
      <div class="hero-cta"><a class="btn primary big" id="ctaLesson" href="lesson.html?n=1">Start Lesson 1 — free →</a><a class="btn big" href="typing-test.html">⚡ Take a typing test</a></div>
    </div>
    <div class="hero-pet" id="heroPet">${octo({ hat: 'hat-phones' })}</div>
  </section>
  <section class="weekly" id="weekly" aria-label="Weekly challenge"><div><strong>Weekly typing challenge</strong><small>Win an exclusive hat for Inky every week.</small></div><a class="btn primary" href="challenge.html">Take the challenge →</a></section>
  <div class="home-grid">
    <div>
      <div class="sec-h"><h2>Your learning path</h2><a href="lessons.html">All 100 lessons →</a></div>
      <div class="path" id="path"></div>
      <div class="sec-h" style="margin-top:26px"><h2>Choose your training</h2></div>
      <div class="modes">
        <a class="mode" href="lessons.html"><span class="ic">📚</span><strong>Typing Lessons</strong><small>10 units, 100 lessons: home row to 60 WPM.</small></a>
        <a class="mode" href="typing-test.html"><span class="ic">⚡</span><strong>Speed Test</strong><small>15s, 30s, 1 or 2 minutes. Get your WPM.</small></a>
        <a class="mode" href="practice.html"><span class="ic">🎯</span><strong>Practice</strong><small>Words, numbers, sentences or your weak keys.</small></a>
        <a class="mode" href="inky.html"><span class="ic">🐙</span><strong>Inky's Den</strong><small>Spend coins on food, hats and new colors.</small></a>
      </div>
      <div class="sec-h" style="margin-top:26px"><h2>From the blog</h2><a href="blog/">All articles →</a></div>
      <div class="posts">${ARTICLES.slice(-3).reverse().map(a => postCard(a, '')).join('')}</div>
      ${ad('728x90', 'margin-top:24px')}
    </div>
    <aside class="side">
      <div class="card mini-stats" id="miniStats"></div>
      ${ad('300x250')}
      <div class="card"><h3>💡 Tip of the day</h3><p class="muted" style="margin:0;font-size:14px">Accuracy first. When you hit the right keys without looking, speed comes by itself.</p></div>
    </aside>
  </div>
</main>
<section class="seo"><div class="wrap">
  <h2>Free online typing lessons for beginners and pros</h2>
  <p>TypingOcto teaches touch typing step by step: start with the home row (A S D F J K L ;), then the top and bottom rows, capital letters, numbers and punctuation. Each of the 100 <a href="lessons.html">typing lessons</a> shows a colour-coded keyboard so you always know which finger to use.</p>
  <h3>How fast should I type?</h3>
  <p>The average person types around 40 words per minute (WPM). With 10–15 minutes of daily practice most people reach 50–60 WPM. Take our free <a href="typing-test.html">typing speed test</a> to measure your WPM and accuracy, or read <a href="blog/good-typing-speed.html">what a good typing speed is</a>.</p>
  <h3>Why an octopus?</h3>
  <p>Inky has eight arms, and you have ten fingers. Every lesson or typing test earns coins you can spend on food, hats and colors for Inky. If you don't practise for a few days, Inky gets hungry, a friendly reminder to keep your streak going.</p>
  <h3>Do I need an account?</h3>
  <p>No. Your progress, stars and your octopus are saved in your browser, completely free.</p>
</div></section>`, `Pages.home();`);

function postCard(a, R) {
  const words = a.body.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
  return `<a class="post" href="${R}blog/${a.slug}.html" data-cat="${catSlug(a.category)}" data-q="${esc((a.title + ' ' + a.desc + ' ' + a.category).toLowerCase())}"><div class="thumb" style="--tbg:${a.bg}">${a.image ? `<img src="${esc(a.image.src)}" alt="${esc(a.image.alt)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : octo(a.eq)}</div><div class="body"><span class="post-cat">${esc(a.category)}</span><h2>${esc(a.title)}</h2><p>${esc(a.desc)}</p><small>${fmtDate(a.date)} · ${Math.max(3, Math.round(words / 220))} min read</small></div></a>`;
}
function fmtDate(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }

/* ---------------- LESSONS (pre-rendered for Google, then enhanced by JS) ---------------- */
const unitsHTML = LESSONS.units.map((u, ui) => {
  const ls = LESSONS.list.filter(l => l.unit === ui);
  return `<section class="unit" id="unit-${ui + 1}"><div class="unit-h"><span class="badge">${u.icon}</span><div><h2>Unit ${ui + 1}: ${esc(u.title)}</h2><p>${esc(u.desc)}</p></div></div>
<div class="unit-grid">${ls.map(l => `<a class="ltile${l.check ? ' check' : ''}" href="lesson.html?n=${l.id}"><span class="n">${l.id}</span><strong>${esc(l.title)}</strong><small>${l.check ? '🏁 Checkpoint' : esc(u.title)}</small></a>`).join('')}</div></section>`;
}).join('\n');
page('lessons.html', {
  title: '100 Free Typing Lessons for Beginners | TypingOcto',
  desc: 'Learn touch typing with 100 free typing lessons: home row, top row, bottom row, capitals, numbers, punctuation, common words and speed drills.',
  active: 'lessons', pri: 0.9,
  jsonld: [{ '@type': 'Course', name: 'Touch Typing Course: 100 Free Lessons', description: 'Learn to touch type from the home row to 60 WPM in 100 short interactive lessons.', provider: ORG, isAccessibleForFree: true, inLanguage: 'en',
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT10H' }, offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free' } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Typing lessons', item: SITE + '/lessons.html' }] }]
}, `<main class="wrap">
  <div class="lessons-top"><div><div class="eyebrow">Touch typing course</div><h1>100 free typing lessons</h1><p>From the home row to 60 WPM. Earn stars and coins for Inky in every lesson.</p></div><div class="overall" id="overall"></div></div>
  <div id="units">${unitsHTML}</div>
</main>
<section class="seo"><div class="wrap"><h2>How the typing course works</h2><p>The course has 10 units of 10 lessons. Each lesson introduces a few new keys and shows the finger that presses them on a colour-coded keyboard. Reach 85% accuracy to pass and 96% plus the target speed for three stars. New to touch typing? Read our <a href="blog/touch-typing-for-beginners.html">beginner's guide</a> and the <a href="blog/home-row-keys.html">home row explained</a>.</p></div></section>`, `Pages.lessons();`);

/* ---------------- TRAINERS ---------------- */
const seo = inner => `<section class="seo"><div class="wrap">${inner}</div></section>`;
page('typing-test.html', {
  title: 'Typing Test — Check Your WPM in 1 Minute | TypingOcto',
  desc: 'Free typing speed test. Measure your words per minute (WPM) and accuracy in 15 seconds, 30 seconds, 1 or 2 minutes, then share your score.',
  active: 'test', pri: 0.9,
  jsonld: [{ '@type': 'WebApplication', name: 'TypingOcto Typing Speed Test', url: SITE + '/typing-test.html', applicationCategory: 'EducationalApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' } }]
}, `<main id="trainer"><noscript><p class="wrap">Please enable JavaScript to take the typing test.</p></noscript></main>
${seo(`<h1 style="font-size:22px">Free typing speed test (WPM)</h1><p>This typing test measures how many words per minute you can type. One "word" is 5 characters, including spaces. Choose 15 seconds, 30 seconds, 1 minute or 2 minutes, and turn on punctuation for a harder challenge. When you finish, share your result card on TikTok, Instagram or WhatsApp.</p><h3>What is a good typing speed?</h3><p>About 40 WPM is average. 60 WPM is fast and great for most jobs. Accuracy matters too: aim for 95% or more. See the full <a href="blog/typing-speed-chart.html">typing speed chart</a>.</p><h3>Other typing tests</h3><p><a href="typing-test-30-seconds.html">30 second typing test</a> · <a href="typing-test-1-minute.html">1 minute typing test</a> · <a href="typing-test-3-minutes.html">3 minute typing test</a> · <a href="typing-test-5-minutes.html">5 minute typing test</a> · <a href="typing-test-for-kids.html">typing test for kids</a></p><h3>How to improve your WPM</h3><p>Follow our free <a href="lessons.html">typing lessons</a>, keep your fingers on the home row, and practise 10 minutes every day. More ideas in <a href="blog/how-to-type-faster.html">10 tips to type faster</a>.</p>`)}`, `Trainer.mount(document.getElementById('trainer'),{mode:'test'});`);

page('practice.html', {
  title: 'Typing Practice — Words, Numbers &amp; Weak Keys | TypingOcto',
  desc: 'Free typing practice with common English words, numbers, sentences and an automatic drill for the keys you miss most often.',
  active: 'practice', pri: 0.8
}, `<main id="trainer"></main>
${seo(`<h1 style="font-size:22px">Typing practice that adapts to you</h1><p>Practise common English words, numbers or full sentences. The Weak keys mode looks at your mistakes and builds words with the letters you miss most often, so you improve faster. Remember to keep a <a href="blog/typing-posture.html">relaxed typing posture</a>.</p>`)}`, `Trainer.mount(document.getElementById('trainer'),{mode:'practice'});`);

page('challenge.html', {
  title: 'Weekly Typing Challenge — Win an Exclusive Hat | TypingOcto',
  desc: 'A new typing challenge every week. Type the text with 90% accuracy to win an exclusive hat for Inky the octopus, then share your score.',
  active: 'challenge', pri: 0.8
}, `<main id="trainer"></main>
${seo(`<h1 style="font-size:22px">Weekly typing challenge</h1><p>Every Monday there is a new text to type and a new exclusive hat to win for Inky. Finish with at least 90% accuracy to unlock it. Share your result card and challenge your friends, classmates or followers to beat your WPM.</p>`)}`, `Trainer.mount(document.getElementById('trainer'),{mode:'challenge'});`);

page('lesson.html', {
  title: 'Typing Lesson | TypingOcto', desc: 'Free interactive touch typing lesson with a colour-coded keyboard and finger guide.', noindex: true, active: 'lessons'
}, `<main id="trainer"></main>
${seo(`<h2>Touch typing lessons, step by step</h2><p>Each lesson introduces a few new keys and the finger that presses them. Get 85% accuracy to pass and 96% plus the target speed for three stars. See <a href="lessons.html">all 100 lessons</a>.</p>`)}`,
  `var n=Math.min(100,Math.max(1,parseInt(new URLSearchParams(location.search).get('n'))||1));document.title='Lesson '+n+': '+LESSONS.list[n-1].title+' — Typing Lesson | TypingOcto';Trainer.mount(document.getElementById('trainer'),{mode:'lesson',lesson:n});`);

/* ---------------- TEST VARIANTS (one page per search keyword) ---------------- */
const VARIANTS = [
  ['typing-test-1-minute.html', 60, 'common', '1 Minute Typing Test — Free WPM Test | TypingOcto', 'Take a free 1 minute typing test and find out your words per minute (WPM) and accuracy. The most popular test length for school and job applications.', '1 minute typing test', 'The 1 minute typing test is the most common way to measure typing speed. It is long enough to give a reliable WPM score and short enough to repeat a few times. Many schools and employers use a one-minute test, so it is great practice before an application.'],
  ['typing-test-30-seconds.html', 30, 'common', '30 Second Typing Test — Quick WPM Check | TypingOcto', 'A quick 30 second typing test. Check your typing speed (WPM) and accuracy in half a minute, then try to beat your score.', '30 second typing test', 'Short on time? The 30 second typing test gives you a quick snapshot of your typing speed. Scores on short tests are usually a little higher than on longer tests, because you do not get tired, so it is perfect for speed bursts and warm-ups.'],
  ['typing-test-3-minutes.html', 180, 'common', '3 Minute Typing Test — Measure Your Real WPM | TypingOcto', 'Free 3 minute typing test with common English words. Measure your real typing speed and consistency over a longer text.', '3 minute typing test', 'A 3 minute typing test shows your real, sustainable typing speed. It is harder to keep a high WPM for three minutes, so this test reveals how consistent your rhythm and accuracy are.'],
  ['typing-test-5-minutes.html', 300, 'advanced', '5 Minute Typing Test — Endurance WPM Test | TypingOcto', 'Take a free 5 minute typing test. Many job applications use a 5 minute test: practise here and check your WPM and accuracy.', '5 minute typing test', 'The 5 minute typing test is an endurance test. It is often used for data entry, transcription and administrative jobs. Keep a steady pace, relax your shoulders and focus on accuracy: one long test tells more about your skill than many short ones.'],
  ['typing-test-for-kids.html', 60, 'common', 'Typing Test for Kids — Fun &amp; Free | TypingOcto', 'A fun, free typing test for kids with simple words and a friendly octopus. Measure WPM, earn coins and feed Inky. No sign-up needed.', 'Typing test for kids', 'This typing test for kids uses short, simple words and a friendly octopus called Inky. Children earn coins after every test and can spend them on food and hats for Inky, which makes them want to practise again tomorrow. A good speed for children depends on age; the most important thing is using the right fingers and not looking down.']
];
VARIANTS.forEach(([file, dur, words, title, desc, h1, text]) => page(file, { title, desc, active: 'test', pri: 0.8,
  jsonld: [{ '@type': 'WebApplication', name: h1, url: SITE + '/' + file, applicationCategory: 'EducationalApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' } }] },
  `<main id="trainer"></main>
${seo(`<h1 style="font-size:22px">${h1}</h1><p>${text}</p><h3>More typing tests</h3><p>${VARIANTS.filter(v => v[0] !== file).map(v => `<a href="${v[0]}">${v[5]}</a>`).join(' · ')} · <a href="typing-test.html">custom typing test</a></p><p>Want to improve? Follow our free <a href="lessons.html">typing lessons</a> or read <a href="blog/how-to-type-faster.html">10 tips to type faster</a>.</p>`)}`,
  `Trainer.mount(document.getElementById('trainer'),{mode:'test',dur:${dur},words:'${words}'});`));

/* ---------------- PROGRESS / DEN ---------------- */
page('progress.html', {
  title: 'My Typing Progress | TypingOcto', desc: 'Track your typing speed, accuracy, streak and the keys you miss most.', noindex: true, active: 'progress'
}, `<main class="pg">
  <div class="pg-head"><div><h1>📈 My progress</h1><p>Saved in this browser · no account needed</p></div><a class="btn primary" href="typing-test.html">⚡ New speed test</a></div>
  <div class="tiles" id="tiles"></div>
  <div class="pg-row">
    <div class="panel"><div class="panel-h"><h2>Speed (WPM)</h2><span>last 40 sessions</span></div><div class="chart" id="cWpm"></div></div>
    <div class="panel"><div class="panel-h"><h2>Accuracy</h2><span>last 40 sessions</span></div><div class="chart" id="cAcc"></div></div>
  </div>
  <div class="pg-row">
    <div class="panel"><div class="panel-h"><h2>Error heatmap</h2><span id="heatNote"></span></div><div class="heat" id="heat"></div><div class="legend">fewer errors <i style="background:rgba(255,125,147,.1)"></i><i style="background:rgba(255,125,147,.35)"></i><i style="background:rgba(255,125,147,.6)"></i><i style="background:rgba(255,125,147,.9)"></i> more errors</div></div>
    <div class="panel"><div class="panel-h"><h2>Practice calendar</h2><span>last 20 weeks</span></div><div class="streak" id="streakBox"></div><div class="cal" id="cal"></div><div class="legend">less <i style="background:#2b2336"></i><i style="background:rgba(159,224,168,.25)"></i><i style="background:rgba(159,224,168,.5)"></i><i style="background:rgba(159,224,168,.75)"></i><i style="background:rgba(159,224,168,1)"></i> more</div></div>
  </div>
</main>`, `Pages.progress();`);

page('inky.html', {
  title: "Inky's Den — Feed &amp; Dress Your Typing Octopus | TypingOcto",
  desc: 'Meet Inky, the octopus that grows as you learn to type. Spend the coins you earn on food, hats, glasses, colors and rooms.', pri: 0.6
}, `<main class="den">
  <section class="room" id="room" aria-label="Inky's room"></section>
  <section class="shop">
    <div class="shop-h"><h2>🛍️ Shop</h2><a class="btn primary" href="lessons.html">Earn more coins →</a></div>
    <div class="tabs" id="tabs"></div>
    <div class="items" id="items"></div>
    <div class="earn">How to earn: <b>lesson</b> 5–17 🪙 (more stars = more coins) · <b>speed test</b> 4+ 🪙 (faster = more) · <b>first practice of the day</b> +10 🪙 · <b>weekly challenge</b> = exclusive hat. Inky gets hungry after 2–3 days, so come back soon!</div>
    ${ad('468x60', 'margin-top:10px')}
  </section>
</main>
${seo(`<h1 style="font-size:22px">Meet Inky, your typing buddy</h1><p>Inky is a friendly octopus who lives on TypingOcto. Every typing lesson, speed test and practice session earns coins that you can spend on food and accessories. Keep Inky fed by practising a little every day: it's the easiest way to build a typing habit. Kids love it, see our tips on <a href="blog/typing-for-kids.html">typing for kids</a>.</p>`)}`, `Pages.den();Pages.denEvents();`);

/* ---------------- BLOG ---------------- */
page('blog/index.html', {
  title: 'Typing Blog: Tips to Type Faster | TypingOcto',
  desc: 'Guides and tips to learn touch typing, improve your WPM, sit with good posture and help kids learn to type.', active: 'blog', pri: 0.8,
  extraHead: `<link rel="alternate" type="application/rss+xml" title="TypingOcto Blog" href="${SITE}/blog/feed.xml">`,
  jsonld: [{ '@type': 'Blog', name: 'TypingOcto Blog', url: SITE + '/blog/', publisher: ORG, blogPost: ARTICLES.map(a => ({ '@type': 'BlogPosting', headline: a.title, url: `${SITE}/blog/${a.slug}.html`, datePublished: a.date, articleSection: a.category })) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog/' }] }]
}, `<main class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a> › Blog</nav>
  <section class="blog-hero"><div><div class="eyebrow">TypingOcto Blog</div><h1>Learn to type faster</h1><p>Simple, practical guides about touch typing, typing speed, posture and learning to type with kids.</p></div>${octo({ glasses: 'glasses-round', hat: 'hat-beanie' })}</section>
  <div class="blog-tools"><input type="search" id="blogSearch" placeholder="Search articles…" aria-label="Search articles"><nav class="cats" aria-label="Categories"><button class="on" data-cat="">All</button>${CATEGORIES.map(c => `<button data-cat="${catSlug(c)}">${esc(c)}</button>`).join('')}</nav></div>
  <div class="posts" id="blogPosts">${ARTICLES.slice().reverse().map(a => postCard(a, '../')).join('')}</div>
  <p class="muted" id="blogEmpty" hidden>No articles match your search.</p>
  ${ad('728x90', 'margin-top:26px')}
</main>`, `(function(){var q=document.getElementById('blogSearch'),cat='',posts=[].slice.call(document.querySelectorAll('#blogPosts .post'));function f(){var t=q.value.trim().toLowerCase(),n=0;posts.forEach(function(p){var ok=(!cat||p.dataset.cat===cat)&&(!t||p.dataset.q.indexOf(t)>-1);p.hidden=!ok;if(ok)n++;});document.getElementById('blogEmpty').hidden=n>0;}q.addEventListener('input',f);document.querySelectorAll('.cats button').forEach(function(b){b.addEventListener('click',function(){cat=b.dataset.cat;document.querySelectorAll('.cats button').forEach(function(x){x.classList.toggle('on',x===b)});f();});});})();`);

ARTICLES.forEach((a, idx) => {
  const toc = [];
  const body = a.body.replace(/<h2>(.*?)<\/h2>/g, (m, t) => { const id = t.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); toc.push([id, t]); return `<h2 id="${id}">${t}</h2>`; });
  // put an ad + CTA roughly in the middle
  const parts = body.split('<h2');
  const mid = Math.ceil(parts.length / 2);
  const cta = R => `<aside class="cta">${octo(a.eq)}<div><strong>${esc(a.cta.title)}</strong><p>${esc(a.cta.text)}</p></div><a class="btn primary" href="../${a.cta.href}" data-cta="article">${esc(a.cta.btn)} →</a></aside>`;
  const sources = a.sources && a.sources.length ? `<h2 id="sources">Sources</h2><ul class="sources">${a.sources.map(s => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title || s.url)}</a></li>`).join('')}</ul>` : '';
  const figure = a.image ? `<figure class="cover-img"><img src="${esc(a.image.src)}" alt="${esc(a.image.alt)}" loading="eager" width="1200" height="630"><figcaption>${esc(a.image.credit || '')}${a.image.license && a.image.license !== 'own' ? ` · ${esc(a.image.license)}` : ''}</figcaption></figure>` : `<div class="cover" style="--tbg:${a.bg}" role="img" aria-label="Illustration of Inky the octopus">${octo(a.eq)}</div>`;
  const withMid = parts.slice(0, mid).join('<h2') + ad('728x90', 'margin:26px 0') + '<h2' + parts.slice(mid).join('<h2');
  const words = a.words || a.body.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
  const mins = Math.max(3, Math.round(words / 220));
  const related = ARTICLES.filter(x => x !== a).sort((x, y) => (y.category === a.category) - (x.category === a.category) || (x.date < y.date ? 1 : -1)).slice(0, 3);
  const faq = a.faq && a.faq.length ? `<h2 id="faq">Frequently asked questions</h2><div class="faq">${a.faq.map(([q, ans]) => `<details><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join('')}</div>` : '';
  page(`blog/${a.slug}.html`, {
    title: `${a.seoTitle} | TypingOcto`, ogTitle: a.title, desc: a.desc, type: 'article', active: 'blog', lastmod: a.updated || a.date, pri: 0.7,
    extraHead: `<meta property="article:published_time" content="${a.date}"><meta property="article:section" content="${esc(a.category)}"><link rel="alternate" type="application/rss+xml" title="TypingOcto Blog" href="${SITE}/blog/feed.xml">${a.generated ? `\n<meta name="to-article" content="${esc(a.articleId)}:${a.version}">` : ''}`,
    jsonld: [
      { '@type': 'Article', headline: a.title, description: a.desc, image: a.image ? a.image.src : SITE + '/assets/og-image.png', datePublished: a.date, dateModified: a.updated || a.date, articleSection: a.category, keywords: a.primaryKeyword ? [a.primaryKeyword].concat(a.secondaryKeywords || []).join(', ') : undefined, author: { '@type': 'Organization', name: 'TypingOcto Team', url: SITE + '/about.html' }, publisher: ORG, mainEntityOfPage: `${SITE}/blog/${a.slug}.html`, wordCount: words, inLanguage: 'en' },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog/' }, { '@type': 'ListItem', position: 3, name: a.title, item: `${SITE}/blog/${a.slug}.html` }] }
    ].concat(a.faq ? [{ '@type': 'FAQPage', mainEntity: a.faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })) }] : [])
  }, `<main class="wrap">
  <article class="article">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a> › <a href="./">Blog</a> › ${esc(a.title)}</nav>
    <header>
      <h1>${esc(a.title)}</h1>
      <div class="meta"><span>By TypingOcto Team</span><span>·</span><span>${esc(a.category)}</span><span>·</span><time datetime="${a.date}">${fmtDate(a.date)}</time><span>·</span><span>${mins} min read</span></div>
      ${figure}
      <p class="lead">${a.leadHtml}</p>
    </header>
    <nav class="toc" aria-label="Table of contents"><strong>In this article</strong><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t.replace(/<[^>]+>/g, '').replace(/^\d+\.\s*/, '')}</a></li>`).join('')}${faq ? '<li><a href="#faq">FAQ</a></li>' : ''}</ol></nav>
    ${withMid}
    ${cta()}
    ${faq}
    ${sources}
  </article>
  <section class="related article"><h2>Keep reading</h2><div class="posts">${related.map(r => postCard(r, '../')).join('')}</div></section>
</main>`);
});

/* ---------------- ABOUT / PRIVACY / 404 ---------------- */
page('about.html', { title: 'About TypingOcto &amp; Contact', desc: 'TypingOcto is a free typing tutor with 100 lessons, a typing speed test and a pet octopus. Learn who we are and how to contact us.', pri: 0.4,
  jsonld: [{ '@type': 'AboutPage', name: 'About TypingOcto', url: SITE + '/about.html', publisher: ORG }] },
`<main class="prose">
<h1>About TypingOcto</h1>
<p>TypingOcto is a free website to learn touch typing. We believe typing is a basic skill everyone should have, and that learning it should be fun, not boring.</p>
<h2>What you can do here</h2>
<ul><li><a href="lessons.html">100 typing lessons</a>, from the home row to speed drills.</li><li>A <a href="typing-test.html">typing speed test</a> to measure your WPM.</li><li><a href="practice.html">Practice modes</a>, including one that trains your weakest keys.</li><li>A <a href="challenge.html">weekly challenge</a> with exclusive prizes.</li><li><a href="inky.html">Inky</a>, the octopus you feed and dress up with the coins you earn.</li></ul>
<h2>Free and private</h2>
<p>There are no accounts. Your progress is stored only in your browser. The site is kept free by advertising. See our <a href="privacy.html">privacy policy</a>.</p>
<h2>Contact</h2>
<p>Ideas, bugs or partnership requests? Email us at <strong>hello@typingocto.com</strong>.</p>
</main>`);

page('privacy.html', { title: 'Privacy Policy &amp; Cookies | TypingOcto', desc: 'How TypingOcto handles your data: progress stored in your browser, cookies, Google Analytics and advertising, and the choices you have.', pri: 0.3 },
`<main class="prose">
<h1>Privacy policy &amp; cookies</h1>
<p><em>Last updated: ${fmtDate(TODAY)}</em></p>
<h2>Your typing progress</h2>
<p>TypingOcto does not require an account. By default your lessons, stars, statistics and your octopus are stored only in your browser (localStorage) and we never receive them. Clearing your browser data deletes them.</p>
<h2>Optional Google sign-in</h2>
<p>If you choose to sign in with Google, we use Google Firebase to store a copy of the same progress data (lessons, statistics, coins and your octopus) linked to your account, so you can continue on another device. We receive your Google account name and email address only to identify your account; we do not use them for marketing. You can sign out at any time, and you can ask us to delete your synced progress by emailing <strong>hello@typingocto.com</strong>. Children should ask a parent or guardian before signing in.</p>
<h2>Advertising</h2>
<p>We show ads to keep TypingOcto free. Third-party vendors, including Google, use cookies to serve ads based on your previous visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visits to this site and/or other sites on the Internet. You can opt out of personalised advertising in <a href="https://adssettings.google.com" rel="nofollow noopener">Google Ads Settings</a>.</p>
<h2>Analytics</h2>
<p>If you accept cookies, we use Google Analytics to understand how many people visit and which pages they use. This data is aggregated and is not used to identify you.</p>
<h2>Your choices</h2>
<p>You can accept or reject non-essential cookies in the banner shown on your first visit, and block cookies in your browser settings at any time.</p>
<h2>Children</h2>
<p>TypingOcto can be used by children. We do not knowingly collect personal information from anyone.</p>
<h2>Contact</h2>
<p>Questions? Email us at <strong>hello@typingocto.com</strong>.</p>
</main>`);

page('404.html', { title: 'Page not found | TypingOcto', desc: 'This page does not exist.', noindex: true },
`<main class="prose" style="text-align:center">${octo({}, 'sad')}<h1>Oops, page not found</h1><p>Inky looked everywhere with all eight arms, but this page doesn't exist.</p><p><a class="btn primary" href="/">Back to home</a> <a class="btn" href="/lessons.html">Typing lessons</a></p></main>`);

/* ---------------- RSS feed ---------------- */
const xmlEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
fs.writeFileSync(path.join(OUT, 'blog/feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>TypingOcto Blog</title><link>${SITE}/blog/</link><description>Guides and tips to learn touch typing and type faster.</description><language>en</language>
<atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${ARTICLES.slice().reverse().slice(0, 30).map(a => `<item><title>${xmlEsc(a.title)}</title><link>${SITE}/blog/${a.slug}.html</link><guid isPermaLink="true">${SITE}/blog/${a.slug}.html</guid><pubDate>${new Date(a.date + 'T09:00:00Z').toUTCString()}</pubDate><category>${xmlEsc(a.category)}</category><description>${xmlEsc(a.desc)}</description></item>`).join('\n')}
</channel></rss>
`);

/* ---------------- sitemap, robots, manifest ---------------- */
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod><priority>${p.pri.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'site.webmanifest'), JSON.stringify({ name: 'TypingOcto', short_name: 'TypingOcto', start_url: '/', display: 'standalone', background_color: '#15111e', theme_color: '#15111e', icons: [{ src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2));
fs.writeFileSync(path.join(OUT, 'assets/icon.svg'), octo({ hat: 'hat-phones' }).replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"').replace(/ class="[^"]*"/, ''));
console.log('Built', pages.length, 'indexable pages + lesson, progress, 404');
