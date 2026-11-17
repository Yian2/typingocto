/* TypingOcto — typing trainer (lessons, test, practice) */
(function () {
  'use strict';
  const { $, $$, esc } = TO;

  /* ---------- keyboard model (US QWERTY) ---------- */
  const ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', ['⌫', 'bksp', 1.8]],
    [['Tab', 'tab', 1.5], 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', ['\\', '\\', 1.3]],
    [['Caps', 'caps', 1.8], 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", ['Enter', 'enter', 2]],
    [['Shift', 'lshift', 2.3], 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', ['Shift', 'rshift', 2.5]],
    [['', 'pad1', 3.2], ['Space', ' ', 7], ['', 'pad2', 3.2]]
  ];
  const SHIFTED = { '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/' };
  const FINGERS = {
    LP: ['Left pinky', '#b9a0f6', '`1qaz'], LR: ['Left ring', '#8cc4ff', '2wsx'], LM: ['Left middle', '#9fe0a8', '3edc'], LI: ['Left index', '#ffc17d', '45rtfgvb'],
    RI: ['Right index', '#ff8fa7', '67yuhjnm'], RM: ['Right middle', '#9fe0a8', '8ik,'], RR: ['Right ring', '#8cc4ff', '9ol.'], RP: ['Right pinky', '#b9a0f6', "0-=p[]\\;'/"], T: ['Thumb', '#aaa2b6', ' ']
  };
  const F_OF = {};
  Object.entries(FINGERS).forEach(([f, [, , ks]]) => ks.split('').forEach(k => F_OF[k] = f));
  F_OF.lshift = 'LP'; F_OF.rshift = 'RP';
  function keyFor(ch) {
    if (/[A-Z]/.test(ch)) return { k: ch.toLowerCase(), shift: true };
    if (SHIFTED[ch]) return { k: SHIFTED[ch], shift: true };
    return { k: ch, shift: false };
  }
  function keyboardHTML(cls) {
    return `<div class="kb ${cls || ''}">${ROWS.map(r => `<div class="kb-row">${r.map(x => {
      const [label, k, w] = Array.isArray(x) ? x : [x.toUpperCase(), x, 1];
      const f = F_OF[k];
      const pad = k.startsWith('pad');
      const style = `flex-grow:${w};${f && FINGERS[f] && k !== ' ' ? `--fc:${FINGERS[f][1]}88;` : ''}${pad ? 'visibility:hidden;' : ''}`;
      const home = 'fj'.includes(k) && k.length === 1 ? ' home' : '';
      return `<div class="key${home}" data-k="${esc(k)}" style="${style}">${esc(label)}</div>`;
    }).join('')}</div>`).join('')}</div>`;
  }

  /* ---------- trainer ---------- */
  function mount(root, cfg) {
    const S = TO.S;
    const L = window.LESSONS;
    const mode = cfg.mode;
    const lesson = mode === 'lesson' ? L.list[cfg.lesson - 1] : null;
    const opts = { dur: 30, words: 'common', punct: false, set: 'common' };
    try { Object.assign(opts, JSON.parse(localStorage.getItem('to-opts-' + mode)) || {}); } catch (e) {}

    document.body.classList.add('fit');
    root.innerHTML = `<div class="tr">
      <aside class="tr-side left"><div class="ad" data-size="300x600"></div></aside>
      <section class="tr-main">
        <div class="tr-top">
          <a class="btn" href="${mode === 'lesson' ? 'lessons.html' : 'index.html'}">← ${mode === 'lesson' ? 'Lessons' : 'Home'}</a>
          <div class="tr-title"><div class="eyebrow" id="tBadge"></div><h1 id="tTitle"></h1><p id="tDesc"></p></div>
          <div class="tr-opts" id="tOpts"></div>
        </div>
        <div class="tr-stats">
          <div class="st timer" id="tTimerBox"><b id="tTime">0:00</b><small id="tTimeLbl">time</small></div>
          <span class="sep"></span>
          <div class="st"><b id="tWpm">0</b><small>WPM</small></div>
          <div class="st"><b id="tAcc">100%</b><small>Accuracy</small></div>
          <div class="st"><b id="tErr">0</b><small>Errors</small></div>
          <span class="sep"></span>
          <button class="btn" id="tRestart" title="Restart (Esc)">↻ Restart <kbd>Esc</kbd></button>
        </div>
        <div class="bar"><div id="tBar"></div></div>
        <div class="tr-text" id="tText"><div class="tr-view"><div class="tr-inner" id="tInner"></div></div><div class="tr-focus hidden" id="tFocus">Click here or press any key to continue</div></div>
        <div class="tr-bottom">
          <div id="tKb">${keyboardHTML()}</div>
          <div class="tr-hint"><span class="finger"><span class="dot" id="tDot"></span>Next: <b id="tKey">F</b> — <span id="tFinger">Left index</span></span><span>Hold <b>F</b> &amp; <b>J</b> bumps · Don't look down 👀</span></div>
        </div>
        <input class="sr-input" id="tInput" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Typing input">
      </section>
      <aside class="tr-side"><div class="tr-pet"><div class="bubble" id="tBubble"></div><div id="tPet"></div></div><div class="ad" data-size="300x250"></div></aside>
    </div>
    <div class="modal hidden" id="tModal" role="dialog" aria-modal="true"><div class="modal-card" id="tModalCard"></div></div>`;
    TO.ads();

    const el = id => $('#' + id, document);
    const inner = el('tInner'), view = inner.parentElement;
    let text = '', chars = [], pos = 0, attempts = 0, mistakes = 0, errAt = new Set(), started = 0, ended = false, iv = null;

    /* title + options */
    function headings() {
      if (mode === 'lesson') {
        const u = L.units[lesson.unit];
        el('tBadge').textContent = `Lesson ${lesson.id} / 100 · ${u.title}`;
        el('tTitle').textContent = lesson.title;
        el('tDesc').textContent = lesson.desc;
        const prev = S.lessons[lesson.id];
        el('tOpts').innerHTML = `${lesson.id > 1 ? `<a class="btn" href="lesson.html?n=${lesson.id - 1}" title="Previous lesson">‹</a>` : ''}<span class="btn" title="Best result">${prev ? starsHTML(prev.stars) : '<span class="muted">Not done</span>'}</span>${lesson.id < 100 ? `<a class="btn" href="lesson.html?n=${lesson.id + 1}" title="Next lesson">›</a>` : ''}`;
      } else if (mode === 'test') {
        el('tBadge').textContent = 'Typing speed test';
        el('tTitle').textContent = `${opts.dur}-second typing test`;
        el('tDesc').textContent = 'The timer starts with your first key.';
        el('tOpts').innerHTML = `<div class="seg" id="oDur">${[15, 30, 60, 120].map(d => `<button data-v="${d}" class="${opts.dur == d ? 'on' : ''}">${d < 60 ? d + 's' : d / 60 + 'm'}</button>`).join('')}</div>
          <div class="seg" id="oWords">${[['common', 'Easy'], ['advanced', 'Hard']].map(([v, t]) => `<button data-v="${v}" class="${opts.words === v ? 'on' : ''}">${t}</button>`).join('')}</div>
          <button class="btn ${opts.punct ? 'on' : ''}" id="oPunct" title="Add capitals and punctuation">Aa.,</button>`;
      } else if (mode === 'challenge') {
        const wk = TO.week(), hat = TO.item(wk.hat), won = S.pet.owned.includes(wk.hat), best = S.challenge && S.challenge.n === wk.n ? S.challenge : null;
        el('tBadge').textContent = `Weekly challenge · ends in ${wk.left}`;
        el('tTitle').textContent = `Win the ${hat.name} ${hat.icon}`;
        el('tDesc').textContent = won ? 'You already won this week\'s hat! Beat your best score.' : 'Finish the text with 90% accuracy or more.';
        el('tOpts').innerHTML = `<span class="btn" title="Your best this week">${best ? `🏆 Best: ${best.wpm} WPM · ${best.acc}%` : '🏆 Not played yet'}</span>`;
      } else {
        el('tBadge').textContent = 'Free practice';
        el('tTitle').textContent = { common: 'Common words', weak: 'Your weak keys', numbers: 'Numbers', sentences: 'Sentences' }[opts.set];
        el('tDesc').textContent = opts.set === 'weak' ? `Focus on: ${weakKeys().map(k => k.toUpperCase()).join(' ') || 'type more to detect them'}` : 'No timer pressure. Just practise.';
        el('tOpts').innerHTML = `<div class="seg" id="oSet">${[['common', 'Words'], ['weak', 'Weak keys'], ['numbers', 'Numbers'], ['sentences', 'Sentences']].map(([v, t]) => `<button data-v="${v}" class="${opts.set === v ? 'on' : ''}">${t}</button>`).join('')}</div>`;
      }
      const bind = (id, key, conv) => { const s = el(id); if (s) s.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; opts[key] = conv ? conv(b.dataset.v) : b.dataset.v; persist(); headings(); reset(); b.blur(); }); };
      bind('oDur', 'dur', Number); bind('oWords', 'words'); bind('oSet', 'set');
      const p = el('oPunct'); if (p) p.onclick = () => { opts.punct = !opts.punct; persist(); headings(); reset(); };
    }
    function persist() { try { localStorage.setItem('to-opts-' + mode, JSON.stringify(opts)); } catch (e) {} }
    function weakKeys() {
      return Object.entries(S.keys).filter(([k, v]) => /[a-z]/.test(k) && v.h + v.m >= 8).map(([k, v]) => [k, v.m / (v.h + v.m)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
    }
    function makeText() {
      if (mode === 'lesson') return L.textFor(lesson);
      if (mode === 'challenge') return L.CHALLENGES[TO.week().n % L.CHALLENGES.length];
      if (mode === 'test') { const t = L.gens[opts.words](); return (opts.punct ? L.punctuate(t) : t) + ' '; }
      return opts.set === 'weak' ? L.gens.weak(weakKeys()) : L.gens[opts.set]();
    }

    /* rendering */
    function render(append) {
      const start = append ? chars.length : 0;
      if (!append) { inner.innerHTML = ''; chars = []; }
      const frag = document.createDocumentFragment();
      const src = append ? append : text;
      const words = src.split(' ');
      words.forEach((w, wi) => {
        const ws = document.createElement('span'); ws.className = 'w';
        const piece = w + (wi < words.length - 1 ? ' ' : '');
        if (!piece) return;
        for (const ch of piece) { const c = document.createElement('span'); c.className = 'c' + (ch === ' ' ? ' sp' : ''); c.textContent = ch; ws.append(c); chars.push(c); }
        frag.append(ws);
      });
      inner.append(frag);
      return start;
    }
    function caret() {
      chars.forEach(c => c.classList.remove('cur', 'bad'));
      const c = chars[pos]; if (!c || ended) return;
      c.classList.add('cur');
      const lh = parseFloat(getComputedStyle(inner).lineHeight) || 40;
      const line = Math.round(c.offsetTop / lh);
      inner.style.transform = `translateY(${-Math.max(0, line - 1) * lh}px)`;
    }
    function hintKey() {
      $$('.key', el('tKb')).forEach(k => k.classList.remove('next', 'shiftnext'));
      const ch = text[pos];
      if (ch === undefined || ended) { el('tKey').textContent = '✓'; el('tFinger').textContent = 'done'; return; }
      const { k, shift } = keyFor(ch);
      const kEl = el('tKb').querySelector(`.key[data-k="${CSS.escape(k)}"]`);
      if (kEl) kEl.classList.add('next');
      const f = F_OF[k] || 'T';
      if (shift) { const sk = f[0] === 'L' ? 'rshift' : 'lshift'; const s = el('tKb').querySelector(`[data-k="${sk}"]`); if (s) s.classList.add('shiftnext'); }
      el('tKey').textContent = ch === ' ' ? 'Space' : (shift ? 'Shift + ' : '') + k.toUpperCase();
      el('tFinger').textContent = FINGERS[f][0] + ' finger';
      el('tDot').style.background = FINGERS[f][1];
    }
    function elapsed() { return started ? (Date.now() - started) / 1000 : 0; }
    function calc() {
      const secs = mode === 'test' ? Math.min(elapsed(), opts.dur) : elapsed();
      const wpm = secs > 1 ? Math.round((pos / 5) / (secs / 60)) : 0;
      const acc = attempts ? Math.round((attempts - mistakes) / attempts * 100) : 100;
      return { secs, wpm, acc };
    }
    const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    function stats() {
      const { secs, wpm, acc } = calc();
      el('tWpm').textContent = wpm; el('tAcc').textContent = acc + '%'; el('tErr').textContent = mistakes;
      if (mode === 'test') {
        const left = Math.max(0, opts.dur - secs);
        el('tTime').textContent = fmt(Math.ceil(left)); el('tTimeLbl').textContent = 'time left';
        el('tTimerBox').classList.toggle('warn', started && left <= 5);
        el('tBar').style.width = (secs / opts.dur * 100) + '%';
      } else {
        el('tTime').textContent = fmt(secs); el('tTimeLbl').textContent = 'time';
        el('tBar').style.width = (pos / text.length * 100) + '%';
      }
    }
    function bubble(msg) { el('tBubble').textContent = msg; }
    function pet(m) {
      const eq = mode === 'challenge' ? Object.assign({}, S.pet.eq, { hat: TO.week().hat }) : undefined; // preview the prize
      el('tPet').innerHTML = TO.octo({ mood: m || TO.mood(), bob: true, eq });
    }

    function reset() {
      clearInterval(iv); iv = null;
      text = makeText(); pos = 0; attempts = 0; mistakes = 0; errAt = new Set(); started = 0; ended = false;
      render(); caret(); hintKey(); stats();
      el('tModal').classList.add('hidden');
      bubble(mode === 'test' ? 'Start typing whenever you are ready. Good luck! 🍀' : mode === 'challenge' ? `Look at me in the ${TO.item(TO.week().hat).name}! Win it for me with 90% accuracy 🙏` : mode === 'lesson' && lesson.id <= 2 ? 'Put your index fingers on F and J. Feel the little bumps? 👆' : TO.petLine());
      pet();
      focus();
    }
    function focus() { el('tInput').focus({ preventScroll: true }); el('tText').classList.add('focused'); el('tFocus').classList.add('hidden'); }

    function press(k, bad) {
      const kEl = el('tKb').querySelector(`.key[data-k="${CSS.escape(k)}"]`); if (!kEl) return;
      kEl.classList.add(bad ? 'miss' : 'press'); setTimeout(() => kEl.classList.remove('miss', 'press'), bad ? 220 : 110);
    }
    function typed(ch) {
      if (ended) return;
      if (!started) { started = Date.now(); iv = setInterval(tick, 100); }
      const exp = text[pos];
      if (exp === undefined) return;
      attempts++;
      const kk = exp === ' ' ? ' ' : exp.toLowerCase();
      const ks = S.keys[kk] || (S.keys[kk] = { h: 0, m: 0 });
      if (ch === exp) {
        ks.h++;
        chars[pos].classList.add(errAt.has(pos) ? 'fix' : 'ok');
        press(keyFor(ch).k, false);
        pos++;
        if (mode === 'test' && text.length - pos < 120) { const more = L.gens[opts.words](); const add = (opts.punct ? L.punctuate(more) : more) + ' '; render(add); text += add; }
        if (mode !== 'test' && pos >= text.length) return finish();
      } else {
        ks.m++; mistakes++; errAt.add(pos);
        press(keyFor(ch).k, true);
        caret(); chars[pos].classList.add('bad');
        if (mistakes === 5 && attempts < 40) bubble('Slow down a little — accuracy first! 🐢');
        stats(); hintKey(); return;
      }
      caret(); hintKey(); stats();
    }
    function tick() { if (mode === 'test' && elapsed() >= opts.dur) finish(); else stats(); }

    function starsHTML(n) { return `<span class="stars">${[1, 2, 3].map(i => i <= n ? '★' : '<span class="off">★</span>').join('')}</span>`; }
    function finish() {
      if (ended) return; ended = true; clearInterval(iv);
      stats(); caret(); hintKey();
      const { secs, wpm, acc } = calc();
      let stars = 0, title, sub;
      if (mode === 'lesson') {
        stars = acc >= 96 && wpm >= lesson.target ? 3 : acc >= 92 ? 2 : acc >= 85 ? 1 : 0;
        const prev = S.lessons[lesson.id] || { stars: 0, wpm: 0, acc: 0 };
        S.lessons[lesson.id] = { stars: Math.max(prev.stars, stars), wpm: Math.max(prev.wpm, wpm), acc: Math.max(prev.acc, acc) };
        title = stars === 3 ? 'Perfect! 🎉' : stars ? 'Lesson complete!' : 'Almost there!';
        sub = stars === 3 ? 'Three stars — Inky is dancing!' : stars ? `Get ${acc < 96 ? '96% accuracy' : ''}${acc < 96 && wpm < lesson.target ? ' and ' : ''}${wpm < lesson.target ? lesson.target + ' WPM' : ''} for 3 stars.` : 'You need 85% accuracy to pass. Slow down and try again!';
      } else if (mode === 'test') {
        title = wpm >= 60 ? 'Lightning fingers! ⚡' : wpm >= 40 ? 'Great speed! 🚀' : wpm >= 25 ? 'Nice work! 👏' : 'Good start! 🌱';
        sub = `Average typist: ~40 WPM. ${S.sessions.filter(s => s.m === 'test').length ? 'Your best: ' + Math.max(wpm, ...S.sessions.filter(s => s.m === 'test').map(s => s.w)) + ' WPM' : 'This is your first test!'}`;
      } else if (mode === 'challenge') {
        const wk = TO.week(), hat = TO.item(wk.hat);
        const prev = S.challenge && S.challenge.n === wk.n ? S.challenge : { n: wk.n, wpm: 0, acc: 0 };
        S.challenge = { n: wk.n, wpm: Math.max(prev.wpm, acc >= 90 ? wpm : 0), acc: Math.max(prev.acc, acc) };
        if (acc >= 90 && !S.pet.owned.includes(wk.hat)) { S.pet.owned.push(wk.hat); S.pet.eq.hat = wk.hat; title = `You won the ${hat.name}! ${hat.icon}`; sub = `${S.pet.name} is wearing it right now. Come back next week for a new prize!`; }
        else if (acc >= 90) { title = 'Challenge complete! 🏆'; sub = 'You already have this week\'s hat. Share your score and challenge your friends!'; }
        else { title = 'So close!'; sub = `You need 90% accuracy to win the ${hat.name}. Try again a little slower.`; }
      } else { title = 'Practice done! ✅'; sub = 'Every session makes your fingers smarter.'; }
      const res = TO.recordSession({ mode: mode === 'challenge' ? 'test' : mode, wpm, acc, secs, lesson: lesson ? lesson.id : null, stars });
      TO.track('typing_complete', { mode, wpm, accuracy: acc, lesson: lesson ? lesson.id : undefined });
      TO.refreshChip();
      const good = mode === 'lesson' ? stars > 0 : acc >= (mode === 'challenge' ? 90 : 80);
      const next = mode === 'lesson' ? (stars && lesson.id < 100 ? { href: `lesson.html?n=${lesson.id + 1}`, t: 'Next lesson →' } : null) : null;
      el('tModalCard').innerHTML = `${TO.octo({ mood: good ? 'happy' : 'ok' })}
        <h2>${title}</h2>
        ${mode === 'lesson' ? `<div class="big-stars">${starsHTML(stars)}</div>` : ''}
        <p class="sub">${esc(sub)}</p>
        <div class="res-grid"><div><b>${wpm}</b><small>WPM</small></div><div><b>${acc}%</b><small>Accuracy</small></div><div><b>${fmt(secs)}</b><small>Time</small></div></div>
        <div class="reward"><span>+${res.coins} 🪙 coins</span>${res.notes.map(n => `<span>${esc(n)}</span>`).join('')}${res.levelUp ? `<span>${esc(S.pet.name)} reached level ${res.levelUp}! 🎉</span>` : ''}</div>
        <div class="res-actions">
          <button class="btn" id="mRetry">↻ Try again <kbd>Esc</kbd></button>
          ${next ? `<a class="btn primary" id="mNext" href="${next.href}">${next.t} <kbd>Enter</kbd></a>` : mode === 'lesson' ? '' : `<button class="btn primary" id="mNext">New ${mode === 'test' ? 'test' : 'text'} <kbd>Enter</kbd></button>`}
          ${good && mode !== 'practice' ? `<button class="btn share" id="mShare">📸 Share your score</button>` : ''}
          <a class="btn" href="inky.html">🐙 Feed ${esc(S.pet.name)}</a>
        </div>`;
      el('tModal').classList.remove('hidden');
      el('mRetry').onclick = reset;
      const sh = el('mShare');
      if (sh) sh.onclick = () => shareScore({ wpm, acc, mode, label: mode === 'lesson' ? `Lesson ${lesson.id}: ${lesson.title}` : mode === 'challenge' ? 'Weekly typing challenge' : `${opts.dur}-second typing test`, stars });
      const n = el('mNext'); if (n && n.tagName === 'BUTTON') n.onclick = reset;
      bubble(good ? `Yay! +${res.coins} coins. Can we buy something? 😋` : 'Don\'t worry, let\'s try once more!');
      pet(good ? 'happy' : 'ok');
    }

    /* input handling */
    document.addEventListener('keydown', e => {
      const modalOpen = !el('tModal').classList.contains('hidden');
      if (e.key === 'Escape') { e.preventDefault(); reset(); return; }
      if (modalOpen) {
        if (e.key === 'Enter') { e.preventDefault(); const n = el('mNext'); if (n) n.click(); else reset(); }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest && e.target.closest('input:not(#tInput),select,textarea')) return;
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'Backspace') { if (e.key !== 'Tab') e.preventDefault(); return; }
      if (e.key.length === 1) { e.preventDefault(); focus(); typed(e.key); }
    });
    el('tInput').addEventListener('input', e => { const v = e.target.value; e.target.value = ''; for (const c of v) typed(c); });
    el('tInput').addEventListener('blur', () => { el('tText').classList.remove('focused'); if (started && !ended && 'ontouchstart' in window) el('tFocus').classList.remove('hidden'); });
    el('tText').addEventListener('click', focus);
    el('tRestart').addEventListener('click', e => { e.currentTarget.blur(); reset(); });
    el('tModal').addEventListener('click', e => { if (e.target.id === 'tModal') el('tModal').classList.add('hidden'); });
    addEventListener('resize', caret);

    headings(); reset();
  }

  /* ---------- "Share your score" image (1080×1350, good for Instagram, TikTok & WhatsApp) ---------- */
  async function scoreImage(r) {
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#46284a'); g.addColorStop(.55, '#2b2340'); g.addColorStop(1, '#1d3a33');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,255,.06)';
    [[120, 200, 40], [950, 320, 60], [880, 980, 30], [160, 1060, 55], [540, 90, 22]].forEach(([cx, cy, rr]) => { x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); });
    try { await document.fonts.ready; } catch (e) {}
    const F = 'Inter, "Segoe UI", system-ui, sans-serif';
    x.textAlign = 'center';
    x.fillStyle = '#ffc17d'; x.font = `800 38px ${F}`; x.fillText(r.label.toUpperCase().slice(0, 40), W / 2, 120);
    x.fillStyle = '#f8f4f6'; x.font = `900 250px ${F}`; x.fillText(r.wpm, W / 2, 370);
    x.font = `800 64px ${F}`; x.fillText('WORDS PER MINUTE', W / 2, 450);
    x.fillStyle = '#d6ccd9'; x.font = `600 46px ${F}`; x.fillText(`${r.acc}% accuracy${r.stars ? '  ·  ' + '★'.repeat(r.stars) : ''}`, W / 2, 525);
    const svg = TO.octo({ mood: 'happy' }).replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" width="460" height="483"');
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    try { await img.decode(); x.drawImage(img, (W - 460) / 2, 560, 460, 483); } catch (e) {}
    x.fillStyle = '#f8f4f6'; x.font = `800 58px ${F}`; x.fillText('Can you beat me? 🐙', W / 2, 1140);
    x.fillStyle = '#ffc17d'; const pw = 560, ph = 92; const px = (W - pw) / 2, py = 1190;
    x.beginPath(); if (x.roundRect) x.roundRect(px, py, pw, ph, 46); else x.rect(px, py, pw, ph); x.fill();
    x.fillStyle = '#2b1c2f'; x.font = `900 46px ${F}`; x.fillText(TO.BRAND.domain, W / 2, py + 62);
    return new Promise(res => c.toBlob(res, 'image/png'));
  }
  async function shareScore(r) {
    const text = `I type ${r.wpm} WPM with ${r.acc}% accuracy on ${TO.BRAND.name}! 🐙 Can you beat me?`;
    const url = 'https://' + TO.BRAND.domain + '/typing-test.html';
    const blob = await scoreImage(r);
    const file = new File([blob], `typingocto-${r.wpm}wpm.png`, { type: 'image/png' });
    TO.track('share', { method: 'score_image', wpm: r.wpm });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: text + ' ' + url }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.append(a); a.click(); a.remove();
    try { await navigator.clipboard.writeText(text + ' ' + url); } catch (e) {}
    TO.toast('📸 Image saved! Caption copied — post it on TikTok or Instagram');
  }

  window.Trainer = { mount, keyboardHTML, FINGERS, F_OF, scoreImage };
})();
