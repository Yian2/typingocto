// TypingOcto optional Google sign-in: syncs the local progress (localStorage) with Firestore users/{uid}.
// Guest mode keeps working exactly as before. Loaded by core.js only when CONFIG.FIREBASE is set.
const V = '10.14.1';
const CDN = `https://www.gstatic.com/firebasejs/${V}`;

// Merge two progress states without losing anything (best result per lesson, union of sessions, etc.)
export function mergeProgress(a, b) {
  if (!b) return a; if (!a) return b;
  const xpA = (a.xp || 0) + (a.totalSecs || 0), xpB = (b.xp || 0) + (b.totalSecs || 0);
  const base = xpA >= xpB ? a : b, other = base === a ? b : a;
  const out = JSON.parse(JSON.stringify(base));
  out.lessons = Object.assign({}, other.lessons || {});
  for (const [id, r] of Object.entries(base.lessons || {})) {
    const o = out.lessons[id];
    out.lessons[id] = !o ? r : { stars: Math.max(r.stars || 0, o.stars || 0), wpm: Math.max(r.wpm || 0, o.wpm || 0), acc: Math.max(r.acc || 0, o.acc || 0) };
  }
  const seen = new Set(); out.sessions = [...(a.sessions || []), ...(b.sessions || [])].filter(s => !seen.has(s.t) && seen.add(s.t)).sort((x, y) => x.t - y.t).slice(-600);
  out.days = Object.assign({}, other.days || {}); for (const [d, v] of Object.entries(base.days || {})) out.days[d] = Math.max(v, out.days[d] || 0);
  out.keys = Object.assign({}, other.keys || {}); for (const [k, v] of Object.entries(base.keys || {})) if (!out.keys[k] || (v.h || 0) >= (out.keys[k].h || 0)) out.keys[k] = v;
  for (const k of ['coins', 'xp', 'totalSecs']) out[k] = Math.max(a[k] || 0, b[k] || 0);
  if (out.pet) out.pet.owned = [...new Set([...(a.pet?.owned || []), ...(b.pet?.owned || [])])];
  out.consent = a.consent ?? b.consent ?? null; // consent always stays local
  return out;
}

export async function start(config) {
  const TO = window.TO;
  const [{ initializeApp }, A, F] = await Promise.all([import(`${CDN}/firebase-app.js`), import(`${CDN}/firebase-auth.js`), import(`${CDN}/firebase-firestore.js`)]);
  const app = initializeApp(config, 'typingocto-site');
  const auth = A.getAuth(app), db = F.getFirestore(app);
  const hdr = document.getElementById('hdr');
  const btn = document.createElement('button');
  btn.className = 'acct'; btn.type = 'button';
  hdr && hdr.append(btn);
  let user = null, timer = null, syncing = false;

  const render = () => {
    btn.textContent = user ? (user.displayName || user.email || '?').trim()[0].toUpperCase() : 'Sign in';
    btn.title = user ? `Signed in as ${user.email} · progress synced. Click to sign out.` : 'Sign in with Google to save your progress across devices (optional)';
    btn.classList.toggle('in', !!user);
  };
  btn.addEventListener('click', async () => {
    if (user) { if (confirm('Sign out? Your progress stays saved in your account and in this browser.')) await A.signOut(auth); return; }
    try { await A.signInWithPopup(auth, new A.GoogleAuthProvider()); } catch (e) { if (e.code !== 'auth/popup-closed-by-user') TO.toast('Sign-in failed. Please try again.'); }
  });
  const push = () => {
    if (!user || syncing) return;
    clearTimeout(timer);
    timer = setTimeout(() => F.setDoc(F.doc(db, 'users', user.uid), { progress: JSON.parse(JSON.stringify(TO.S)), updatedAt: F.serverTimestamp(), schema: 1 }).catch(e => console.warn('sync', e)), 2500);
  };
  TO.onSave(push);
  A.onAuthStateChanged(auth, async u => {
    user = u; render();
    if (!u) return;
    syncing = true;
    try {
      const snap = await F.getDoc(F.doc(db, 'users', u.uid));
      const merged = mergeProgress(JSON.parse(JSON.stringify(TO.S)), snap.exists() ? snap.data().progress : null);
      TO.replaceState(merged); TO.refreshChip();
      syncing = false;
      await F.setDoc(F.doc(db, 'users', u.uid), { progress: merged, updatedAt: F.serverTimestamp(), schema: 1 });
      if (snap.exists()) TO.toast('Progress synced ☁️');
    } catch (e) { syncing = false; console.warn('sync', e); }
  });
  render();
}
