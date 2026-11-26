/* TypingOcto — page renderers: home, lessons, progress, den */
(function () {
  'use strict';
  const { $, $$, esc } = TO;
  const L = window.LESSONS;
  const starsHTML = n => `<span class="stars">${[1, 2, 3].map(i => i <= n ? '★' : '<span class="off">★</span>').join('')}</span>`;
  const nextLesson = () => { const S = TO.S; const l = L.list.find(x => !(S.lessons[x.id] && S.lessons[x.id].stars)); return l || L.list[99]; };
  const tileHTML = (l, next) => {
    const r = TO.S.lessons[l.id];
    return `<a class="ltile ${r && r.stars ? 'done' : ''} ${next ? 'next' : ''} ${l.check ? 'check' : ''}" href="lesson.html?n=${l.id}">
      <span class="n">${l.id}</span>${r ? starsHTML(r.stars) : ''}<strong>${esc(l.title)}</strong><small>${l.check ? '🏁 Checkpoint' : esc(L.units[l.unit].title)}</small></a>`;
  };

  /* ---------------- HOME ---------------- */
  function home() {
    const S = TO.S, nx = nextLesson();
    const f = Math.round(TO.fullness());
    $('#heroPet').innerHTML = `<div class="bubble">${esc(TO.petLine())}</div>${TO.octo({ bob: true })}
      <div class="feed">${esc(S.pet.name)}'s tummy <div class="bar"><div style="width:${f}%"></div></div> ${f}% · <a href="inky.html" style="color:var(--accent)">Visit den</a></div>`;
    const wk = TO.week(), hat = TO.item(wk.hat), won = S.pet.owned.includes(wk.hat);
    $('#weekly').innerHTML = `<div class="weekly-pet">${TO.octo({ mood: 'happy', eq: Object.assign({}, S.pet.eq, { hat: wk.hat }) })}</div>
      <div><div class="eyebrow">🏆 Weekly challenge · ends in ${esc(wk.left)}</div><strong>${won ? `You won the ${esc(hat.name)}! Beat your score?` : `Win the exclusive ${esc(hat.name)} for ${esc(S.pet.name)}`}</strong><small>One text, 90% accuracy. A new prize every Monday.</small></div>
      <a class="btn primary" href="challenge.html">${won ? 'Play again' : 'Take the challenge'} →</a>`;
    $('#ctaLesson').href = `lesson.html?n=${nx.id}`;
    $('#ctaLesson').textContent = S.sessions.length ? `Continue: Lesson ${nx.id} →` : 'Start Lesson 1 — free →';
    const start = Math.max(0, Math.min(nx.id - 1, 95));
    $('#path').innerHTML = L.list.slice(start, start + 5).map(l => tileHTML(l, l.id === nx.id)).join('');
    const done = Object.values(S.lessons).filter(x => x.stars).length;
    const best = S.sessions.length ? Math.max(...S.sessions.map(s => s.w)) : 0;
    const accs = S.sessions.slice(-10).map(s => s.a);
    $('#miniStats').innerHTML = `<h3>📊 Your progress</h3>
      <div class="row"><span>Lessons done</span><b>${done} / 100</b></div>
      <div class="row"><span>Best speed</span><b>${best ? best + ' WPM' : '—'}</b></div>
      <div class="row"><span>Avg. accuracy</span><b>${accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) + '%' : '—'}</b></div>
      <div class="row"><span>Day streak</span><b>${TO.streak()} 🔥</b></div>
      <a class="btn" style="width:100%;justify-content:center;margin-top:8px" href="progress.html">See charts →</a>`;
  }

  /* ---------------- LESSONS ---------------- */
  function lessons() {
    const S = TO.S, nx = nextLesson();
    const done = Object.values(S.lessons).filter(x => x.stars).length;
    const stars = Object.values(S.lessons).reduce((a, x) => a + x.stars, 0);
    $('#overall').innerHTML = `<div style="text-align:right"><div style="font-weight:800">${done}/100 lessons · ${stars}/300 ★</div><div class="bar" style="margin-top:6px"><div style="width:${done}%"></div></div></div><a class="btn primary big" href="lesson.html?n=${nx.id}">${done ? 'Continue' : 'Start'}: Lesson ${nx.id} →</a>`;
    $('#units').innerHTML = L.units.map((u, ui) => {
      const ls = L.list.filter(l => l.unit === ui);
      const ud = ls.filter(l => S.lessons[l.id] && S.lessons[l.id].stars).length;
      const ad = ui === 2 || ui === 6 ? `<div class="ad-wrap" style="margin:22px 0"><div class="ad" data-size="728x90"></div></div>` : '';
      return `<section class="unit" id="unit-${ui + 1}"><div class="unit-h"><span class="badge">${u.icon}</span><div><h2>Unit ${ui + 1}: ${esc(u.title)}</h2><p>${esc(u.desc)}</p></div>
        <div class="u-prog">${ud}/10 done<div class="bar"><div style="width:${ud * 10}%"></div></div></div></div>
        <div class="unit-grid">${ls.map(l => tileHTML(l, l.id === nx.id)).join('')}</div></section>${ad}`;
    }).join('');
    TO.ads();
  }

  /* ---------------- PROGRESS ---------------- */
  function progress() {
    const S = TO.S, ss = S.sessions;
    const done = Object.values(S.lessons).filter(x => x.stars).length;
    const stars = Object.values(S.lessons).reduce((a, x) => a + x.stars, 0);
    const best = ss.length ? Math.max(...ss.map(s => s.w)) : 0;
    const last10 = ss.slice(-10);
    const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0;
    const prev10 = ss.slice(-20, -10);
    const delta = prev10.length ? avg(last10.map(s => s.w)) - avg(prev10.map(s => s.w)) : null;
    const mins = Math.round(S.totalSecs / 60);
    const tiles = [
      ['Best speed', best ? best + '<em> WPM</em>' : '—', ''],
      ['Avg speed (last 10)', last10.length ? avg(last10.map(s => s.w)) + '<em> WPM</em>' : '—', delta === null ? '' : (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta) + ' vs previous 10'],
      ['Avg accuracy', last10.length ? avg(last10.map(s => s.a)) + '%' : '—', 'last 10 sessions'],
      ['Lessons done', done + '<em> / 100</em>', ''],
      ['Stars earned', stars + '<em> / 300</em>', ''],
      ['Current streak', TO.streak() + '<em> days</em>', 'best: ' + TO.bestStreak()],
      ['Time practised', mins >= 60 ? Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm' : mins + '<em> min</em>', ''],
      ['Sessions', ss.length, ss.filter(s => s.m === 'test').length + ' speed tests']
    ];
    $('#tiles').innerHTML = tiles.map(([k, v, e]) => `<div class="tile"><small>${k}</small><b>${v}</b>${e ? `<em>${e}</em>` : ''}</div>`).join('');

    const data = ss.slice(-40);
    const label = s => s.m === 'lesson' ? 'Lesson ' + s.l : s.m === 'test' ? 'Speed test' : 'Practice';
    const dateStr = t => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    lineChart($('#cWpm'), data.map(s => ({ y: s.w, tip: `<b>${s.w} WPM</b> <span>· ${label(s)} · ${dateStr(s.t)}</span>` })), { color: '#ffc17d', unit: 'WPM', empty: 'Finish a lesson or a speed test to see your speed grow here 📈' });
    lineChart($('#cAcc'), data.map(s => ({ y: s.a, tip: `<b>${s.a}%</b> <span>· ${label(s)} · ${dateStr(s.t)}</span>` })), { color: '#9fe0a8', unit: '%', min: Math.min(80, ...data.map(s => s.a)), max: 100, empty: 'Your accuracy will appear here 🎯' });
    heatmap($('#heat'));
    calendar($('#cal'));
    addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(progress, 150); }, { once: true });
  }

  function lineChart(box, pts, o) {
    if (pts.length < 2) { box.innerHTML = `<div class="empty">${o.empty}</div>`; return; }
    box.innerHTML = '';
    const W = box.clientWidth, Hh = box.clientHeight, P = { l: 34, r: 10, t: 10, b: 18 };
    const ys = pts.map(p => p.y);
    let min = o.min !== undefined ? o.min : 0, max = o.max !== undefined ? o.max : Math.max(20, Math.ceil((Math.max(...ys) + 4) / 20) * 20);
    min = Math.floor(min / 20) * 20;
    const X = i => P.l + i * (W - P.l - P.r) / (pts.length - 1);
    const Y = v => P.t + (1 - (v - min) / (max - min)) * (Hh - P.t - P.b);
    const ticks = 4; let grid = '';
    for (let i = 0; i <= ticks; i++) { const v = Math.round(min + (max - min) * i / ticks); const y = Y(v); grid += `<line x1="${P.l}" x2="${W - P.r}" y1="${y}" y2="${y}" stroke="#3a2f46" stroke-width="1"/><text x="${P.l - 6}" y="${y + 3.5}" text-anchor="end" font-size="10" fill="#7d7389">${v}</text>`; }
    const d = pts.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join(' ');
    const area = d + ` L${X(pts.length - 1)} ${Hh - P.b} L${X(0)} ${Hh - P.b} Z`;
    const id = 'g' + Math.random().toString(36).slice(2, 7);
    const last = pts[pts.length - 1];
    box.innerHTML = `<svg viewBox="0 0 ${W} ${Hh}" aria-label="${o.unit} chart">
      <defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${o.color}" stop-opacity=".22"/><stop offset="1" stop-color="${o.color}" stop-opacity="0"/></linearGradient></defs>
      ${grid}<text x="${P.l}" y="${Hh - 3}" font-size="10" fill="#7d7389">older</text><text x="${W - P.r}" y="${Hh - 3}" font-size="10" fill="#7d7389" text-anchor="end">latest</text>
      <path d="${area}" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${o.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${X(pts.length - 1)}" cy="${Y(last.y)}" r="4.5" fill="${o.color}" stroke="#211b2c" stroke-width="2"/>
      <g class="hov" style="display:none"><line y1="${P.t}" y2="${Hh - P.b}" stroke="#aaa2b6" stroke-width="1" stroke-dasharray="3 3"/><circle r="5" fill="${o.color}" stroke="#211b2c" stroke-width="2"/></g>
      <rect x="${P.l}" y="0" width="${W - P.l - P.r}" height="${Hh}" fill="transparent"/></svg>`;
    const svg = box.querySelector('svg'), hov = svg.querySelector('.hov');
    svg.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect(); const x = (e.clientX - r.left) * W / r.width;
      const i = Math.max(0, Math.min(pts.length - 1, Math.round((x - P.l) / ((W - P.l - P.r) / (pts.length - 1)))));
      hov.style.display = ''; hov.querySelector('line').setAttribute('x1', X(i)); hov.querySelector('line').setAttribute('x2', X(i));
      const c = hov.querySelector('circle'); c.setAttribute('cx', X(i)); c.setAttribute('cy', Y(pts[i].y));
      TO.tip.show(e.clientX, e.clientY, pts[i].tip);
    });
    svg.addEventListener('mouseleave', () => { hov.style.display = 'none'; TO.tip.hide(); });
  }

  function heatmap(box) {
    const S = TO.S;
    box.innerHTML = Trainer.keyboardHTML('nocolor');
    const rates = {};
    Object.entries(S.keys).forEach(([k, v]) => { const n = v.h + v.m; if (n >= 5) rates[k] = { r: v.m / n, n, m: v.m }; });
    const maxR = Math.max(0.05, ...Object.values(rates).map(x => x.r));
    $$('.key', box).forEach(el => {
      const k = el.dataset.k, x = rates[k];
      if (x) el.style.background = `rgba(255,125,147,${(0.08 + 0.82 * x.r / maxR).toFixed(2)})`;
      el.addEventListener('mousemove', e => TO.tip.show(e.clientX, e.clientY, x ? `<b>${k === ' ' ? 'Space' : esc(k.toUpperCase())}</b> <span>· ${x.m} errors / ${x.n} presses (${(x.r * 100).toFixed(1)}%)</span>` : `<b>${k === ' ' ? 'Space' : esc(k.length > 1 ? k : k.toUpperCase())}</b> <span>· not enough data yet</span>`));
      el.addEventListener('mouseleave', TO.tip.hide);
    });
    const worst = Object.entries(rates).filter(([k, x]) => x.m > 0 && k !== ' ').sort((a, b) => b[1].r - a[1].r).slice(0, 3).map(([k]) => k.toUpperCase());
    $('#heatNote').innerHTML = worst.length ? `Weakest: <b style="color:var(--ink)">${worst.map(esc).join(' · ')}</b> · <a href="practice.html" style="color:var(--accent)" onclick="try{localStorage.setItem('to-opts-practice',JSON.stringify({set:'weak'}))}catch(e){}">Practise them →</a>` : 'Hover a key for details';
  }

  function calendar(box) {
    const S = TO.S, weeks = 20;
    const end = new Date(); end.setHours(12, 0, 0, 0);
    const start = new Date(end); start.setDate(start.getDate() - (weeks * 7 - 1));
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    let html = '';
    const lvl = s => !s ? 0 : s < 120 ? 1 : s < 600 ? 2 : s < 1500 ? 3 : 4;
    const alpha = [0, .25, .5, .75, 1];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = TO.dayKey(d), s = S.days[k] || 0, l = lvl(s);
      html += `<i data-d="${k}" data-s="${s}" style="${l ? `background:rgba(159,224,168,${alpha[l]})` : ''}"></i>`;
    }
    box.innerHTML = html;
    $$('i', box).forEach(i => {
      i.addEventListener('mousemove', e => { const s = +i.dataset.s; TO.tip.show(e.clientX, e.clientY, `<b>${s ? Math.max(1, Math.round(s / 60)) + ' min' : 'No practice'}</b> <span>· ${new Date(i.dataset.d + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>`); });
      i.addEventListener('mouseleave', TO.tip.hide);
    });
    $('#streakBox').innerHTML = `<div><b>${TO.streak()} 🔥</b>current streak</div><div><b>${TO.bestStreak()}</b>best streak</div><div><b>${Object.keys(S.days).length}</b>days practised</div>`;
  }

  /* ---------------- DEN (pet + shop) ---------------- */
  let tab = 'food';
  function den(o) {
    o = o || {};
    const S = TO.S, p = S.pet, f = Math.round(TO.fullness()), lv = TO.level();
    const room = TO.item(p.eq.room) || TO.item('room-ocean');
    $('#room').style.background = room.sw;
    const moodTxt = { happy: 'Happy 😄', ok: 'Calm 🙂', hungry: 'Hungry 😫', sad: 'Missing you 🥺' }[TO.mood()];
    $('#room').innerHTML = `<div class="room-top"><div class="room-name"><h1>${esc(p.name)} <button id="rename" title="Rename">✏️</button></h1><small>Level ${lv.lv} octopus · ${moodTxt}</small></div><div class="coins-big">🪙 ${S.coins}</div></div>
      <span class="fx b1"></span><span class="fx b2"></span><span class="fx b3"></span><span class="fx b4"></span><div class="floor"></div>
      <div class="bubble">${esc(o.say || TO.petLine())}</div>${TO.octo({ bob: true })}
      <div class="meters"><div class="meter full">Tummy ${f}%<div class="bar"><div style="width:${f}%"></div></div></div>
      <div class="meter xp">Level ${lv.lv} · ${lv.xp}/${lv.need} XP<div class="bar"><div style="width:${lv.xp / lv.need * 100}%"></div></div></div>
      <div class="meter">Streak ${TO.streak()} 🔥<div class="bar"><div style="width:${Math.min(100, TO.streak() / 7 * 100)}%"></div></div></div></div>`;
    if (o.fromFull != null) { // animate the tummy bar from the old value to the new one
      const bar = $('.meter.full .bar>div');
      bar.style.transition = 'none'; bar.style.width = o.fromFull + '%'; void bar.offsetWidth;
      bar.style.transition = ''; bar.style.width = f + '%';
    }
    $('#rename').onclick =() => { const n = prompt('New name for your octopus:', p.name); if (n && n.trim()) { p.name = n.trim().slice(0, 16); TO.save(); den(); TO.header(''); } };
    const TABS = [['food', '🍤 Food'], ['hat', '🎩 Hats'], ['glasses', '👓 Glasses'], ['neck', '🎀 Neck'], ['color', '🎨 Colors'], ['room', '🏝️ Rooms']];
    $('#tabs').innerHTML = TABS.map(([k, t]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${t}</button>`).join('');
    $('#items').innerHTML = TO.ITEMS.filter(i => i.type === tab).map(i => {
      const owned = p.owned.includes(i.id), eq = p.eq[i.type] === i.id;
      const vis = i.sw ? `<span class="sw" style="background:${i.sw}"></span>` : `<span class="ic">${i.icon}</span>`;
      let btn;
      if (i.exclusive && !owned) { const wk = TO.week(); btn = `<a class="btn" href="challenge.html">${wk.hat === i.id ? '🏆 Win it this week' : '🔒 Weekly prize'}</a>`; return `<div class="item locked ${wk.hat === i.id ? 'hot' : ''}">${vis}<strong>${esc(i.name)}</strong><small>Weekly challenge only</small>${btn}</div>`; }
      if (i.type === 'food') btn = `<button class="btn primary" data-buy="${i.id}" ${S.coins < i.price ? 'disabled' : ''}>Feed · ${i.price} 🪙</button>`;
      else if (!owned) btn = `<button class="btn primary" data-buy="${i.id}" ${S.coins < i.price ? 'disabled' : ''}>Buy · ${i.price} 🪙</button>`;
      else if (eq) btn = (i.type === 'color' || i.type === 'room') ? `<button class="btn" disabled>Using</button>` : `<button class="btn" data-off="${i.type}">Take off</button>`;
      else btn = `<button class="btn" data-eq="${i.id}">Wear</button>`;
      return `<div class="item ${eq ? 'eq' : ''}">${vis}<strong>${esc(i.name)}</strong><small>${i.food ? '+' + i.food + '% tummy' : owned ? 'Owned' : ''}</small>${btn}</div>`;
    }).join('');
  }
  function denEvents() {
    $('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; den(); } });
    $('#items').addEventListener('click', e => {
      const S = TO.S, p = S.pet, b = e.target.closest('button'); if (!b || b.disabled) return;
      const card = b.closest('.item'), vis = card && card.querySelector('.ic,.sw');
      const from = vis ? vis.getBoundingClientRect() : null;
      if (b.dataset.buy) {
        const i = TO.item(b.dataset.buy); if (S.coins < i.price) return;
        S.coins -= i.price;
        if (i.type === 'food') {
          const old = TO.fullness(), now = Math.min(100, old + i.food);
          TO.setFull(now); TO.save();
          den({ fromFull: Math.round(old), say: pick(['Yum yum! 😋 Thank you!', 'Nom nom nom… delicious! 💕', `Best ${i.name.toLowerCase()} ever! 🥰`, 'My tummy is so happy! 🐙']) });
          fx('food', from, i.icon, `+${Math.round(now - old)}% tummy`, i.price);
        } else {
          p.owned.push(i.id); p.eq[i.type] = i.id; TO.save();
          den({ say: pick(['Ooh, do I look good? ✨', 'I love it!! 😍', 'So stylish! 💅', 'Best gift ever! 🎁']) });
          fx('wear', from, i.icon || '🎨', 'New item!', i.price);
        }
      } else {
        if (b.dataset.eq) { const i = TO.item(b.dataset.eq); p.eq[i.type] = i.id; } else if (b.dataset.off) p.eq[b.dataset.off] = null;
        TO.save(); den({ say: b.dataset.eq ? 'Looking sharp! 😎' : 'Ahh, comfy again.' }); fx('wear', null, '✨', '', 0);
      }
      TO.header('');
    });
  }
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* visual feedback: item flies to Inky → chomp / jump → hearts or sparkles + floating text */
  function fx(kind, from, icon, label, price) {
    const room = $('#room'), oct = room.querySelector('svg.octo'); if (!oct) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const r = oct.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * (kind === 'food' ? .55 : .35);
    if (price) floatText(room.querySelector('.coins-big'), `−${price} 🪙`, '#ff9fb0');
    const hit = () => {
      if (!reduce) oct.animate(kind === 'food'
        ? [{ transform: 'scale(1)' }, { transform: 'scale(1.12,.86)' }, { transform: 'scale(.94,1.08)' }, { transform: 'scale(1.06,.95)' }, { transform: 'scale(1)' }]
        : [{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-34px) rotate(-8deg)' }, { transform: 'translateY(-34px) rotate(8deg)' }, { transform: 'translateY(0) rotate(0)' }],
        { duration: kind === 'food' ? 650 : 700, easing: 'ease-out' });
      burst(cx, cy, kind === 'food' ? ['❤️', '💕', '😋', '✨'] : ['✨', '⭐', '💫', '🌟'], reduce);
      if (label) floatAt(cx, r.top + 10, label);
    };
    if (from && !reduce) {
      const f = document.createElement('div'); f.className = 'fly'; f.textContent = icon;
      const sx = from.left + from.width / 2, sy = from.top + from.height / 2;
      f.style.left = sx + 'px'; f.style.top = sy + 'px'; document.body.append(f);
      const dx = cx - sx, dy = cy - sy;
      f.animate([
        { transform: 'translate(-50%,-50%) scale(1) rotate(0)' },
        { transform: `translate(calc(-50% + ${dx * .5}px), calc(-50% + ${dy * .5 - 140}px)) scale(1.5) rotate(-20deg)`, offset: .5 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.4) rotate(20deg)`, opacity: .3 }
      ], { duration: 650, easing: 'cubic-bezier(.4,0,.6,1)' }).onfinish = () => { f.remove(); hit(); };
    } else hit();
  }
  function burst(x, y, set, reduce) {
    const n = reduce ? 3 : 12;
    for (let k = 0; k < n; k++) {
      const s = document.createElement('div'); s.className = 'fly small'; s.textContent = set[k % set.length];
      s.style.left = x + 'px'; s.style.top = y + 'px'; document.body.append(s);
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
      s.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 60}px)) scale(1.1)`, opacity: 0 }],
        { duration: 900 + Math.random() * 400, easing: 'ease-out' }).onfinish = () => s.remove();
    }
  }
  function floatAt(x, y, text, color) {
    const t = document.createElement('div'); t.className = 'float-txt'; t.textContent = text;
    if (color) t.style.color = color;
    t.style.left = x + 'px'; t.style.top = y + 'px'; document.body.append(t);
    t.animate([{ transform: 'translate(-50%,0)', opacity: 0 }, { transform: 'translate(-50%,-14px)', opacity: 1, offset: .2 }, { transform: 'translate(-50%,-60px)', opacity: 0 }], { duration: 1500, easing: 'ease-out' }).onfinish = () => t.remove();
  }
  function floatText(el, text, color) { if (!el) return; const r = el.getBoundingClientRect(); floatAt(r.left + r.width / 2, r.bottom + 4, text, color); }

  window.Pages = { home, lessons, progress, den, denEvents, nextLesson };
})();
