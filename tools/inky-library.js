// Inky image library (own artwork, free to use): typingocto/assets/inky/<id>.svg + index.json
// Generated from the same octopus renderer as the site (assets/core.js). Run by tools/build.js.
const fs = require('fs'), path = require('path');

module.exports = function buildInkyLibrary(TO, OUT) {
  const dir = path.join(OUT, 'assets', 'inky');
  fs.mkdirSync(dir, { recursive: true });
  const BG = { coral: ['#4a2a45', '#2a3550'], violet: ['#2f2a55', '#45305a'], mint: ['#1f4a40', '#2a3550'], blue: ['#1f3550', '#2a4a5a'], pink: ['#4a2a40', '#553045'], gold: ['#4a3a20', '#3a2a45'] };
  const looks = [
    ['happy-classic', 'Inky happy', 'coral', {}, 'happy'],
    ['headphones', 'Inky with headphones', 'coral', { hat: 'hat-phones' }, 'happy'],
    ['smart-glasses', 'Inky with smart glasses', 'violet', { glasses: 'glasses-round' }, 'happy'],
    ['sunglasses', 'Inky with sunglasses', 'blue', { glasses: 'glasses-sun' }, 'happy'],
    ['party', 'Inky with a party hat', 'pink', { hat: 'hat-party', neck: 'neck-bow' }, 'happy'],
    ['beanie', 'Inky with a cozy beanie and scarf', 'mint', { hat: 'hat-beanie', neck: 'neck-scarf' }, 'happy'],
    ['sport-cap', 'Inky with a sport cap', 'blue', { hat: 'hat-cap' }, 'happy'],
    ['top-hat', 'Inky with a top hat and bow tie', 'violet', { hat: 'hat-top', neck: 'neck-bow' }, 'happy'],
    ['crown', 'Inky with a royal crown', 'gold', { hat: 'hat-crown' }, 'happy'],
    ['wizard', 'Inky the wizard', 'violet', { hat: 'hat-wizard' }, 'happy'],
    ['pirate', 'Inky the pirate', 'coral', { hat: 'hat-pirate', glasses: 'glasses-sun' }, 'happy'],
    ['flowers', 'Inky with a flower crown', 'pink', { hat: 'hat-flowers' }, 'happy'],
    ['santa', 'Inky with a Santa hat', 'coral', { hat: 'hat-santa', neck: 'neck-scarf' }, 'happy'],
    ['viking', 'Inky the viking', 'gold', { hat: 'hat-viking' }, 'happy'],
    ['chef', 'Inky the chef', 'mint', { hat: 'hat-chef' }, 'happy'],
    ['student', 'Inky studying with glasses and headphones', 'blue', { hat: 'hat-phones', glasses: 'glasses-round' }, 'happy'],
    ['calm', 'Inky calm', 'mint', {}, 'ok'],
    ['hungry', 'Inky hungry', 'coral', {}, 'hungry'],
    ['sad', 'Inky sad', 'blue', {}, 'sad'],
    ['golden', 'Golden Inky', 'gold', { glasses: 'glasses-round', neck: 'neck-bow' }, 'happy'],
  ];
  const index = looks.map(([id, alt, color, eq, mood]) => {
    const [a, b] = BG[color];
    const octo = TO.octo({ mood, eq: Object.assign({ color: 'color-' + color, hat: null, glasses: null, neck: null }, eq) })
      .replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    const vb = (TO.octo({ mood, eq: { color: 'color-' + color } }).match(/viewBox="([^"]+)"/) || [, '0 -4 200 210'])[1].split(' ').map(Number);
    // 1200x630 card (Open Graph ratio) with the octopus centred
    const s = 2.6, w = vb[2] * s, h = vb[3] * s;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${alt}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/><circle cx="1060" cy="110" r="160" fill="#ffffff08"/><circle cx="120" cy="560" r="200" fill="#ffffff06"/>
<g transform="translate(${(1200 - w) / 2 - vb[0] * s},${(630 - h) / 2 - vb[1] * s}) scale(${s})">${octo}</g></svg>`;
    fs.writeFileSync(path.join(dir, id + '.svg'), svg);
    return { id, src: `/assets/inky/${id}.svg`, alt, license: 'own', credit: 'TypingOcto' };
  });
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 2));
  return index.length;
};
