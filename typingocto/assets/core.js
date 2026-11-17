/* TypingOcto — core: storage, pet, rewards, header/footer, octopus art, ads */
(function () {
  'use strict';

  // Change the brand in ONE place.
  const BRAND = { first: 'Typing', second: 'Octo', pet: 'Inky', domain: 'typingocto.com' };
  BRAND.name = BRAND.first + BRAND.second;

  /* ======== SITE SETTINGS ========
     ADS_ENABLED: set to true once Google AdSense approves the site (until then ad spaces are hidden).
     GA_ID: your Google Analytics 4 id, e.g. 'G-XXXXXXX' (loads only after the visitor accepts cookies). */
  const CONFIG = { ADS_ENABLED: false, ADSENSE_CLIENT: '', GA_ID: 'G-Y6RMEBDRNQ' };

  // Base URL of the site (works from sub-folders like /blog/ and when opened from disk).
  const BASE = (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) ? new URL('..', document.currentScript.src).href : '';

  const KEY = 'typingocto-v1';
  const H = 36e5;

  const defaults = () => ({
    lessons: {},          // { "12": {stars, wpm, acc} }
    sessions: [],         // [{t, m, w, a, s, l}]
    keys: {},             // { "a": {h, m} }
    days: {},             // { "2026-11-15": seconds }
    coins: 25, xp: 0, totalSecs: 0, lastBonus: '',
    pet: { name: 'Inky', full: 70, at: Date.now(), owned: ['color-coral', 'room-ocean'],
           eq: { hat: null, glasses: null, neck: null, color: 'color-coral', room: 'room-ocean' } },
    consent: null
  });

  let S;
  function load() {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    const d = defaults();
    S = Object.assign(d, raw || {});
    S.pet = Object.assign(defaults().pet, S.pet || {});
    S.pet.eq = Object.assign(defaults().pet.eq, S.pet.eq || {});
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  load();

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dayKey = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  /* ---------------- shop catalogue ---------------- */
  const ITEMS = [
    { id: 'food-shrimp', type: 'food', name: 'Shrimp', icon: '🦐', price: 8, food: 20 },
    { id: 'food-fish', type: 'food', name: 'Fresh Fish', icon: '🐟', price: 15, food: 40 },
    { id: 'food-sushi', type: 'food', name: 'Sushi Roll', icon: '🍣', price: 25, food: 70 },
    { id: 'food-cake', type: 'food', name: 'Birthday Cake', icon: '🍰', price: 40, food: 100 },
    { id: 'hat-party', type: 'hat', name: 'Party Hat', icon: '🎉', price: 40 },
    { id: 'hat-beanie', type: 'hat', name: 'Cozy Beanie', icon: '🧶', price: 60 },
    { id: 'hat-cap', type: 'hat', name: 'Sport Cap', icon: '🧢', price: 70 },
    { id: 'hat-phones', type: 'hat', name: 'Headphones', icon: '🎧', price: 110 },
    { id: 'hat-top', type: 'hat', name: 'Top Hat', icon: '🎩', price: 160 },
    { id: 'hat-crown', type: 'hat', name: 'Royal Crown', icon: '👑', price: 300 },
    { id: 'glasses-round', type: 'glasses', name: 'Smart Glasses', icon: '👓', price: 50 },
    { id: 'glasses-sun', type: 'glasses', name: 'Sunglasses', icon: '🕶️', price: 90 },
    { id: 'neck-bow', type: 'neck', name: 'Bow Tie', icon: '🎀', price: 40 },
    { id: 'neck-scarf', type: 'neck', name: 'Warm Scarf', icon: '🧣', price: 70 },
    { id: 'hat-wizard', type: 'hat', name: 'Wizard Hat', icon: '🧙', exclusive: true },
    { id: 'hat-pirate', type: 'hat', name: 'Pirate Hat', icon: '🏴‍☠️', exclusive: true },
    { id: 'hat-flowers', type: 'hat', name: 'Flower Crown', icon: '🌸', exclusive: true },
    { id: 'hat-santa', type: 'hat', name: 'Santa Hat', icon: '🎅', exclusive: true },
    { id: 'hat-viking', type: 'hat', name: 'Viking Helmet', icon: '⚔️', exclusive: true },
    { id: 'hat-chef', type: 'hat', name: 'Chef Hat', icon: '👨‍🍳', exclusive: true },
    { id: 'color-coral', type: 'color', name: 'Coral', price: 0, sw: '#ff8f7a' },
    { id: 'color-violet', type: 'color', name: 'Violet', price: 100, sw: '#b9a0f6' },
    { id: 'color-mint', type: 'color', name: 'Mint', price: 100, sw: '#86d6a0' },
    { id: 'color-blue', type: 'color', name: 'Ocean Blue', price: 120, sw: '#6cb6ff' },
    { id: 'color-pink', type: 'color', name: 'Bubblegum', price: 120, sw: '#ff9ec4' },
    { id: 'color-gold', type: 'color', name: 'Golden', price: 400, sw: '#ffcf5a' },
    { id: 'room-ocean', type: 'room', name: 'Deep Ocean', price: 0, sw: 'linear-gradient(180deg,#1d3550,#152238 60%,#2a2a3a)' },
    { id: 'room-reef', type: 'room', name: 'Coral Reef', price: 120, sw: 'linear-gradient(180deg,#1f5260,#1d3b48 55%,#5a3a40)' },
    { id: 'room-sunset', type: 'room', name: 'Sunset Bay', price: 150, sw: 'linear-gradient(180deg,#5a3050,#3b2440 50%,#22283e)' },
    { id: 'room-space', type: 'room', name: 'Outer Space', price: 250, sw: 'radial-gradient(circle at 30% 20%,#3a2f6a,#120f22 60%)' }
  ];
  const item = id => ITEMS.find(i => i.id === id);

  /* ---------------- weekly challenge ---------------- */
  const WEEKLY_HATS = ['hat-wizard', 'hat-pirate', 'hat-flowers', 'hat-santa', 'hat-viking', 'hat-chef'];
  function week() {
    const now = new Date();
    const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const n = Math.round((monday - new Date(2024, 0, 1)) / (7 * 24 * H)); // 2024-01-01 was a Monday
    const ends = new Date(monday); ends.setDate(ends.getDate() + 7);
    const left = ends - now, d = Math.floor(left / (24 * H)), h = Math.floor(left % (24 * H) / H);
    return { n, hat: WEEKLY_HATS[n % WEEKLY_HATS.length], ends, left: d ? `${d}d ${h}h` : `${h}h ${Math.floor(left % H / 6e4)}m` };
  }

  /* ---------------- pet logic ---------------- */
  function fullness() { return clamp(S.pet.full - (Date.now() - S.pet.at) / H * 1.4, 0, 100); }
  function setFull(v) { S.pet.full = clamp(v, 0, 100); S.pet.at = Date.now(); }
  function daysSincePractice() {
    const ks = Object.keys(S.days).sort();
    if (!ks.length) return 99;
    const last = new Date(ks[ks.length - 1] + 'T12:00:00');
    return Math.floor((Date.now() - last) / (24 * H));
  }
  function streak() {
    let n = 0; const d = new Date();
    if (!S.days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (S.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function bestStreak() {
    const ks = Object.keys(S.days).sort(); let best = 0, cur = 0, prev = null;
    ks.forEach(k => { const t = new Date(k + 'T12:00:00'); cur = prev && Math.round((t - prev) / (24 * H)) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = t; });
    return best;
  }
  function mood() {
    const f = fullness();
    if (f < 15) return 'hungry';
    if (S.sessions.length && daysSincePractice() >= 3) return 'sad';
    if (f >= 55) return 'happy';
    return 'ok';
  }
  function level() {
    let lv = 1, need = 100, xp = S.xp;
    while (xp >= need) { xp -= need; lv++; need = 100 + (lv - 1) * 50; }
    return { lv, xp, need };
  }
  function petLine() {
    const n = S.pet.name, m = mood(), st = streak();
    if (m === 'hungry') return `I'm sooo hungry… 🥺 Finish a lesson to earn coins and feed me!`;
    if (m === 'sad') return `I missed you! Let's practise a little today? 💙`;
    if (!S.sessions.length) return `Hi, I'm ${n}! I have 8 arms, you have 10 fingers. Let's learn to type together!`;
    if (st >= 3) return `${st}-day streak! 🔥 You're on fire. Keep it going!`;
    if (fullness() < 40) return `My tummy is rumbling… a shrimp would be nice 🦐`;
    const lines = [`Ready for another lesson? I believe in you! ✨`, `Eyes on the screen, fingers on F and J!`, `Accuracy first — speed comes by itself.`, `Every lesson = coins for my wardrobe 👒`];
    return lines[new Date().getMinutes() % lines.length];
  }

  /* ---------------- rewards & sessions ---------------- */
  function recordSession(r) {
    // r: {mode, wpm, acc, secs, lesson?, stars?, keyStats}
    const today = dayKey();
    S.sessions.push({ t: Date.now(), m: r.mode, w: r.wpm, a: r.acc, s: Math.round(r.secs), l: r.lesson || null });
    if (S.sessions.length > 600) S.sessions = S.sessions.slice(-600);
    S.days[today] = (S.days[today] || 0) + Math.round(r.secs);
    S.totalSecs += Math.round(r.secs);
    let coins = 0; const notes = [];
    if (r.mode === 'lesson') coins = r.stars ? 5 + r.stars * 4 : 2;
    else if (r.mode === 'test') coins = r.acc >= 80 ? 4 + Math.floor(r.wpm / 10) * 2 : 2;
    else coins = r.acc >= 80 ? 6 : 2;
    if (S.lastBonus !== today) { S.lastBonus = today; coins += 10; notes.push('incl. +10 daily bonus'); }
    const before = level().lv;
    S.coins += coins; S.xp += coins * 2 + Math.round(r.secs / 6);
    const after = level().lv;
    save();
    return { coins, notes, levelUp: after > before ? after : 0 };
  }

  /* ---------------- octopus SVG ---------------- */
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = c => clamp(Math.round(c + amt), 0, 255);
    return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  function octo(o) {
    o = o || {};
    const eq = o.eq || S.pet.eq;
    const col = (item(eq.color) || ITEMS.find(i => i.id === 'color-coral')).sw;
    const dark = shade(col, -45), ink = '#2a1b2e';
    const m = o.mood || mood();
    const tent = [
      'M62 122 C38 140 26 170 46 188 C52 193 60 190 58 182', 'M80 130 C64 156 58 180 74 196',
      'M95 134 C90 162 88 184 99 200', 'M105 134 C110 162 112 184 101 200',
      'M120 130 C136 156 142 180 126 196', 'M138 122 C162 140 174 170 154 188 C148 193 140 190 142 182'
    ].map((d, i) => `<path d="${d}" stroke="${i % 2 ? dark : col}" stroke-width="17" fill="none" stroke-linecap="round"/>`).join('');
    const suck = [[44, 176], [72, 186], [97, 190], [104, 190], [128, 186], [156, 176]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#ffffff55"/>`).join('');
    let mouth;
    if (m === 'happy') mouth = `<path d="M89 112 Q100 125 111 112" stroke="${ink}" stroke-width="3.5" fill="#7a2a3a" stroke-linecap="round"/>`;
    else if (m === 'hungry') mouth = `<ellipse cx="100" cy="116" rx="6" ry="7" fill="${ink}"/><path d="M118 120 q2 6 0 9" stroke="#8cc4ff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    else if (m === 'sad') mouth = `<path d="M90 119 Q100 109 110 119" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    else mouth = `<path d="M91 114 Q100 120 109 114" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    const brow = m === 'sad' || m === 'hungry' ? `<path d="M68 72 l16 6 M132 72 l-16 6" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>` : '';
    const eyes = `<ellipse cx="80" cy="92" rx="13" ry="15" fill="#fff"/><ellipse cx="120" cy="92" rx="13" ry="15" fill="#fff"/>
      <circle cx="82" cy="95" r="7.5" fill="${ink}"/><circle cx="122" cy="95" r="7.5" fill="${ink}"/>
      <circle cx="85" cy="91" r="2.6" fill="#fff"/><circle cx="125" cy="91" r="2.6" fill="#fff"/>`;
    const HATS = {
      'hat-party': `<path d="M100 2 L78 44 Q100 52 122 44 Z" fill="#ff8fa7"/><path d="M89 23 L111 23 M84 33 L116 33" stroke="#ffd36e" stroke-width="5"/><circle cx="100" cy="4" r="6" fill="#ffd36e"/>`,
      'hat-beanie': `<path d="M50 62 Q52 14 100 12 Q148 14 150 62 Z" fill="#7bc7a0"/><rect x="46" y="52" width="108" height="16" rx="8" fill="#5aa880"/><circle cx="100" cy="11" r="10" fill="#f8f4f6"/>`,
      'hat-cap': `<path d="M52 56 Q54 14 100 14 Q146 14 148 56 Z" fill="#5b8def"/><path d="M120 54 Q160 50 172 60 Q150 66 120 62 Z" fill="#3f6fd0"/><circle cx="100" cy="15" r="5" fill="#3f6fd0"/>`,
      'hat-phones': `<path d="M40 96 Q38 24 100 22 Q162 24 160 96" stroke="#2a2336" stroke-width="9" fill="none"/><rect x="28" y="76" width="22" height="36" rx="10" fill="#ffc17d"/><rect x="150" y="76" width="22" height="36" rx="10" fill="#ffc17d"/>`,
      'hat-top': `<rect x="74" y="0" width="52" height="40" rx="4" fill="#231c2c"/><rect x="74" y="27" width="52" height="8" fill="#ff8fa7"/><ellipse cx="100" cy="40" rx="44" ry="8" fill="#231c2c"/>`,
      'hat-wizard': `<path d="M100 -14 L70 44 Q100 54 130 44 Z" fill="#6b4fd8"/><ellipse cx="100" cy="44" rx="44" ry="8" fill="#5a3fc4"/><path d="M96 8 l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill="#ffd36e"/><circle cx="108" cy="28" r="3" fill="#ffd36e"/><circle cx="88" cy="34" r="2.5" fill="#ffd36e"/>`,
      'hat-pirate': `<path d="M46 52 Q60 8 100 6 Q140 8 154 52 Q100 38 46 52 Z" fill="#231c2c"/><path d="M46 52 Q100 38 154 52" stroke="#ffcf5a" stroke-width="3" fill="none"/><circle cx="100" cy="26" r="7" fill="#f8f4f6"/><path d="M90 38 L110 30 M90 30 L110 38" stroke="#f8f4f6" stroke-width="3" stroke-linecap="round"/>`,
      'hat-flowers': ['#ff8fa7', '#ffd36e', '#8cc4ff', '#ff8fa7', '#b9a0f6', '#ffd36e', '#9fe0a8'].map((c, i) => { const a = Math.PI * (0.95 - i * 0.15), x = 100 + Math.cos(a) * 62, y = 88 - Math.sin(a) * 56; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${c}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#fff6"/>`; }).join(''),
      'hat-santa': `<path d="M50 54 C56 14 100 2 132 16 C150 24 162 40 166 56 L150 54 Z" fill="#e8455f"/><rect x="46" y="46" width="108" height="16" rx="8" fill="#f8f4f6"/><circle cx="166" cy="58" r="10" fill="#f8f4f6"/>`,
      'hat-viking': `<path d="M54 56 Q56 12 100 10 Q144 12 146 56 Z" fill="#9aa3b5"/><rect x="50" y="48" width="100" height="12" rx="6" fill="#7b8396"/><rect x="95" y="10" width="10" height="44" fill="#7b8396"/><path d="M56 44 Q30 36 28 6 Q44 26 62 30 Z" fill="#f3e6c8"/><path d="M144 44 Q170 36 172 6 Q156 26 138 30 Z" fill="#f3e6c8"/>`,
      'hat-chef': `<rect x="68" y="30" width="64" height="22" rx="4" fill="#f8f4f6"/><circle cx="76" cy="22" r="16" fill="#f8f4f6"/><circle cx="100" cy="14" r="19" fill="#f8f4f6"/><circle cx="124" cy="22" r="16" fill="#f8f4f6"/><path d="M84 36 v12 M100 36 v12 M116 36 v12" stroke="#d8cfe0" stroke-width="2"/>`,
      'hat-crown': `<path d="M68 42 L66 10 L84 26 L100 4 L116 26 L134 10 L132 42 Z" fill="#ffcf5a" stroke="#e0a630" stroke-width="2"/><circle cx="100" cy="30" r="4.5" fill="#ff7d93"/><circle cx="82" cy="34" r="3.5" fill="#8cc4ff"/><circle cx="118" cy="34" r="3.5" fill="#9fe0a8"/>`
    };
    const GL = {
      'glasses-round': `<g stroke="${ink}" stroke-width="3.5" fill="#ffffff22"><circle cx="80" cy="92" r="17"/><circle cx="120" cy="92" r="17"/></g><path d="M97 90 Q100 86 103 90" stroke="${ink}" stroke-width="3.5" fill="none"/>`,
      'glasses-sun': `<rect x="60" y="80" width="38" height="24" rx="10" fill="#1a1422"/><rect x="102" y="80" width="38" height="24" rx="10" fill="#1a1422"/><path d="M98 88 L102 88" stroke="#1a1422" stroke-width="4"/><path d="M66 86 l10 0" stroke="#ffffff60" stroke-width="3" stroke-linecap="round"/><path d="M108 86 l10 0" stroke="#ffffff60" stroke-width="3" stroke-linecap="round"/>`
    };
    const NECK = {
      'neck-bow': `<path d="M100 134 L78 122 L78 146 Z M100 134 L122 122 L122 146 Z" fill="#ff5d7a"/><circle cx="100" cy="134" r="6" fill="#e0405f"/>`,
      'neck-scarf': `<rect x="56" y="124" width="88" height="16" rx="8" fill="#b9a0f6"/><rect x="112" y="132" width="16" height="34" rx="6" fill="#a084ea"/><path d="M66 126 v12 M80 126 v12 M94 126 v12" stroke="#ffffff40" stroke-width="3"/>`
    };
    const hat = HATS[eq.hat] || '', gl = GL[eq.glasses] || '', neck = NECK[eq.neck] || '';
    const cls = 'octo' + (o.bob ? ' bob' : '');
    return `<svg class="${cls}" viewBox="0 -4 200 210" role="img" aria-label="${esc(S.pet.name)} the octopus">
      ${tent}${suck}
      <ellipse cx="100" cy="88" rx="64" ry="58" fill="${col}"/>
      <ellipse cx="76" cy="58" rx="17" ry="10" fill="#ffffff" opacity=".22" transform="rotate(-20 76 58)"/>
      <ellipse cx="64" cy="112" rx="9" ry="5" fill="#ff5d7a" opacity=".35"/><ellipse cx="136" cy="112" rx="9" ry="5" fill="#ff5d7a" opacity=".35"/>
      ${eyes}${brow}${mouth}${gl}${neck}${hat}
    </svg>`;
  }

  /* ---------------- layout chrome ---------------- */
  const NAV = [['lessons.html', 'Lessons', 'lessons'], ['typing-test.html', 'Typing Test', 'test'], ['practice.html', 'Practice', 'practice'], ['challenge.html', 'Challenge', 'challenge'], ['blog/', 'Blog', 'blog'], ['progress.html', 'My Progress', 'progress']];
  const link = h => BASE + h + (BASE.startsWith('file:') && h.endsWith('/') ? 'index.html' : '');
  function header(active) {
    const el = $('#hdr'); if (!el) return;
    if (active === undefined) active = el.dataset.active || '';
    el.className = 'hdr';
    const f = fullness();
    el.innerHTML = `<a class="brand" href="${link('')}${BASE.startsWith('file:') ? 'index.html' : ''}" aria-label="${BRAND.name} home">${octo({ mood: 'happy', eq: { color: 'color-coral', hat: 'hat-phones' } })}<span class="txt">${BRAND.first}<b>${BRAND.second}</b></span></a>
      <nav class="nav" aria-label="Main">${NAV.map(([h, t, k]) => `<a href="${link(h)}" class="${k === active ? 'on' : ''}">${t}</a>`).join('')}</nav>
      <a class="pet-chip" href="${link('inky.html')}" title="${esc(S.pet.name)}'s den — fullness ${Math.round(f)}%">${octo({ mood: mood() })}<span class="hunger ${f < 25 ? 'low' : ''}"></span><span class="cn"><span class="coin">🪙</span> <span id="coinCount">${S.coins}</span></span></a>`;
  }
  function refreshChip() { const c = $('#coinCount'); if (c) c.textContent = S.coins; }
  function footer() {
    // The footer is static HTML (good for SEO); on local preview we fix folder links.
    if (BASE.startsWith('file:')) $$('a[href$="/"]').forEach(a => { if (!/^https?:/.test(a.getAttribute('href'))) a.href = a.href + 'index.html'; });
  }
  // Ad slots: hidden until CONFIG.ADS_ENABLED is true. Then each .ad becomes an AdSense unit.
  function ads() {
    document.body.classList.toggle('no-ads', !CONFIG.ADS_ENABLED);
    if (!CONFIG.ADS_ENABLED) return;
    $$('.ad[data-size]').forEach(a => {
      if (a.dataset.done) return; a.dataset.done = 1;
      const [w, h] = a.dataset.size.split('x').map(Number);
      a.style.width = w + 'px'; a.style.height = h + 'px';
      if (CONFIG.ADSENSE_CLIENT) {
        a.innerHTML = `<ins class="adsbygoogle" style="display:inline-block;width:${w}px;height:${h}px" data-ad-client="${CONFIG.ADSENSE_CLIENT}" data-ad-slot="${a.dataset.slot || ''}"></ins>`;
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
      } else a.innerHTML = `<span class="ad-l">ADVERTISEMENT</span><span class="ad-s">${w} × ${h}</span>`;
    });
  }
  function loadScripts() {
    if (CONFIG.ADS_ENABLED && CONFIG.ADSENSE_CLIENT && !document.getElementById('adsjs')) {
      const s = document.createElement('script'); s.id = 'adsjs'; s.async = true; s.crossOrigin = 'anonymous';
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CONFIG.ADSENSE_CLIENT; document.head.append(s);
    }
    if (CONFIG.GA_ID && S.consent === 'yes' && !window.gtag) {
      const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.GA_ID; document.head.append(s);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date()); gtag('config', CONFIG.GA_ID);
    }
  }
  function track(name, params) { if (window.gtag) gtag('event', name, params || {}); }
  function cookie() {
    if (S.consent) return;
    const d = document.createElement('div'); d.className = 'cookie'; d.setAttribute('role', 'dialog');
    d.innerHTML = `<p>🍪 We use cookies to show ads and measure traffic. Your typing progress stays in your browser. <a href="${link('privacy.html')}">Learn more</a></p><div><button class="btn" data-c="no">Reject</button><button class="btn primary" data-c="yes">Accept</button></div>`;
    d.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; S.consent = b.dataset.c; save(); d.remove(); loadScripts(); });
    document.body.append(d);
  }
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.append(t);
    setTimeout(() => t.remove(), 2200);
  }
  let tipEl;
  const tip = {
    show(x, y, html) {
      if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; document.body.append(tipEl); }
      tipEl.innerHTML = html; tipEl.style.display = 'block';
      const r = tipEl.getBoundingClientRect();
      let lx = x + 14, ly = y - r.height - 10;
      if (lx + r.width > innerWidth - 8) lx = x - r.width - 14;
      if (ly < 8) ly = y + 16;
      tipEl.style.left = lx + 'px'; tipEl.style.top = ly + 'px';
    },
    hide() { if (tipEl) tipEl.style.display = 'none'; }
  };

  function init(active) { header(active); footer(); ads(); cookie(); loadScripts(); }

  window.TO = { BRAND, CONFIG, BASE, link, week, track, get S() { return S; }, save, $, $$, esc, clamp, dayKey, ITEMS, item, fullness, setFull, mood, level, streak, bestStreak, petLine, daysSincePractice, recordSession, octo, init, header, refreshChip, ads, toast, tip };
})();
