/* TypingOcto — 100 lessons + text generators */
(function () {
  'use strict';
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const uniq = a => Array.from(new Set(a));

  // Frequency-ordered common words (top first).
  const TOP = uniq(('the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is was are has had were been did said made find long down may part great little world house place point right small large number again found study learn plant cover food sun four between state keep eye never last let thought city tree cross farm hard start might story saw far sea draw left late run while press close night real life few north open seem together next white children begin got walk example paper group always music those both mark often letter until mile river car feet care second book carry took science eat room friend began idea fish mountain stop once base hear horse cut sure watch color face wood main enough plain girl usual young ready above ever red list though feel talk bird soon body dog family direct leave song measure door product black short class wind question happen complete ship area half rock order fire south problem piece told knew pass since top whole king space heard best hour better true during hundred five remember step early hold west ground interest reach fast sing listen six table travel less morning ten simple several toward lay against pattern slow center love person money serve appear road map rain rule pull cold notice voice unit power town fine certain fly fall lead cry dark machine note wait plan figure star box field rest correct able done beauty drive stood contain front teach week final gave green quick develop ocean warm free minute strong special mind behind clear tail produce fact street inch nothing course stay wheel full force blue object decide surface deep moon island foot system busy test record boat common gold possible plane age dry wonder laugh thousand ago ran check game shape yes hot miss brought heat snow bring distant fill east paint language among').split(' '));
  const EXTRA = ('keyboard typing finger octopus practice lesson speed quiet zone jazz quiz fox jump lazy zero gaze prize maze frozen size dozen jungle juice joke major object puzzle quality square equal require unique quarter queen query freeze breeze amaze dazzle zipper wizard galaxy oxygen exact expert extra relax mixer boxer taxi vex wax pixel jacket joy enjoy journey judge village valley vivid vote wave view vacuum velvet craft crisp crystal bright brave bread bring broken branch bubble bucket camera candle castle coffee cookie copper desert dinner doctor dragon dream engine fabric falcon forest garden ginger guitar hammer harbor helmet honey hunter jelly kettle ladder lemon magnet marble meadow mirror muffin needle nickel orange oyster pepper pillow planet pocket rabbit ribbon rocket saddle silver spider summer sunset tablet temple ticket tomato tunnel turtle velvet violin walnut window winter yellow').split(' ');
  const HOME = 'a ad add ads all alas ask asks dad dads fad fads fall falls flask flasks glad glass gas had half hall halls has hash lad lads lag lags lass sad salad salads salsa sash shall flag flags flash lash dash gash slag hag jag gag sags fags'.split(' ').filter(w => w !== 'fags');
  const ALL = uniq(TOP.concat(EXTRA));

  const SENTENCES = [
    'Practice a little every day and your fingers will learn the way.',
    'Keep your eyes on the screen and trust your hands.',
    'The quick brown fox jumps over the lazy dog.',
    'Sphinx of black quartz, judge my vow.',
    'A calm mind types faster than a rushed one.',
    'Small steps every morning add up to big results.',
    'Inky has eight arms, but you only need ten fingers to type well.',
    'Good posture helps you type longer without getting tired.',
    'Rest your index fingers on the F and J keys before you start.',
    'Accuracy comes first, and speed will follow.',
    'The ocean was quiet as the sun went down over the bay.',
    'She wrote a long letter to her best friend in the city.',
    'Every expert was once a beginner who did not give up.',
    'Music can help you find a steady typing rhythm.',
    'Our team finished the project two days before the deadline.',
    'The museum opens at nine and closes at six on weekdays.',
    'He packed a map, a snack, and a warm jacket for the hike.',
    'Learning a new skill takes patience, focus, and time.',
    'The cat watched the rain from the warm window seat.',
    'Try to type each word in one smooth motion.',
    'Bright stars filled the sky above the small mountain town.',
    'Water the plants on Monday and again on Thursday.',
    'A good night of sleep makes learning much easier.',
    'The train left the station exactly on time.',
    'Coffee in hand, she opened her laptop and began to write.',
    'If you make a mistake, slow down and find your rhythm again.',
    'Fresh bread from the bakery smells amazing in the morning.',
    'Never look down at the keys; let your fingers remember.',
    'The library has thousands of books about science and history.',
    'Joining a club is a great way to meet new friends.',
    'Five lazy wizards quickly boxed the jumping zebras.',
    'Clear goals make it easier to stay motivated each week.',
    'The old lighthouse guided ships safely into the harbor.',
    'Typing fast is useful at school, at work, and at home.',
    'We planted tomatoes, peppers, and herbs in the garden.',
    'Take a short break, stretch your hands, and start again.'
  ];
  const NAMES = 'Anna Ben Clara David Emma Frank Grace Henry Iris Jack Kate Leo Mia Noah Olivia Paul Quinn Rosa Sam Tom Uma Victor Wendy Xavier Yara Zoe London Paris Tokyo Berlin Madrid Rome Sydney Dublin Boston Texas Canada Japan Monday Friday Sunday April June October'.split(' ');
  const LEFT = 'qwertasdfgzxcvb', RIGHT = 'yuiophjklnm';

  function fill(fn, len) { const out = []; let L = 0; while (L < len) { const w = fn(); out.push(w); L += w.length + 1; } return out.join(' '); }
  function drill(newKeys, pool) {
    const nk = newKeys.split(''), pl = pool.split('');
    return () => {
      const r = Math.random();
      if (r < .35) { const k = pick(nk); return k.repeat(3); }
      if (r < .6) { let s = ''; for (let i = 0; i < 3 + rnd(2); i++) s += pick(nk); return s; }
      let s = ''; for (let i = 0; i < 3 + rnd(3); i++) s += Math.random() < .5 ? pick(nk) : pick(pl); return s;
    };
  }
  function wordsFor(pool) {
    const set = new Set(pool.split(''));
    const src = uniq(ALL.concat(HOME));
    return src.filter(w => w.split('').every(c => set.has(c)));
  }
  function wordGen(pool, newKeys, extra) {
    const list = wordsFor(pool);
    const focus = newKeys ? list.filter(w => newKeys.split('').some(k => w.includes(k))) : [];
    const d = drill(newKeys || pool, pool);
    if (list.length < 6) return d;
    return () => {
      const r = Math.random();
      if (focus.length && r < .55) return pick(focus);
      if (extra && r < .7) return d();
      return pick(list);
    };
  }
  const sentenceText = len => { let s = []; let L = 0; const bag = SENTENCES.slice().sort(() => Math.random() - .5); let i = 0; while (L < len) { const x = bag[i++ % bag.length]; s.push(x); L += x.length + 1; } return s.join(' '); };
  const cap = w => w[0].toUpperCase() + w.slice(1);
  const num = (a, b) => a + rnd(b - a + 1);

  const NUM_T = [() => `${num(2, 99)} apples`, () => `room ${num(100, 999)}`, () => `in ${num(1950, 2026)}`, () => `${num(2, 59)} minutes`, () => `page ${num(1, 400)}`, () => `${num(1, 12)} am`, () => `call ${num(200, 999)} ${num(1000, 9999)}`, () => `${num(3, 90)} kids`, () => `bus ${num(1, 99)}`, () => `${num(10, 99)} km`];
  const PUNCT = {
    "'": ["don't", "it's", "I'm", "you're", "we'll", "can't", "that's", "she's", "they're", "won't", "Inky's", "let's", "I've", "didn't"],
    '?!': ['Are you ready?', 'Yes!', 'Can you type faster?', 'Of course!', 'Wow, that was quick!', 'Did you see Inky?', 'What a great day!', 'Why not?', 'Let us go!', 'Is it lunch time?', 'Amazing!'],
    ':;': ['Bring three things: a pen, a book, and water.', 'It rained; we stayed inside.', 'Note: the shop closes early.', 'I was tired; still, I finished.', 'Time: ten minutes.', 'She smiled; he laughed.'],
    '"': ['She said, "Keep going."', '"Nice work," he replied.', '"Ready?" asked Inky.', 'The sign read "Open".', '"Type slowly," said the coach.'],
    '-()': ['well-known', 'self-made', 'long-term', '(see page 4)', 'up-to-date', 'e-mail', '(optional)', 'Monday-Friday', '(2026)', 'part-time', 'x-ray'],
    '@#$%': ['hello@inky.com', '#1 fan', '$25', '50% off', 'team@work.com', '#typing', '$9.99', '100%', 'save 20%', 'me@site.org'],
    '&*+=': ['salt & pepper', '2 + 2 = 4', '5 * 3 = 15', 'rock & roll', 'x = 10', '7 + 1 = 8', 'Q&A', '*important*', 'a + b = c', 'R&D']
  };
  const punctGen = k => () => pick(PUNCT[k]);
  const BIGRAMS = bgs => { const list = ALL.filter(w => bgs.some(b => w.includes(b))); return () => pick(list); };

  /* ---------- lesson table ---------- */
  const UNITS = [
    { icon: '🏠', title: 'Home Row', desc: 'Where your fingers live: A S D F · J K L ;' },
    { icon: '⬆️', title: 'Top Row', desc: 'Reach up to Q W E R T Y U I O P' },
    { icon: '⬇️', title: 'Bottom Row', desc: 'Reach down to Z X C V B N M , . /' },
    { icon: '🔤', title: 'All Letters', desc: 'Common letter pairs and smooth words' },
    { icon: '🅰️', title: 'Capital Letters', desc: 'Use both Shift keys like a pro' },
    { icon: '🔢', title: 'Numbers', desc: 'The number row, from 1 to 0' },
    { icon: '❗', title: 'Punctuation & Symbols', desc: "Commas, quotes, ? ! : ; and more" },
    { icon: '⭐', title: 'Most Common Words', desc: 'The 300 words you type every day' },
    { icon: '📝', title: 'Real Sentences', desc: 'Full sentences with capitals and punctuation' },
    { icon: '🚀', title: 'Speed & Stamina', desc: 'Push your WPM with longer texts' }
  ];
  const L = [];
  const add = (u, title, desc, gen, opt) => L.push(Object.assign({ unit: u, title, desc, gen }, opt || {}));
  const HR = 'asdfghjkl;';
  // Unit 1
  add(0, 'F and J', 'Find the bumps on F and J. Index fingers only.', drill('fj', 'fj'));
  add(0, 'D and K', 'Middle fingers rest on D and K.', drill('dk', 'fjdk'));
  add(0, 'S and L', 'Ring fingers rest on S and L.', drill('sl', 'fjdksl'));
  add(0, 'A and ;', 'Pinky fingers rest on A and ;.', drill('a;', 'asdfjkl;'));
  add(0, 'Home row drill', 'All eight home keys together.', drill('asdfjkl;', 'asdfjkl;'));
  add(0, 'G and H', 'Stretch your index fingers to the centre.', drill('gh', HR));
  add(0, 'First words', 'Real words using only the home row!', wordGen('asdfghjkl', '', false));
  add(0, 'Home row words II', 'More words, steady rhythm.', wordGen('asdfghjkl', 'gh', false));
  add(0, 'Home row mix', 'Words and drills mixed together.', wordGen('asdfghjkl;', 'as', true));
  add(0, 'Checkpoint: Home Row', 'Show what you learned!', wordGen('asdfghjkl', '', false), { check: true });
  // Unit 2
  let P = 'asdfghjkl';
  [['ei', 'E and I', 'Middle fingers reach up.'], ['ru', 'R and U', 'Index fingers reach up.'], ['ty', 'T and Y', 'Index fingers stretch up and in.'], ['wo', 'W and O', 'Ring fingers reach up.'], ['qp', 'Q and P', 'Pinkies reach up.']].forEach(([k, t, d]) => { P += k; add(1, t, d, wordGen(P, k, true)); });
  add(1, 'Top row drill', 'Only top-row letters.', drill('qwertyuiop', 'qwertyuiop'));
  add(1, 'Top + home words', 'Words with home and top rows.', wordGen(P, '', false));
  add(1, 'Vowel practice', 'E, I, O, U everywhere.', wordGen(P, 'eiou', false));
  add(1, 'Top row rhythm', 'Keep an even pace.', wordGen(P, 'qwrtyp', false));
  add(1, 'Checkpoint: Top Row', 'Top and home row together.', wordGen(P, '', false), { check: true });
  // Unit 3
  [['vm', 'V and M', 'Index fingers reach down.'], ['c,', 'C and comma', 'Middle fingers reach down.'], ['x.', 'X and period', 'Ring fingers reach down.'], ['bn', 'B and N', 'Index fingers reach down and in.'], ['z/', 'Z and slash', 'Pinkies reach down.']].forEach(([k, t, d]) => { P += k; add(2, t, d, wordGen(P.replace(/[,./]/g, ''), k.replace(/[,./]/g, ''), true)); });
  add(2, 'Bottom row drill', 'Only bottom-row keys.', drill('zxcvbnm', 'zxcvbnm,.'));
  add(2, 'All letters words', 'Every letter is unlocked!', wordGen('abcdefghijklmnopqrstuvwxyz', '', false));
  add(2, 'Bottom row words', 'Words full of B, C, M, N, V.', wordGen('abcdefghijklmnopqrstuvwxyz', 'bcmnvxz', false));
  add(2, 'Commas and periods', 'Short phrases with , and .', () => pick(ALL) + (Math.random() < .3 ? ',' : Math.random() < .2 ? '.' : ''));
  add(2, 'Checkpoint: Bottom Row', 'All three rows together.', wordGen('abcdefghijklmnopqrstuvwxyz', 'bcmnvxz', false), { check: true });
  // Unit 4
  [['th', 'he'], ['in', 'er'], ['an', 're'], ['on', 'at'], ['en', 'nd'], ['ing', 'ion'], ['ou', 'ea'], ['st', 'ch']].forEach(b => add(3, `Pairs: ${b.join(' · ').toUpperCase()}`, 'Very common letter pairs in English.', BIGRAMS(b)));
  add(3, 'Tricky reaches', 'Words with Q, Z, X and J.', BIGRAMS(['q', 'z', 'x', 'j']));
  add(3, 'Checkpoint: All Letters', 'Fluent words with every letter.', () => pick(ALL), { check: true });
  // Unit 5
  add(4, 'Right Shift', 'Capitals on the left hand: use RIGHT Shift.', () => { const w = pick(ALL.filter(x => LEFT.includes(x[0]))); return cap(w); });
  add(4, 'Left Shift', 'Capitals on the right hand: use LEFT Shift.', () => { const w = pick(ALL.filter(x => RIGHT.includes(x[0]))); return cap(w); });
  add(4, 'Names', 'People, cities and days.', () => pick(NAMES));
  add(4, 'Mixed capitals', 'Capitals mixed with lowercase.', () => Math.random() < .4 ? cap(pick(ALL)) : pick(ALL));
  add(4, 'Names and words', 'Names inside normal text.', () => Math.random() < .35 ? pick(NAMES) : pick(TOP));
  add(4, 'ALL CAPS', 'Short words in capitals.', () => pick(TOP.filter(w => w.length < 5)).toUpperCase());
  add(4, 'Capital sentences I', 'Start each sentence with a capital.', null, { text: sentenceText });
  add(4, 'Capital sentences II', 'Keep your pinky on Shift.', null, { text: sentenceText });
  add(4, 'Title Case', 'Every Word Starts With A Capital.', () => cap(pick(TOP)));
  add(4, 'Checkpoint: Capitals', 'Shift keys mastered!', () => Math.random() < .5 ? cap(pick(ALL)) : pick(NAMES), { check: true });
  // Unit 6
  [['12', '1 and 2'], ['34', '3 and 4'], ['56', '5 and 6'], ['78', '7 and 8'], ['90', '9 and 0']].forEach(([k, t]) => add(5, `Numbers ${t}`, 'Reach up to the number row.', drill(k, '1234567890'.slice(0, '1234567890'.indexOf(k[1]) + 1))));
  add(5, 'All numbers', 'Every digit from 1 to 0.', drill('1234567890', '1234567890'));
  add(5, 'Numbers in words', 'Times, rooms and pages.', () => pick(NUM_T)());
  add(5, 'Years and prices', 'Four-digit numbers.', () => Math.random() < .5 ? String(num(1900, 2026)) : String(num(10, 999)));
  add(5, 'Number sentences', 'Words and numbers mixed.', () => Math.random() < .5 ? pick(NUM_T)() : pick(TOP));
  add(5, 'Checkpoint: Numbers', 'Fast and accurate digits.', () => pick(NUM_T)(), { check: true });
  // Unit 7
  add(6, 'Comma and period', 'The two most used marks.', null, { text: sentenceText });
  add(6, 'Apostrophe', "Contractions like don't and it's.", () => Math.random() < .6 ? pick(PUNCT["'"]) : pick(TOP));
  add(6, 'Question and exclamation', 'Shift + / and Shift + 1.', punctGen('?!'));
  add(6, 'Colon and semicolon', 'Shift + ; for the colon.', punctGen(':;'));
  add(6, 'Quotation marks', 'Shift + \' for double quotes.', punctGen('"'));
  add(6, 'Hyphen and brackets', '- and ( ) on the top row.', punctGen('-()'));
  add(6, 'Symbols @ # $ %', 'Emails, hashtags and prices.', punctGen('@#$%'));
  add(6, 'Symbols & * + =', 'Maths and more.', punctGen('&*+='));
  add(6, 'Punctuation mix', 'Everything together.', () => pick(PUNCT[pick(Object.keys(PUNCT))]));
  add(6, 'Checkpoint: Punctuation', 'Real text with symbols.', () => Math.random() < .5 ? pick(PUNCT[pick(Object.keys(PUNCT))]) : pick(TOP), { check: true });
  // Unit 8
  for (let i = 0; i < 9; i++) { const a = i * 30, b = a + 40; add(7, `Top words ${a + 1}–${b}`, 'Learn the words you type the most.', () => pick(TOP.slice(a, b))); }
  add(7, 'Checkpoint: Common words', 'Top 300 words, random order.', () => pick(TOP.slice(0, 300)), { check: true });
  // Unit 9
  ['Everyday sentences', 'Calm and steady', 'Story time', 'Pangrams', 'Long sentences', 'Mixed punctuation', 'Office writing', 'Nature', 'Study text'].forEach(t => add(8, t, 'Type real sentences without stopping.', null, { text: sentenceText }));
  add(8, 'Checkpoint: Sentences', 'A full paragraph.', null, { text: sentenceText, check: true });
  // Unit 10
  ['Speed burst I', 'Speed burst II', 'Short words sprint', 'Long words', 'Paragraph I', 'Paragraph II', 'Endurance I', 'Endurance II', 'Final rehearsal'].forEach((t, i) => add(9, t, i < 3 ? 'Short words, maximum speed.' : 'Longer text: keep your rhythm.', i === 2 ? () => pick(TOP.filter(w => w.length <= 4)) : i < 2 ? () => pick(TOP.slice(0, 120)) : i === 3 ? () => pick(ALL.filter(w => w.length >= 7)) : null, i > 3 ? { text: sentenceText } : null));
  add(9, 'Final Exam', 'Become a TypingOcto master! 🐙👑', null, { text: sentenceText, check: true });

  L.forEach((l, i) => {
    l.id = i + 1;
    l.len = Math.round((80 + l.unit * 16) * (l.check ? 1.5 : 1) * (l.unit === 9 && i >= 94 ? 1.4 : 1));
    l.target = Math.min(55, 8 + l.unit * 5 + (i % 10)); // WPM needed for 3 stars
  });
  function textFor(l) {
    if (l.text) return l.text(l.len);
    return fill(l.gen, l.len);
  }

  // Generators for the typing test & practice modes
  const gens = {
    common: () => fill(() => pick(TOP.slice(0, 200)), 600),
    advanced: () => fill(() => pick(ALL), 600),
    sentences: () => sentenceText(600),
    numbers: () => fill(() => Math.random() < .5 ? pick(NUM_T)() : pick(TOP), 300),
    weak: (keys) => {
      const ks = keys && keys.length ? keys : ['q', 'z', 'x', 'p'];
      const list = ALL.filter(w => ks.some(k => w.includes(k)));
      return fill(() => list.length ? pick(list) : pick(ALL), 260);
    }
  };
  function punctuate(text) {
    const ws = text.split(' '); let out = [], start = true;
    ws.forEach((w, i) => { let x = start ? cap(w) : w; start = false; const r = Math.random(); if (i % 9 === 8 || r < .06) { x += '.'; start = true; } else if (r < .14) x += ','; out.push(x); });
    return out.join(' ');
  }

  // Weekly challenge texts (one per week, rotating).
  const CHALLENGES = [
    'Deep under the sea, a small octopus named Inky found an old keyboard in a sunken ship. She pressed one key, then another, and soon she was typing short notes to every fish in the reef. By the end of the week, the whole ocean was reading her stories.',
    'The best typists are not the ones who never make mistakes. They are the ones who keep a steady rhythm, notice their errors, and calmly continue. Speed grows quietly in the background while you focus on typing each word correctly.',
    'On Monday morning the bakery opened at seven. By eight, there was a long line of people waiting for warm bread, sweet buns and fresh coffee. The baker smiled, wiped flour from her hands and said, "Next, please!" to every single customer.',
    'Mount Everest is about 8,849 meters tall. Climbers often spend weeks getting used to the thin air before they try to reach the top. Patience, planning and small daily steps are what turn a huge goal into something possible.',
    'A good desk setup makes typing easier. Keep the screen at eye level, relax your shoulders and let your wrists float above the keyboard. Take a short break every 30 minutes, stretch your fingers and look at something far away.',
    'The night market was full of lights, music and the smell of grilled corn. Children ran between the stalls while their parents tried spicy noodles, mango ice cream and tiny pancakes filled with chocolate. Nobody wanted to go home.',
    'Learning to type without looking feels slow at first. Your fingers hesitate and you want to peek at the keys. But after a few days, something clicks: the letters start to flow and your hands simply know where to go.',
    'Our solar system has eight planets. Jupiter is the largest, with a giant storm that has lasted for hundreds of years. Saturn has beautiful rings made of ice and rock, and tiny Mercury moves around the Sun faster than any other planet.',
    'Every great project starts with a messy first draft. Write your ideas down quickly, then come back later to fix the details. It is much easier to improve something that exists than to wait for the perfect idea to arrive.',
    'The football match was tied 2-2 with only one minute left. The crowd held its breath as the young striker ran toward the goal, dodged two defenders and kicked the ball into the top corner. The stadium exploded with joy!',
    'Some octopuses can change both the colour and the texture of their skin in less than a second. They use this skill to hide from predators, to sneak up on crabs and, scientists believe, even to show how they are feeling.',
    'Reading every day is one of the simplest ways to become a better writer. You learn new words, see how sentences are built and discover different styles. Ten pages before bed can make a big difference over a whole year.'
  ];

  window.LESSONS = { list: L, units: UNITS, textFor, gens, punctuate, CHALLENGES };
})();
