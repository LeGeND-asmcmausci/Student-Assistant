/**
 * Student Assistant — mahalliy "AI" yadrosi.
 *
 * Bu modul tarmoqsiz ishlaydigan, deterministik matn tahlilini amalga
 * oshiradi: ekstraktiv summarizer, kalit so'zlar, grammatik tekshiruv,
 * akademik baho hamda Sokratik repetitor uchun masala yechish dvigateli.
 */

import { TUTOR_KB } from '../data/tutorKB.js';

/* ———————————————————————————————— Stopwords ———————————————————————————————— */

const UZ_STOPWORDS = new Set([
  'va', 'yoki', 'lekin', 'ammo', 'chunki', 'uning', 'bizning', 'sizning',
  'mening', 'shuning', 'shu', 'bu', 'o\u2018sha', 'hamma', 'barca', 'keyin',
  'oldin', 'bor', 'yo\u2018q', 'edi', 'edi', 'emiz', 'dir', 'kabi', 'uchun',
  'bilan', 'g\u2018oya', 'ham', 'hamda', 'yana', 'endi', 'qachon', 'qayerda',
  'nima', 'kim', 'qanday', 'qaysi', 'necha', 'bunda', 'bunda', 'shunda',
  'degan', 'bo\u2018lib', 'bo\u2018lgan', 'bo\u2018ladi', 'qiladi', 'qilgan',
  'bor\u2018', 'tabiiy', 'odatda', 'asosan', 'min', 'bir', 'ikki', 'uch',
  'to\u2018rt', 'besh', 'birinchi', 'ikkinchi', 'uchinch', 'oz', 'juda',
  'anjuman', 'shu\u2018ncha', 'bunday', 'shunday', 'aynan', 'yal\u2018piy',
]);

const EN_STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'are', 'was', 'were',
  'have', 'has', 'had', 'you', 'your', 'not', 'but', 'they', 'them', 'their',
  'his', 'her', 'its', 'our', 'will', 'would', 'could', 'should', 'can',
  'than', 'then', 'these', 'those', 'there', 'here', 'when', 'what', 'which',
  'who', 'whom', 'how', 'why', 'where', 'about', 'into', 'over', 'under',
  'between', 'because', 'while', 'during', 'before', 'after', 'above',
  'below', 'such', 'each', 'other', 'some', 'any', 'all', 'both', 'more',
  'most', 'very', 'been', 'being', 'does', 'did', 'of', 'in', 'on', 'at',
  'to', 'is', 'it', 'as', 'by', 'or', 'an', 'be', 'we', 'he', 'she', 'so',
  'if', 'then',
]);

const RU_STOPWORDS = new Set([
  'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то',
  'все', 'она', 'так', 'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за',
  'бы', 'по', 'только', 'ее', 'мне', 'было', 'вот', 'от', 'меня', 'еще',
  'нет', 'о', 'из', 'ему', 'теперь', 'когда', 'даже', 'ну', 'вдруг', 'ли',
  'если', 'уже', 'или', 'ни', 'быть', 'был', 'него', 'до', 'вас', 'нибудь',
  'опять', 'уж', 'вам', 'ведь', 'там', 'потом', 'себя', 'ничего', 'ей',
  'может', 'они', 'тут', 'где', 'есть', 'надо', 'ней', 'для', 'мы', 'тебя',
  'их', 'чем', 'была', 'сам', 'чтоб', 'без', 'будто', 'чего', 'раз', 'тоже',
  'себе', 'под', 'будет', 'ж', 'тогда', 'кто', 'этот', 'того', 'потому',
  'этого', 'какой', 'совсем', 'ним', 'здесь', 'этом', 'один', 'почти', 'мой',
  'тем', 'чтобы', 'нее', 'сейчас', 'были', 'куда', 'зачем', 'всех', 'никогда',
  'можно', 'при', 'наконец', 'два', 'об', 'другой', 'хоть', 'после', 'над',
  'больше', 'тот', 'через', 'эти', 'нас', 'про', 'всего', 'них', 'какая',
]);

const STOPWORDS = new Set([...UZ_STOPWORDS, ...EN_STOPWORDS, ...RU_STOPWORDS]);

/* ———————————————————————————————— Yordamchilar ———————————————————————————————— */

const WORD_RE = /[\p{L}\p{N}'\u2018-]+/gu;

/** Matnni so'zlarga ajratadi (katta-kichik harf e'tiborsiz). */
export function words(text) {
  return (String(text || '').toLowerCase().match(WORD_RE) || []).filter(
    (w) => w.length > 1 || /\p{N}/u.test(w),
  );
}

/** Matnni gaplarga ajratadi. */
export function sentences(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const round1 = (v) => Math.round(v * 10) / 10;

/* ————————————————————————— Ekstraktiv summarizer ————————————————————————— */

/**
 * Matndan eng muhim gaplarni tanlab oladi (so'z chastotasi +
 * pozitsiya + uzunlik bonuslari asosida).
 *
 * @param {string} text — tahlil qilinadigan matn
 * @param {number} n — kalit fikrlar soni
 * @returns {{ takeaways: string[], summary: string, keywords: {word: string, count: number}[], stats: object }}
 */
export function summarize(text, n = 5) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  const sents = sentences(clean);
  const allWords = words(clean);

  if (clean.length === 0 || sents.length === 0) {
    return { takeaways: [], summary: '', keywords: [], stats: emptyStats() };
  }

  // So'z chastotasi (stopwords hisobga olinmaydi)
  const freq = new Map();
  for (const w of allWords) {
    if (STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const maxFreq = Math.max(1, ...freq.values());

  // Gap ballari: normalizatsiyalangan chastota + pozitsiya + uzunlik
  const scored = sents.map((s, i) => {
    const sw = words(s);
    const content = sw.filter((w) => !STOPWORDS.has(w));
    const score =
      content.reduce((acc, w) => acc + (freq.get(w) || 0) / maxFreq, 0) /
        Math.max(4, sw.length) +
      (i === 0 ? 0.18 : 0) + // kirish gap muhim
      (i === sents.length - 1 ? 0.08 : 0) + // xulosa
      (sw.length >= 8 && sw.length <= 28 ? 0.1 : 0); // o'rtacha uzunlik

    return { index: i, text: s, score };
  });

  const top = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(n, sents.length))
    .sort((a, b) => a.index - b.index); // matndagi tartibni saqlaymiz

  const takeaways = top.map((s) => s.text);
  const summary = takeaways.slice(0, 3).join(' ');

  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const unique = new Set(allWords).size;
  return {
    takeaways,
    summary,
    keywords,
    stats: {
      words: allWords.length,
      sentences: sents.length,
      characters: clean.length,
      uniqueWords: unique,
      readingMinutes: Math.max(1, Math.round(allWords.length / 180)),
      compression: round1(
        (takeaways.join(' ').length / Math.max(1, clean.length)) * 100,
      ),
    },
  };
}

function emptyStats() {
  return {
    words: 0,
    sentences: 0,
    characters: 0,
    uniqueWords: 0,
    readingMinutes: 0,
    compression: 0,
  };
}

/* ———————————————————————————— Grammatik tekshiruv ———————————————————————————— */

/** [regex, muammo matni, jiddiylik] — o'zbek va umumiy xatolar. */
const GRAMMAR_RULES = [
  [/\b(\w+)\s+\1\b/giu, 'Takroriy so\u2018z ("so\u2018z so\u2018z") — birini olib tashlang', 'high'],
  [/\s{2,}/g, 'Ikki yoki undan ortiq bo\u2018sh joy', 'low'],
  [/[a-zA-Z][а-яё]/gu, 'Lotin va kirill harflari aralash ishlatilgan', 'high'],
  [/\b(shu\s+so\u2018z\u2018da|\bki\s+ki\b|\bbir\s+bor\b\s+bir)/giu, 'Shubhali so\u2018z birikmasi', 'medium'],
  [/\b(buladi|boladi|bo\u2018ldi\s+mi|yozildi\u2018)\b/giu, "Anʼanaviy imlo xatosi — to'g'risi: bo'ladi", 'medium'],
  [/\b(ichida\s+ichida|tashqarida\s+tashqarida)\b/giu, 'So\u2018z qaytarilgan', 'medium'],
  [/[!?][A-Z\u0410-\u042f]/g, 'Undov/savol belgisidan keyin katta harf kerak', 'low'],
  [/\b(\d)\s+(yuz|ming|million)\b/giu, 'Raqam va so\u2018z orasida vergul kerak: "1 000"', 'low'],
  [/[^\n]\.(?=[A-Z\u0410-\u042f\u0130\u0049])/g, 'Nuqtadan keyin yangi gap boshlanishi mumkin', 'low'],
  [/(\w)-(\w)/g, 'Chegara (defis) o\u2018rniga probel yoki qo\u2018shtirnoq ishlatilgan bo\u2018lishi mumkin', 'low'],
];

/**
 * Insho matnini grammatik jihatdan tahlil qiladi.
 * @returns {{issues: object[], checks: object[], score: number}}
 */
export function checkGrammar(text) {
  const clean = String(text || '');
  const issues = [];
  const seen = new Set();

  for (const [re, label, severity] of GRAMMAR_RULES) {
    const globalRe = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    let count = 0;
    while ((m = globalRe.exec(clean)) !== null) {
      count += 1;
      const key = `${label}:${m[0].slice(0, 20)}`;
      if (!seen.has(key)) {
        seen.add(key);
        issues.push({
          severity,
          message: label,
          sample: m[0].slice(0, 48),
        });
      }
      if (count > 40) break; // chek: juda ko'p takrorlanmasin
    }
  }

  return { issues };
}

/* ———————————————————————— Akademik insho bahosi (10 ball) ———————————————————————— */

const TRANSITIONS = new Set([
  'bundan tashqari', 'shuningdek', 'biroq', 'lekin', 'ammo', 'natijada',
  'demak', 'masalan', 'ya\u2018ni', "boshqacha", 'ayniqsa', 'eslatma',
  'xulosa', 'ilova', 'avvalo', 'birinchi', 'ikkinchi', 'uchinch',
  'however', 'therefore', 'moreover', 'furthermore', 'for example',
  'in conclusion', 'consequently', 'nevertheless', 'additionally',
  'вследствие', 'кроме', 'однако', 'также', 'поэтому', 'например',
]);

/**
 * Inshoni 10 ballik akademik shkala bo'yicha baholaydi.
 * @returns {{score: number, grade: string, metrics: object[], tips: string[], issues: object[]}}
 */
export function analyzeEssay(text) {
  const clean = String(text || '').trim();
  const sents = sentences(clean);
  const allWords = words(clean);
  const wc = allWords.length;

  if (wc < 10) {
    return {
      score: 0,
      grade: 'Juday qisqa',
      metrics: [],
      tips: [
        'Insho uchun kamida 100-150 so\u2018z yozing — AI tahlili uchun matn juda qisqa.',
      ],
      issues: [{ severity: 'high', message: 'Matn hajmi juda kichik (10 so\u2018zdan kam)', sample: '' }],
    };
  }

  const unique = new Set(allWords).size;
  const richness = unique / wc; // so'z boyligi
  const avgLen = wc / Math.max(1, sents.length);
  const longSents = sents.filter((s) => words(s).length > 30).length;
  const transitionHits = sents.filter((s) =>
    [...TRANSITIONS].some((t) => s.toLowerCase().includes(t)),
  ).length;

  const { issues } = checkGrammar(clean);
  const penalty =
    issues.filter((i) => i.severity === 'high').length * 1.0 +
    issues.filter((i) => i.severity === 'medium').length * 0.5 +
    issues.filter((i) => i.severity === 'low').length * 0.2;

  // Hujjat qismi balansi (kirish / asosiy / xulosa taxminiy bahosi)
  const firstThird = sents.slice(0, Math.ceil(sents.length / 3)).join(' ');
  const lastThird = sents.slice(-Math.ceil(sents.length / 3)).join(' ');
  const hasIntro = words(firstThird).length > 10;
  const hasConclusion = words(lastThird).length > 10;

  let score = 4.5; // bazaviy
  score += clamp(richness * 12, 0, 2.2); // so'z boyligi
  score += clamp((avgLen - 8) * 0.12, 0, 1.4); // gap konstruktsiyasi
  score += clamp((wc - 60) / 90, 0, 1.4); // hajm
  score += hasIntro ? 0.6 : 0;
  score += hasConclusion ? 0.7 : 0;
  score += Math.min(transitionHits * 0.25, 1.0); // bog'lovchi so'zlar
  score -= penalty;
  score -= longSents > 3 ? 0.6 : 0; // juda uzun gaplar

  score = round1(clamp(score, 0, 10));

  const metrics = [
    { label: 'So\u2018zlar', value: wc, hint: 'maqsad: 150+' },
    { label: 'Gaplar', value: sents.length, hint: 'maqsad: 10+' },
    { label: 'O\u2018rtacha gap uzunligi', value: `${round1(avgLen)}`, hint: 'qulay: 12\u201324' },
    { label: 'So\u2018z boyligi', value: `${Math.round(richness * 100)}%`, hint: 'yaxshi: 55%+' },
    { label: 'Bog\u2018lovchi so\u2018zlar', value: transitionHits, hint: 'maqsad: 4+' },
    { label: 'Juda uzun gaplar', value: longSents, hint: 'maqsad: 0\u20132' },
  ];

  const tips = [];
  if (richness < 0.5) tips.push('So\u2018z boyligini oshiring: bir xil so\u2018zlarni takrorlash o\u2018rniga sinonimlardan foydalaning (termin, kontekst, ma\u2018no).');
  if (avgLen < 12) tips.push('Gaplaringiz juda qisqa — bog\u2018lovchi qo\u2018shimchalar bilan (\"chunki\", \"natijada\", \"bundan tashqari\") murakkabroq gaplar tuzing.');
  if (avgLen > 24) tips.push('Uzun gaplarni ikkiga bo\u2018ling — o\u2018quvchi uchun o\u2018qish qulalligi pasayadi.');
  if (transitionHits < 4) tips.push('Matn bo\u2018limlarini bog\u2018lovchi so\u2018zlar qo\u2018shing: «Bundan tashqari», «Natijada», «Biroq», «Masalan».');
  if (!hasIntro) tips.push('Kirish bo\u2018limida muammoni qo\u2018yish va maqsadni aniq bildiring.');
  if (!hasConclusion) tips.push('Xulosa bo\u2018limida asosiy fikrlarni jamlab, natijani qayd eting.');
  if (issues.filter((i) => i.severity !== 'low').length > 0) tips.push('Grammatik ogohlantirishlarni tekshirib chiqing (pastdagi ro\u2018yxat).');
  if (tips.length === 0) tips.push('Ajoyib! Matn tuzilishi, boylik va bog\u2018lovchi so\u2018zlar balansi juda yaxshi — faqat mazmun chuqurligini oshiring.');

  const grade =
    score >= 9 ? 'Ajoyib (A)' :
    score >= 8 ? 'Yaxshi (B+)' :
    score >= 6.5 ? 'Qoniqarli (B)' :
    score >= 5 ? 'O\u2018rtacha (C)' :
    'Qayta ishlash kerak (D)';

  return { score, grade, metrics, tips, issues };
}

/* ——————————————————— Sokratik repetitor: masala yechish ——————————————————— */

/** Bilim bazasi tutorKB.js dan import qilingan (fayl boshida). */

/** Xavfsiz arifmetik ifodani (+, -, *, /, %, **, qavs) hisoblaydi. */
export function evalMathExpression(input) {
  // Foydalanuvchi "... = ?", "... =" kabi savol belgilarini qo'shishi mumkin
  const src = String(input)
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[?=]+$/g, '')
    .replace(/^=+/g, '');
  if (!/^[\d.+\-*/%()^]+$/.test(src) || !/\d/.test(src)) return null;

  let pos = 0;
  const peek = () => src[pos];
  const eat = (ch) => {
    if (src[pos] === ch) {
      pos += 1;
      return true;
    }
    return false;
  };

  function parsePrimary() {
    if (eat('(')) {
      const v = parseExpr();
      eat(')');
      return v;
    }
    const start = pos;
    while (pos < src.length && /[\d.]/.test(src[pos])) pos += 1;
    if (pos === start) throw new Error('bad number');
    return parseFloat(src.slice(start, pos));
  }

  function parsePower() {
    let base = parsePrimary();
    if (eat('^')) {
      const exp = parsePower();
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseTerm() {
    let left = parsePower();
    for (;;) {
      if (eat('*')) left *= parsePower();
      else if (eat('/')) left /= parsePower();
      else if (eat('%')) left %= parsePower();
      else return left;
    }
  }

  function parseExpr() {
    let left = parseTerm();
    for (;;) {
      if (eat('+')) left += parseTerm();
      else if (eat('-')) left -= parseTerm();
      else return left;
    }
  }

  try {
    const result = parseExpr();
    if (pos !== src.length || !Number.isFinite(result)) return null;
    return Math.round(result * 1e6) / 1e6;
  } catch {
    return null;
  }
}

/**
 * Savolga Sokratik uslubdagi bosqichma-bosqich javob tayyorlaydi.
 * @param {string} question
 * @returns {{steps: string[], answer: string|null, topic: string}}
 */
export function tutorRespond(question) {
  const q = String(question || '').trim();
  const lower = q.toLowerCase();

  // 1) Arifmetik ifoda aniqlansa — aniq bosqichlar bilan
  const mathResult = evalMathExpression(q);
  if (mathResult !== null) {
    return {
      topic: 'Arifmetik ifoda',
      answer: String(mathResult),
      steps: [
        `Berilgan ifodani yozib olaylik: \`${q.trim()}\``,
        'Avval qavs ichidagi amallar bajariladi, so\u2018ng ko\u2018paytirish va bo\u2018lish (chapdan o\u2018ngga).',
        'Eng oxirida qo\u2018shish va ayirish amallari bajariladi.',
        `Hisoblab ko\u2018ring: natija \`${mathResult}\`.`,
        'Endi o\u2018zingiz shu tartibda qaytadan hisoblab, natijani solishtiring — topdingizmi?',
      ],
    };
  }

  // 2) Bilim bazasidan mos mavzu
  const matched = TUTOR_KB.find((entry) =>
    entry.keywords.some((k) => lower.includes(k)),
  );
  if (matched) {
    return {
      topic: matched.topic,
      answer: matched.answer ?? null,
      steps: matched.steps,
    };
  }

  // 3) Umumiy Sokratik yo\u2018naltirish
  return {
    topic: 'Umumiy yordam',
    answer: null,
    steps: [
      'Ajoyib savol! Uni birgalikda bosqichma-bosqich yechamiz.',
      'Birinchi qadam: savolda nima berilganini va nima so\u2018ralganini aniq belgilab chiqing.',
      'Keyin, bu masala qaysi mavzuga tegishli (formula, qoida, definition)? O\u2018z so\u2018zlaringiz bilan ayting.',
      'Shu qoidani qo\u2018yib, bitta kichik misolda sinab ko\u2018ring.',
      'Javob topdingizmi? Agar qiyin bo\u2018lsa, muammoning qaysi bosqichida to\u2018xtaganingizni yozing — men ya\u2018na yo\u2018naltiraman.',
    ],
  };
}

/* ——————————————————— Tabiiylashtirish (AI Text Humanizer) ——————————————————— */

/** Apostrof variantlarini bitta klassda birlashtiradi (o' / oʻ / o'). */
const APOS = "['\u2018\u02BB\u02BC]";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** So'z chegaralari bilan ibora uchun regex (apostroflar mos). */
function phraseRe(phrase) {
  const body = escapeRe(phrase).replace(/'/g, APOS);
  return new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, 'giu');
}

/** AI matnlarining eng ko'p uchraydigan bo'sh "qolip" iboralari — olib tashlanadi. */
const FILLER_PHRASES = [
  // o'zbekcha
  'Zamonaviy dunyoda', 'Bugungi kunda', 'Bugungi jamiyatda', 'Zamonaviy jamiyatda',
  "Shuni ta'kidlash joizki", "Ta'kidlash joizki", "Ta'kidlash kerakki", "Aytish joizki",
  "Aytish kerakki", "Qayd etish joizki", "Qisqacha aytganda", "Xulosa qilib aytganda",
  "Inobatga olsak", 'Shak-shubhasiz', "So'zsiz", 'Vijdonan aytganda',
  'Jadal rivojlanayotgan', 'Rivojlangan jamiyatda', "So'nggi yillarda",
  // inglizcha
  "In today's fast-paced world", "In today's digital age", 'In the modern era',
  'It is important to note that', 'It should be noted that', 'It is worth noting that',
  'Needless to say', 'It goes without saying', 'At the end of the day',
  'First and foremost', 'Last but not least', 'Needless to say',
  // ruscha
  'В современном мире', 'Стоит отметить, что', 'Несомненно', 'Как известно',
];

/** Quruq-quruq raspisanie o'rniga tabiiy variantlar. [ibora, variantlar[]] */
const PHRASE_SWAPS = [
  // o'zbekcha
  ['katta ahamiyatga ega', ['muhim', 'asosiy']],
  ['muhim ahamiyatga ega', ['muhim']],
  ['amalga oshirilmoqda', ['bajarilmoqda', 'qilinmoqda']],
  ['amalga oshirildi', ['bajarildi', 'qilindi']],
  ['amalga oshirish', ['bajarish', 'qilish']],
  ['yuzaga kelmoqda', ['chiqmoqda', 'bormoqda']],
  ["ko'rib chiqilmoqda", ['muhokama qilinmoqda']],
  ["qo'llaniladi", ['ishlatiladi']],
  ["ta'minlaydi", ['beradi']],
  ['shakllantiriladi', ['yaratiladi']],
  ['yuzasidan', ['haqida', 'bo\u2019yicha']],
  ['hisobga olinsa', ['agar kirsak', 'oddiy qaraganda']],
  ['quyidagi', ['bu', 'mana ko\u2018rsatilgan']],
  ['mazkur', ['bu']],
  ['ushbu', ['bu', 'shu']],
  ['belgilangan', ['tanlangan', 'aniqlangan']],
  ["o'z o'rnida", ['o\u2018zi']],
  ['keng qamrovli', ['batafsil', 'yorqin']],
  ['bundan tashqari', ['Yana bir narsa', 'Shu bilan birga', 'Bunda ham']],
  ['shuningdek', ['Yana', 'Bunda ham']],
  ['shuning uchun', ['Shu bois', 'Shundan kelib chiqib']],
  ['natijada', ['Buning natijasida', 'Oqibatda']],
  ['xulosa qilib aytganda', ['Xulosada', 'Qisqasi']],
  ["ma'lum bo'lishicha", ['ko\u2018rinib turibdiki']],
  // inglizcha
  ['utilize', ['use']], ['leverage', ['use']], ['commence', ['start']],
  ['endeavor', ['try']], ['facilitate', ['help']], ['demonstrate', ['show']],
  ['additionally', ['also']], ['furthermore', ['also']], ['moreover', ['also']],
  ['consequently', ['so']], ['therefore', ['so']], ['however', ['but']],
  ['nevertheless', ['still']], ['individuals', ['people']], ['numerous', ['many']],
  ['significant', ['big']], ['approximately', ['about']], ['in order to', ['to']],
  ['due to the fact that', ['because']], ['a plethora of', ['lots of']],
  ['a myriad of', ['lots of']], ['a multitude of', ['lots of']],
  ['crucial', ['key', 'big']], ['vital', ['key']], ['pivotal', ['key']],
  ['robust', ['solid']], ['seamless', ['smooth']], ['comprehensive', ['full', 'complete']],
  ['cutting-edge', ['new']], ['state-of-the-art', ['modern']],
  ['ever-evolving', ['changing']], ['ever-changing', ['changing']],
  ['delve into', ['look into']], ['dive deep into', ['explore']],
  ['tapestry', ['mix']], ['landscape', ['field']], ['realm', ['area']],
  ['testament to', ['proof of']], ['harness', ['use']], ['empower', ['help']],
  ['elevate', ['improve']], ['foster', ['build']],
  ['navigate the complexities of', ['deal with']], ['game-changer', ['big shift']],
  // ——— Ruleset v4: yangi AI-buzzwordlar (rule 2) ———
  ['plays a crucial role', ['matters', 'does a lot']],
  ['play a crucial role', ['matter', 'do a lot']],
  ['plays a vital role', ['matters', 'does a lot']],
  ['play a vital role', ['matter', 'do a lot']],
  ['an indispensable', ['a must-have', 'a key']],
  ['seamlessly', ['smoothly', 'without a hitch']],
  ['rich flavor', ['deep flavor', 'hearty taste']],
  ['in summary', ['to sum it up', 'all in all']],
  ['in conclusion', ['to wrap up', 'in the end']],
  ['negatively impact', ['hurt', 'harm']],
  // ruscha
  ['осуществляется', ['выполняется']], ['играет важную роль', ['важен']],
];

/** Ortcha-ravoq qo'shimchalari — o'chiriladi. */
const HEDGES = [
  'juda ', 'mutlaqo ', 'butunlay ', 'haqiqatan ham ',
  'very ', 'really ', 'absolutely ', 'truly ',
  'extensively ', 'seamlessly ', 'perfectly ',
];

/** Inglizcha tabiiy qisqartmalar. */
const EN_CONTRACTIONS = [
  ['do not', "don't"], ['does not', "doesn't"], ['did not', "didn't"],
  ['is not', "isn't"], ['are not', "aren't"], ['was not', "wasn't"],
  ['were not', "weren't"], ['cannot', "can't"], ['will not', "won't"],
  ['would not', "wouldn't"], ['should not', "shouldn't"], ['could not', "couldn't"],
  ['it is', "it's"], ['that is', "that's"], ['there is', "there's"],
  ['they are', "they're"], ['we are', "we're"], ['you are', "you're"],
  ['let us', "let's"], ['have not', "haven't"], ['has not', "hasn't"],
  ['i am', "I'm"], ['he is', "he's"], ['she is', "she's"],
  // Ruleset v4: tabiiy qisqartmalar (rule 3)
  ['we will', "we'll"], ['they will', "they'll"], ['you will', "you'll"],
  ['it will', "it'll"], ['i will', "I'll"], ['he will', "he'll"],
  ['she will', "she'll"], ['we are', "we're"], ['is not', "isn't"],
];

/* ——————— Agressiv dvigatel: katta sinonim leksikoni ——————— */

/** Inglizcha: AI matnlarida eng ko'p uchraydigan rasmiy so'zlarning tabiiy variantlari. */
const SYN_EN = {
  important: ['key', 'big'], significant: ['big', 'major'], utilize: ['use'],
  demonstrate: ['show', 'prove'], various: ['all sorts of', 'different'],
  numerous: ['loads of', 'plenty of'], individuals: ['people'], children: ['kids'],
  assistance: ['help'], additional: ['extra'], commence: ['start'], terminate: ['end'],
  facilitate: ['help'], purchase: ['buy'], ascertain: ['find out'], endeavor: ['try'],
  traditional: ['old-school', 'classic', 'time-tested'],
  delicious: ['tasty', 'yum', 'seriously good'],
  especially: ['mostly', 'above all', 'most of all'],
  beautiful: ['gorgeous', 'stunning'], difficult: ['tough', 'tricky'],
  easy: ['simple', 'a breeze'], quickly: ['fast', 'in no time'],
  enough: ['plenty', 'more than enough'], include: ['pack in', 'feature'],
  provide: ['give', 'hand'], require: ['need', 'call for'],
  ensure: ['make sure', 'guarantee'], indicate: ['show', 'point to'],
  suggest: ['hint at', 'propose'], argue: ['claim', 'insist'],
  believe: ['think', 'figure'], consider: ['weigh up', 'think over'],
  develop: ['build', 'grow'], create: ['make', 'build'],
  maintain: ['keep up', 'hold'], establish: ['set up', 'kick off'],
  implement: ['roll out', 'put in place'], evaluate: ['size up', 'check out'],
  analyze: ['look into', 'go over'], examine: ['check out', 'look over'],
  discover: ['find out', 'uncover'], explain: ['spell out', 'walk through'],
  achieve: ['pull off', 'reach'], obtain: ['get', 'pick up'],
  constitute: ['make up', 'form'], approximately: ['about', 'roughly'],
  significantly: ['hugely', 'massively'], particularly: ['mostly', 'in particular'],
  generally: ['usually', 'broadly'], typically: ['usually', 'as a rule'],
  currently: ['right now', 'these days'], eventually: ['in the end', 'sooner or later'],
  initially: ['at first', 'to begin with'], ultimately: ['in the end', "when all's said and done"],
  frequently: ['often', 'loads of times'], rarely: ['hardly ever', 'not often'],
  problem: ['issue', 'headache'], result: ['outcome', 'upshot'],
  method: ['way', 'technique'], factor: ['piece', 'element'],
  aspect: ['side', 'part'], benefit: ['plus', 'upside'],
  drawback: ['downside', 'snag'], goal: ['aim', 'target'],
  task: ['job', 'chore'], ability: ['skill', 'knack'],
  possibility: ['chance', 'shot'], opportunity: ['chance', 'opening'],
  difficulty: ['hassle', 'trouble'], success: ['win', 'breakthrough'],
  failure: ['flop', 'miss'], change: ['shift', 'tweak'],
  improve: ['boost', 'sharpen'], increase: ['boost', 'push up'],
  reduce: ['cut', 'trim'], big: ['large', 'huge'], small: ['little', 'tiny'],
  good: ['solid', 'great'], bad: ['poor', 'lousy'], make: ['build', 'put together'],
  think: ['believe', 'figure'], say: ['tell', 'mention'],
  however: ['but', 'though'], although: ['even though', 'though'],
  because: ['since', 'as'], therefore: ["so", "that's why"],
  moreover: ['also', 'plus'], besides: ['also', 'on top of that'],
  regarding: ['about', 'on'], role: ['part', 'job'],
  // ——— Ruleset v4 (rule 2): aniq, tabiiy variantlar ———
  contemporary: ['present-day', 'current'], streamline: ['simplify', 'trim'],
  productivity: ['output', 'pace'], scholars: ['researchers', 'teachers'],
  ecosystem: ['system', 'network'], component: ['part', 'piece'],
  readiness: ['preparedness', 'fitness'], rapidly: ['fast', 'quickly'],
  enhance: ['boost', 'improve'], indispensable: ['essential', 'vital'],
  undoubtedly: ['no doubt', 'surely'], essential: ['key', 'vital'],
  collaborative: ['team-based', 'joint'], transform: ['change', 'reshape'],
  negative: ['bad'], notably: ['markedly'],
};

/** O'zbekcha: aniq sinonimlar (ma'no buzilmaydi, faqat uslub o'zgaradi). */
const SYN_UZ = {
  "muhim": ["asosiy", "hal qiluvchi"], "asosiy": ["muhim", "kalit"],
  "qiyin": ["murakkab", "og'ir"], "murakkab": ["qiyin", "chigal"],
  "oson": ["sodda", "yengil"], "sodda": ["oson", "tushunarli"],
  "katta": ["yirik", "ulkan"], "kichik": ["mayda", "kichkinagina"],
  "yaxshi": ["maqbul", "zo'r"], "yomon": ["salbiy", "kuchsiz"],
  "tez": ["tezkor", "shoshilinch"], "sekin": ["asta", "birdan-bir"],
  "ko'p": ["ancha", "xazir"], "oz": ["kam", "bir oz"],
  "hamma": ["barcha", "barca"], "ba'zi": ["ayrim", "ba'zi bir"],
  "yana": ["qaytadan", "yanada"], "lekin": ["ammo", "biroq"],
  "ammo": ["lekin", "biroq"], "biroq": ["lekin", "ammo"],
  "chunki": ["negaki", "sababi"], "shuning": ["shu bois"],
  "natijada": ["oqibatda", "uning teskarisi"], "masalan": ["misol uchun", "aytaylik"],
  "ayniqsa": ["xususan", "bitqin"], "odatda": ["ko'pincha", "odatda ham"],
  "odamlar": ["insonlar", "xalq"], "insonlar": ["odamlar", "insoniyat"],
  "rivojlanish": ["yuksalish", "o'sish"], "o'sish": ["rivojlanish", "ko'payish"],
  "ta'lim": ["tahsil", "ta'lim-tarbiya"], "ilm": ["fan", "bilim"],
  "qiyinchilik": ["og'irlik", "murakkablik"], "imkoniyat": ["fursat", "savod"],
  "muammo": ["masala", "kamchilik"], "yechim": ["hal yo'li", "chora"],
  "sabab": ["sabab-harakat", "ilova"], "natija": ["oqibat", "hosil"],
  "foyda": ["manfaat", "foyda"], "zarar": ["salbiy", "yomon"],
  "qoida": ["tartib", "qonun"], "kuch": ["drayv", "qudrat"],
  "vaqt": ["payt", "dam"], "joy": ["o'rin", "makon"],
  "doim": ["har doim", "tintuv"], "tez-tez": ["ko'pincha", "tik-tik"],
  "hozir": ["hozircha", "shu payt"], "kelajakda": ["ertaga", "yaqin kelajakda"],
  "avval": ["oldin", "birinchi"], "keyin": ["so'ng", "undan keyin"],
  // ——— Eng ko'p uchraydigan so'zlar (barcha morfologik shakllari bilan) ———
  "talaba": ["o'quvchi", "talabalik"], "talabalar": ["o'quvchilar", "yoshlar"],
  "talabalarinig": ["o'quvchilarning"], "talabaga": ["o'quvigacha"],
  "talabalarni": ["o'quvchilarni"], "talabalarga": ["o'quvchilarga"],
  "o'qiydi": ["mutolaa qiladi", "kitob o'qiydi"], "o'qish": ["mutolaa", "kitob o'qish"],
  "o'qiydi": ["mutolaa qiladi"], "o'qigan": ["mutolaa qilgan"],
  "universitet": ["oliy ta'lim muassasasi", "univers"], "universitetda": ["oliy ta'lim muassasasida"],
  "kutubxona": ["kitob ombori"], "kutubxonaga": ["kitob omboriga"],
  "kutubxonada": ["kitob omborida"], "boradi": ["tashrif buyuradi", "yo'l oladi"],
  "bordi": ["tashrif buyurdi", "yo'l oldi"], "borib": ["borib", "tashrif buyib"],
  "fanlar": ["malakalar", "yorliqlar"], "fanlarni": ["malakalarni", "yorliqlarni"],
  "o'rganish": ["o'zlashtirish", "ichga singdirish"], "o'rganadi": ["o'zlashtiradi", "ichga singdiradi"],
  "qiziq": ["qiziqarli", "jarangli"], "kechqurun": ["tunda", "kechki vaqtda"],
  "dars": ["mashg'ulot", "sabak"], "darslar": ["mashg'ulotlar", "sabaklar"],
  "qiladi": ["bajaradi", "amalga oshiradi"], "qildi": ["bajardi", "amalga oshirdi"],
  "kelajagini": ["istiqbolini", "ertangi kunini"], "belgilaydi": ["aniqlaydi", "ko'rsatadi"],
  "hamma": ["barcha", "barca"], "ham": ["shuningdek", "yanagi"],
  "bu": ["shu", "mana shu"], "shu": ["bu", "aynan"],
  "yana": ["yanada", "qaytadan"], "lekin": ["ammo", "biroq"],
  "bor": ["mavjud", "ustida"], "yo'q": ["yo'q", "mavjud emas"],
  "katta": ["yirik", "tabiiy"], "kichik": ["mayda", "ziyrak"],
  "tez": ["tezkor", "shoshilinch"], "sekin": ["asta-sekin", "birdan-bir"],
  "yangi": ["yangiroq", "zo'r"], "eski": ["avvalgi", "ko'nikma"],
  "qiyin": ["murakkab", "og'ir"], "oson": ["sodda", "yengil"],
  "odamlar": ["insonlar", "xalq"], "insonlar": ["odamlar", "insoniyat"],
  "jamiyat": ["jamoat", "olam"], "dunyo": ["olam", "sayyora"],
  "hukumat": ["davlat", "rahbariyat"], "mamlakat": ["davlat", "yiynat"],
  "shahar": ["shaharcha", "mahalla"], "qishloq": ["dehqonlik", "qishloqchilik"],
  "ish": ["mehnat", "faoliyat"], "ishlar": ["mehnatlar", "faoliyatlar"],
  "vaqt": ["payt", "dam"], "kun": ["kunlik", "bir kun"],
  "soat": ["xacm soat", "vaqt"], "yil": ["yillar", "davr"],
  "yaxshi": ["maqbul", "zo'r"], "yomon": ["salbiy", "kuchsiz"],
  "ko'p": ["ancha", "xazir"], "oz": ["kam", "bir oz"],
  "barcha": ["hamma", "barca"], "ayrim": ["ba'zi", "bir qator"],
  "shuning": ["shu bois", "shu sababli"], "sababli": ["tufayli", " bois"],
  "natijada": ["oqibatda", "uning natijasida"], "masalan": ["misol uchun", "aytaylik"],
  "ayniqsa": ["xususan", "bitqin"], "odatda": ["ko'pincha", "odatda ham"],
  "doim": ["har doim", "tintuv"], "hozir": ["hozircha", "shu payt"],
  "ozgardi": ["almashdi", "o'zgardi"], "o'zgardi": ["almashdi", "qayta ko'rinish oldi"],
  "ko'paydi": ["ko'pladi", "sodir bo'ldi"], "kamaydi": ["kamayib bordi", "pasaydi"],
};

/* ——— Ruleset v4: filler markerlar OCHIRILDI (rule 4) ———
 * "The thing is", "No doubt" kabi qoshimcha fillerlar taqiqlangan.
 * Orniga haqiqiy sintaksis qayta quriladi: pasiv->faol, savol,
 * ochilishlarini xilma-xilligi, ritm. ——— */

/** Yordamchi fe'llar (savol qurish uchun). */
const AUX_SET = new Set([
  'is', 'are', 'was', 'were', 'can', 'could', 'will', 'would',
  'should', 'may', 'might', 'must', 'do', 'does', 'did', 'has',
  'have', 'had',
]);

/** Artikl/olovchi/ollovchi so'zlar (pastga tushirish uchun). */
const DET_HEADS = new Set([
  'the', 'this', 'that', 'these', 'those', 'a', 'an', 'my', 'your',
  'his', 'her', 'its', 'our', 'their', 'there',
  'it', 'they', 'we', 'you', 'he', 'she',
]);

/** Do-support uchun ollovchi xaritasi. */
const DO_PRON = {
  it: 'Does', this: 'Does', that: 'Does', he: 'Does', she: 'Does',
  you: 'Do', we: 'Do', they: 'Do',
};

const capWord = (w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w);

/** Gap boshidagi artikl/olovchi so'zni kichik harfga tushiradi. */
function lowerIfDet(head) {
  const [first, ...rest] = head.split(/\s+/);
  const joined = rest.length ? ' ' + rest.join(' ') : '';
  return DET_HEADS.has(first.toLowerCase())
    ? first.toLowerCase() + joined
    : head;
}

/**
 * Qoida 3: qisqa deklarativ gapni tabiiy savolga aylantirish
 * (aux invert yoki do-support). Mano 100% saqlanadi.
 *
 * @returns {string|null} yangi savol yoki null
 */
function toQuestion(sent) {
  const m = sent.match(/^(.+?)([.!?…])$/);
  const body = m ? m[1] : sent;
  if (!body || body.includes(',')) return null; // murakkab gapga tegmaymiz
  const w = body.split(/\s+/);
  if (w.length < 2 || w.length > 12) return null;

  // 1) Yordamchi fe'l invert: "AI is changing..." -> "Is AI changing...?"
  for (const ai of [1, 2]) {
    if (ai >= w.length) continue;
    const aux = w[ai].toLowerCase().replace(/[^a-z']/g, '');
    if (!AUX_SET.has(aux)) continue;
    const subj = w.slice(0, ai).join(' ');
    if (words(subj).length > 3) continue;
    const rest = w.slice(ai + 1).join(' ').trim();
    const subjOut = ai === 2 ? lowerIfDet(subj) : subj;
    return `${capWord(w[ai])} ${subjOut} ${rest}`.replace(/\s{2,}/g, ' ').trim() + '?';
  }

  // 2) Do-support: "It matters." -> "Does it matter?"
  const pron = DO_PRON[w[0].toLowerCase().replace(/[^a-z']/g, '')];
  if (pron && w.length >= 2) {
    const vLow = w[1].toLowerCase();
    if (!AUX_SET.has(vLow) && /[a-z]s$/.test(vLow) && !/(ss|us|is|as|has)$/.test(vLow)) {
      let stem;
      if (/ies$/.test(vLow)) stem = vLow.slice(0, -3) + 'y';
      else if (/(ses|xes|zes|ches|shes)$/.test(vLow)) stem = vLow.slice(0, -2);
      else stem = vLow.slice(0, -1);
      const rest = [stem, ...w.slice(2)].join(' ');
      return `${pron} ${w[0]} ${rest}`.replace(/\s{2,}/g, ' ').trim() + '?';
    }
  }
  return null;
}

/**
 * Qoida 3: pasiv -> faol ovoz (inglizcha).
 * "The meal was cooked by my mom." -> "My mom cooked the meal."
 * Faqat o'tgan zamon (was/were) — qiyma o'zgarmaydi, xavfsiz.
 *
 * @returns {string|null} faol gap yoki null
 */
function passiveToActive(sent) {
  if (/[?!]/.test(sent)) return null;
  const m = sent.match(
    /^(.{2,60}?)\s+(was|were)\s+([a-z]+ed)\s+by\s+([^.!?,;:]{2,50}?)([.!?…]?)$/i,
  );
  if (!m) return null;
  const [, subj, , ved, agent, punct] = m;
  if (subj.includes(',') || agent.includes(',')) return null;
  if (words(subj).length > 6 || words(agent).length > 6) return null;
  // Otgan zamon: ved o'zgarmaydi — shakl mos keladi
  return `${capWord(agent.trim())} ${ved} ${lowerIfDet(subj.trim())}${punct || '.'}`;
}

/** Adverbial frazalar (ochilish oldinga suriladigan). */
const ADV_FRONTAL = [
  'especially', 'typically', 'usually', 'generally', 'still', 'also',
  'however', 'therefore', 'meanwhile', 'eventually', 'finally', 'first',
  'next', 'later', 'often', 'sometimes', 'rarely', 'always', 'now',
  'then', 'today', 'instead', 'indeed', 'fortunately', 'unfortunately',
  'in practice', 'in theory', 'for example', 'for instance', 'in fact',
  'after all', 'on the other hand', 'most importantly', 'most of the time',
  'at first', 'in the end', 'by then', 'in turn',
];

function looksAdverbial(seg) {
  const w = seg.trim().toLowerCase();
  return ADV_FRONTAL.some((a) => w.startsWith(a + ' ') || w === a);
}

/**
 * Qoida 1: ketma-ket gaplar bir xil so'z bilan boshlanmasligi uchun
 * adverbialni oldinga surish. Mano saqlanadi, sintaksis qayta quriladi.
 */
function varyOpenings(sents, rnd) {
  const out = sents.slice();
  for (let i = 1; i < out.length; i += 1) {
    const pw = out[i - 1].split(/\s+/)[0]?.toLowerCase().replace(/[^a-z']/g, '');
    const cw = out[i].split(/\s+/)[0]?.toLowerCase().replace(/[^a-z']/g, '');
    if (!pw || pw !== cw) continue;
    if (rnd() > 0.7) continue;
    const commaIdx = out[i].indexOf(', ');
    if (commaIdx < 3) continue;
    const head = out[i].slice(0, commaIdx);
    const rest = out[i].slice(commaIdx + 2);
    if (words(head).length < 4 || words(head).length > 14) continue;
    const pm = rest.match(/^(.+?)([.!?…])$/);
    const restBody = pm ? pm[1] : rest;
    const punct = pm ? pm[2] : '.';
    if (!looksAdverbial(restBody)) continue;
    if (words(restBody).length < 1 || words(restBody).length > 8) continue;
    out[i] = `${capWord(restBody)}, ${lowerIfDet(head)}${punct}`;
  }
  return out;
}

/** Rasmiy iboralarning norasmiy, jonli variantlari (qo\u2018shimcha formal→casual). */
const FORMAL_TO_CASUAL = [
  ['in order to', ['to']], ['due to the fact that', ['because']],
  ['at this point in time', ['right now', 'now']], ['in the near future', ['soon']],
  ['for the purpose of', ['to', 'for']], ['has the ability to', ['can']],
  ['is able to', ['can']], ['in spite of the fact that', ['although', 'even though']],
  ['on a regular basis', ['regularly', 'often']], ['take into consideration', ['consider', 'weigh']],
  ['a wide range of', ['loads of', 'all sorts of']], ['a large number of', ['loads of', 'tons of']],
  ['plays an important role', ['matters a lot', 'does a lot']],
  // o'zbekcha rasmiy→norasmiy
  ['amalga oshirish', ['bajarish', 'qilish']], ['mazkur', ['bu']],
  ['ushbu', ['bu', 'shu']], ['quyidagi', ['mana bu']],
];

/* ————————— Gap strukturasini qayta qurish (burstiness) ————————— */

/** Bir so'zning barcha morfologik shakllarini hisobga olgan holda almashtirish uchun yordamchi. */
function swapWord(word, dict) {
  const lower = word.toLowerCase();
  const variants = dict[lower];
  if (!variants) return word;
  const pick = variants[Math.floor(Math.random() * variants.length)];
  // Kapitalizatsiyani saqlaymiz
  if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
    return pick.charAt(0).toUpperCase() + pick.slice(1);
  }
  return pick;
}

/** Gap ichida per-word sinonim almashtirish (inglizcha). */
function swapSynonymsEn(sentence, rnd) {
  return sentence.replace(/\b[A-Za-z]+\b/g, (w) => {
    const dict = SYN_EN;
    const lower = w.toLowerCase();
    const variants = dict[lower];
    if (!variants) return w;
    const pick = variants[Math.floor(rnd() * variants.length)];
    if (w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase()) {
      return pick.charAt(0).toUpperCase() + pick.slice(1);
    }
    return pick;
  });
}

/** Gap ichida per-word sinonim almashtirish (o'zbekcha, apostrof variantlarini hisobga oladi). */
function swapSynonymsUz(sentence, rnd) {
  return sentence.replace(/[A-Za-zʻʼ'’]+/g, (w) => {
    const norm = w.replace(/[ʻʼ'’]/g, "'");
    const variants = SYN_UZ[norm];
    if (!variants) return w;
    const pick = variants[Math.floor(rnd() * variants.length)];
    if (w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase()) {
      return pick.charAt(0).toUpperCase() + pick.slice(1);
    }
    return pick;
  });
}

/**
 * Qoida 3 + 1: haqiqiy struktura qayta qurish (filler qoshilmasdan):
 * pasiv->faol, savol, ochilishlarini xilma-xilligi, ritm (birlashtirish/bo'lish).
 *
 * @param {string} text
 * @param {() => number} rnd — deterministik RNG
 * @param {'en'|'uz'|'ru'} lang
 * @param {{question?: boolean}} opts — question: birinchi qisqa gapni savolga aylantirish
 */
function restructurePass(text, rnd, lang, { question = false } = {}) {
  let sents = sentences(text);

  // 1) Pasiv -> faol (inglizcha)
  if (lang === 'en') {
    sents = sents.map((s) => passiveToActive(s) || s);
  }

  // 2) Rhetorical question (inglizcha, bir marta, qisqa gapdan)
  if (lang === 'en' && question) {
    const idx = sents.findIndex(
      (s) => !/[?]$/.test(s) && !s.includes(',') && words(s).length >= 2 && words(s).length <= 11,
    );
    if (idx >= 0) {
      const q = toQuestion(sents[idx]);
      if (q) sents[idx] = q;
    }
  }

  // 3) Ochilishlarini xilma-xilligi (rule 1)
  sents = varyOpenings(sents, rnd);

  // 4) Ritm: qisqa gaplarni birlashtirish / uzunlarni bo'lish (rule 1)
  sents = burstifySentences(sents, rnd, lang);

  let out = sents.join(' ');
  out = out
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
  return capitalizeAfterStops(out);
}

/**
 * Ritm: qisqa gaplarni birlashtirish (grammatik bog'lovchi bilan) va
 * uzun gaplarni bo'lish — qisqa↔uzun ketma-ketligi (burstiness, rule 1).
 */
function burstifySentences(sents, rnd, lang = 'en') {
  const lens = sents.map((s) => s.split(/\s+/).length);
  const connector = lang === 'uz' ? (rnd() < 0.5 ? 'va' : 'ham') : 'and';
  const lcHead = (s) => {
    const [first, ...rest] = s.split(/\s+/);
    return DET_HEADS.has(first.toLowerCase())
      ? first.toLowerCase() + (rest.length ? ' ' + rest.join(' ') : '')
      : s;
  };
  const rebuilt = [];
  for (let i = 0; i < sents.length; i += 1) {
    const n = lens[i];
    // Ikki qisqa gap ketma-ket bo'lsa — birlashtirish (", and"/", va" bilan)
    if (n <= 7 && i + 1 < sents.length && lens[i + 1] <= 7 && rnd() < 0.55) {
      const left = sents[i].replace(/[.!?…]+$/, '');
      const right = sents[i + 1].replace(/^[.!?…]+\s*/, '');
      rebuilt.push(`${left}, ${connector} ${lcHead(right)}`.trim());
      i += 1;
      continue;
    }
    // Uzun gap bo'lsa (>16 so'z) — bog'lovchidan ikkiga bo'lish (ritm uchun)
    if (n > 16 && rnd() < 0.6) {
      const parts = splitLongSentence(sents[i]);
      if (parts) {
        rebuilt.push(parts[0], parts[1]);
        continue;
      }
    }
    rebuilt.push(sents[i]);
  }
  return rebuilt;
}

/** Jaccard-similarite: qancha so'z o'zgarganini hisoblash (0-1, 0 = hammasi o'zgardi). */
function jaccardDiff(a, b) {
  const A = new Set(words(a));
  const B = new Set(words(b));
  if (A.size === 0 && B.size === 0) return 0;
  const inter = new Set([...A].filter((w) => B.has(w)));
  const union = new Set([...A, ...B]);
  return 1 - inter.size / union.size;
}

/* ————————— Yangi agressiv humanize funksiyasi ————————— */

/**
 * AI yozgan matnni tubdan qayta yozadi (ruleset v4):
 * 1) Burstiness — qisqa↔uzun gap ritmi va ochilishlarini xilma-xilligi;
 * 2) Perplexity — qolip/buzzwordlarni olib tashlash + katta sinonim leksikoni;
 * 3) Pasiv->faol, tabiiy qisqartmalar, rhetorical savollar;
 * 4) Filler markerlar TAQIQLANGAN ("The thing is" kabi qoshimcha yo'q) —
 *    faqat haqiqiy sintaksis qayta quriladi; matematik kafolat 40-60%.
 *
 * @param {string} input — qayta yoziladigan matn
 * @param {{intensity?: 'light'|'medium'|'strong'}} opts — kuch darajasi
 * @returns {{text: string, changes: object[], stats: object}}
 */
export function humanizeAggressive(input, { intensity = 'medium' } = {}) {
  const source = String(input || '').replace(/\s+/g, ' ').trim();
  if (!source) return { text: '', changes: [], stats: emptyHumanizeStats() };

  const level = { light: 1, medium: 2, strong: 3 }[intensity] ?? 2;
  // Kafolat: kamida shuncha o'zgarish bo'lishi shart (Jaccard distance).
  // Qisqa matnlar uchun (30 so'zdan kam) target 0.15 ga yumshatiladi —
  // 40-60% oralig'i saqlanadi, lekin qisqa matnda 60% erishish tabiatan qiyin.
  const baseTarget = { 1: 0.4, 2: 0.5, 3: 0.6 }[level];
  const wordCount = words(source).length;
  const minChangeTarget = wordCount < 30 ? Math.max(0.4, baseTarget - 0.15) : baseTarget;
  const changes = [];
  const rnd = mulberry(hashStr(source) ^ 0x51ed2701);
  const scoreBefore = aiScore(source);

  // Til aniqlash (kirill harflari bo'lsa ru, apostrof yoki o'zbekcha so'zlar bo'lsa uz, aks holda en)
  const hasCyrillic = /[\u0400-\u04FF]/.test(source);
  const lang = hasCyrillic ? 'ru' : detectLang(source);

  let out = source;
  const maxPasses = level === 3 ? 5 : level === 2 ? 4 : 3;
  let pass = 0;

  while (pass < maxPasses) {
    pass += 1;
    const prevOut = out;

    // 1) Bo'sh qolip iboralarini olib tashlash (barcha passlarda)
    for (const phrase of FILLER_PHRASES) {
      const re = new RegExp(
        `(?<![\\p{L}\\p{N}])${escapeRe(phrase).replace(/'/g, APOS)}(?:\\s*,)?\\s*`,
        'giu',
      );
      let count = 0;
      out = out.replace(re, () => { count += 1; return ' '; });
      if (count) changes.push({ from: phrase, to: '—', type: 'filler', count });
    }

    // 2) Quruq iboralar → tabiiy variant (level >= 2)
    if (level >= 2) {
      for (const [phrase, variants] of PHRASE_SWAPS) {
        const pick = variants[Math.floor(rnd() * variants.length)];
        let count = 0;
        out = out.replace(phraseRe(phrase), (match, offset) => {
          count += 1;
          const before = out.slice(Math.max(0, offset - 2), offset);
          const isSentStart = /(^|[.!?…]\s+)$/.test(before);
          return isSentStart ? pick.charAt(0).toUpperCase() + pick.slice(1) : pick;
        });
        if (count) changes.push({ from: phrase, to: pick, type: 'swap', count });
      }

      // 3) Orta-ravoq qo'shimchalarni o'chirish
      for (const hedge of HEDGES) {
        const re = new RegExp(
          `(?<![\\p{L}\\p{N}])${escapeRe(hedge.trim())}(?![\\p{L}\\p{N}])(?:\\s+|$)`,
          'giu',
        );
        let count = 0;
        out = out.replace(re, () => { count += 1; return ' '; });
        if (count) changes.push({ from: hedge.trim(), to: '—', type: 'hedge', count });
      }
    }

    // 4) Inglizcha qisqartmalar
    for (const [full, short] of EN_CONTRACTIONS) {
      let count = 0;
      out = out.replace(phraseRe(full), () => { count += 1; return short; });
      if (count) changes.push({ from: full, to: short, type: 'contract', count });
    }

    // 5) Rasmiy → norasmiy iboralar
    for (const [phrase, variants] of FORMAL_TO_CASUAL) {
      const pick = variants[Math.floor(rnd() * variants.length)];
      let count = 0;
      out = out.replace(phraseRe(phrase), (match, offset) => {
        count += 1;
        const before = out.slice(Math.max(0, offset - 2), offset);
        const isSentStart = /(^|[.!?…]\s+)$/.test(before);
        return isSentStart ? pick.charAt(0).toUpperCase() + pick.slice(1) : pick;
      });
      if (count) changes.push({ from: phrase, to: pick, type: 'casual', count });
    }

    // 6) Per-sentence rewrite (perplexity): per-word sinonim almashuv
    const sents = sentences(out);
    let rewritten = [];
    for (let sent of sents) {
      if (!sent.trim()) continue;
      if (lang === 'en') {
        sent = swapSynonymsEn(sent, rnd);
      } else if (lang === 'uz') {
        sent = swapSynonymsUz(sent, rnd);
      }
      // ru tilida synonym swap yo'q (xavfsizlik uchun)
      rewritten.push(sent);
    }

    // 6b) Qoida 3: pasiv -> faol ovoz (inglizcha, "was V-ed by Y")
    if (lang === 'en') {
      rewritten = rewritten.map((s) => passiveToActive(s) || s);
    }

    // 6c) Qoida 1: ochilishlarini xilma-xilligi (ketma-ket bir xil boshlanishga qarshi)
    rewritten = varyOpenings(rewritten, rnd);

    // 6d) Qoida 3: birinchi passda qisqa gap tabiiy savolga aylantiriladi
    if (pass === 1 && lang === 'en') {
      const qi = rewritten.findIndex(
        (s) => !/[?]$/.test(s) && !s.includes(',') && words(s).length >= 2 && words(s).length <= 11,
      );
      if (qi >= 0) {
        const q = toQuestion(rewritten[qi]);
        if (q) rewritten[qi] = q;
      }
    }

    // 7) Burstiness: ritm — qisqa↔uzun, birlashtirish/bo'lish (rule 1)
    out = burstifySentences(rewritten, rnd, lang).join(' ');
    if (out !== sents.join(' ')) {
      changes.push({ from: 'gap tuzilishi', to: 'qayta qurildi', type: 'rhythm', count: 1 });
    }

    // 8) Tozalash
    out = out
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/,{2,}/g, ',')
      .trim();
    out = capitalizeAfterStops(out);

    // 9) Kafolat tekshiruvi — yetarli o'zgarish bo'lsa to'xtatish
    const changePct = jaccardDiff(source, out);
    if (changePct >= minChangeTarget) {
      changes.push({
        from: `${pass} pass`,
        to: `${Math.round(changePct * 100)}% o'zgarish`,
        type: 'guarantee',
        count: 1,
      });
      break;
    }

    // Agar o'zgarish bo'lmasa — sintaksisni haqiqiy qayta qurish (filler EMAS)
    if (out === prevOut) {
      out = restructurePass(out, rnd, lang, { question: pass === 1 });
      // Agar hali ham o'zgarmagan bo'lsa — to'xtatish (pass limitiga yetganmiz)
      if (out === prevOut) break;
    }
  }

  // Loop tugagach, target oshilmagan bo'lsa — struktura qayta qurish passlari
  // (filler qoshilmasdan: pasiv->faol, savol, ochilishlar, ritm)
  let extraPass = 0;
  while (jaccardDiff(source, out) < minChangeTarget && extraPass < 4) {
    extraPass += 1;
    const next = restructurePass(out, rnd, lang, { question: extraPass === 1 });
    if (next === out) break;
    out = next;
  }

  // Yakuniy tozalash
  out = out.replace(/\s{2,}/g, ' ').trim();
  out = capitalizeAfterStops(out);

  const scoreAfter = aiScore(out);
  const changePctFinal = jaccardDiff(source, out);
  // Natija chiptasi — target oshilsa ham, oshmasa ham ko'rinadi (UX: changePercent har doim ko'rinadi)
  if (!changes.some((c) => c.type === 'guarantee')) {
    changes.push({
      from: `${pass + extraPass} pass`,
      to: `${Math.round(changePctFinal * 100)}% o'zgarish`,
      type: 'guarantee',
      count: 1,
    });
  }
  const clichesRemoved = changes
    .filter((c) => ['filler', 'hedge', 'casual', 'swap'].includes(c.type))
    .reduce((a, c) => a + c.count, 0);

  return {
    text: out,
    changes: dedupeChanges(changes).slice(0, 16),
    stats: {
      wordsBefore: words(source).length,
      wordsAfter: words(out).length,
      changes: dedupeChanges(changes).reduce((a, c) => a + c.count, 0),
      clichesRemoved,
      scoreBefore,
      scoreAfter,
      delta: scoreBefore - scoreAfter,
      changePercent: Math.round(changePctFinal * 100),
      passes: pass,
      language: lang,
    },
  };
}

/**
 * Ommaviy API: agressiv dvigatelga delegate qiladi.
 * Eski nomni saqlab, yangi kuchli mantıqni ishlatadi.
 */
export function humanizeText(input, opts = {}) {
  return humanizeAggressive(input, opts);
}

function detectLang(text) {
  const uzMarkers = ['va', 'bir', 'bu', 'uchun', 'ham', 'lekin', 'shu', 'o\u2018', 'qil', 'bor'];
  const enMarkers = ['the', 'and', 'is', 'are', 'was', 'for', 'that', 'with', 'this'];
  const wordsArr = words(text).slice(0, 30);
  let uzScore = 0;
  let enScore = 0;
  for (const w of wordsArr) {
    if (uzMarkers.includes(w) || /[ʻʼ]/.test(w)) uzScore += 1;
    if (enMarkers.includes(w)) enScore += 1;
  }
  if (uzScore > enScore) return 'uz';
  if (enScore > uzScore) return 'en';
  // Default: uz (loyiha o'zbek tilida)
  return 'uz';
}

function dedupeChanges(changes) {
  const seen = new Map();
  for (const c of changes) {
    const key = `${c.type}:${c.from}`;
    if (seen.has(key)) {
      seen.get(key).count += c.count;
    } else {
      seen.set(key, { ...c });
    }
  }
  return [...seen.values()];
}

function emptyHumanizeStats() {
  return {
    wordsBefore: 0, wordsAfter: 0, changes: 0, clichesRemoved: 0,
    scoreBefore: 0, scoreAfter: 0, delta: 0, changePercent: 0, passes: 0, language: 'uz',
  };
}

/** Deterministik, lekin matnga bog'liq "tasodif" (bir xil matn — bir xil natija). */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry(seed) {
  return function next() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let CHEAT_RES = null;
function cheatRegexes() {
  if (!CHEAT_RES) {
    CHEAT_RES = [
      ...FILLER_PHRASES.map((p) => phraseRe(p)),
      ...PHRASE_SWAPS.map(([p]) => phraseRe(p)),
    ];
  }
  return CHEAT_RES;
}

/**
 * Matndagi "AIlik" darajasini 0\u2013100 ballda baholaydi:
 * qolip iboralar zichligi + juda bir xil gap uzunliklari + rasmiy uzun so'zlar.
 */
export function aiScore(text) {
  const ws = words(text);
  const sents = sentences(text);
  if (ws.length < 8 || sents.length === 0) return 0;

  const low = String(text).toLowerCase();
  let hits = 0;
  for (const re of cheatRegexes()) hits += (low.match(re) || []).length;

  const lens = sents.map((s) => words(s).length);
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
  const cv = mean > 0 ? sd / mean : 1;
  const uniformity = cv < 0.35 ? (0.35 - cv) * 110 : 0;
  const formality = mean > 22 ? Math.min(20, (mean - 22) * 1.6) : 0;
  const longRatio = ws.filter((w) => w.length >= 8).length / ws.length;
  const heavy = longRatio > 0.28 ? Math.min(15, (longRatio - 0.28) * 80) : 0;
  const clicheCap = Math.min(45, (hits / ws.length) * 100 * 2.4);

  return clamp(Math.round(10 + clicheCap + uniformity + formality + heavy), 0, 98);
}

/**
 * ZeroGPT-uslubudagi tekshiruv (tarmoqsiz, lokal heuristika):
 * matnni gaplarga bo'lib, har bir gapni AI belgilari bo'yicha 0–100 ball
 * baholaydi va umumiy AI / Human foizlarini qaytaradi.
 *
 * Segment darajalari (ZeroGPT uslubidagi highlight uchun):
 *   - 'ai'    (ball ≥ 58) — qizil, aniq AI belgilari
 *   - 'warn'  (ball 34–57) — sarg'ish, shubhali
 *   - 'human' (ball < 34) — inson yozgandek
 *
 * @param {string} text
 * @returns {{aiPercent: number, humanPercent: number,
 *   verdict: 'human'|'mixed'|'ai'|'short',
 *   segments: Array<{text: string, score: number,
 *     level: 'human'|'warn'|'ai', wordCount: number}>}}
 */
export function detectAiText(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  const sents = sentences(raw);
  const ws = words(raw);

  // Juda qisqa matn — baholab bo'lmaydi
  if (!raw || ws.length < 6) {
    return {
      aiPercent: 0,
      humanPercent: 0,
      verdict: 'short',
      segments: sents.map((s) => ({
        text: s, score: 0, level: 'human', wordCount: words(s).length,
      })),
    };
  }

  const segments = sents.map((s) => {
    const sw = words(s);
    const low = s.toLowerCase();
    let hits = 0;
    for (const re of cheatRegexes()) hits += (low.match(re) || []).length;

    const clicheDensity = sw.length ? (hits / sw.length) * 100 : 0;
    const longRatio = sw.length
      ? sw.filter((w) => w.length >= 8).length / sw.length
      : 0;

    let score = 8; // bazaviy ball — har qanday matnda
    score += Math.min(44, clicheDensity * 2.6); // qolip iboralar zichligi
    score += hits >= 2 ? 7 : 0; // bir nechta qolip birdan
    score += longRatio > 0.22
      ? Math.min(15, (longRatio - 0.22) * 65)
      : 0; // rasmiy uzun so'zlar
    score += sw.length > 26
      ? Math.min(12, (sw.length - 26) * 1.2)
      : 0; // juda uzun "inhisar" gaplar
    score = clamp(Math.round(score), 0, 97);

    const level = score >= 58 ? 'ai' : score >= 34 ? 'warn' : 'human';
    return { text: s, score, level, wordCount: sw.length };
  });

  // So'z vazni bilan o'rtacha + gap uzunliklarining bir xilligi (uniformity) bonusi:
  // AI matnlarida gaplar sun'iy darajada bir xil uzunlikda bo'ladi (burstiness kam).
  const totalWords = segments.reduce((a, s) => a + s.wordCount, 0);
  let ai = totalWords
    ? segments.reduce((a, s) => a + s.score * s.wordCount, 0) / totalWords
    : 0;
  const lens = segments.map((s) => s.wordCount);
  if (lens.length >= 3) {
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const sd = Math.sqrt(
      lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length,
    );
    const cv = mean > 0 ? sd / mean : 1;
    if (cv < 0.4) ai += (0.4 - cv) * 16;
  }

  const aiPercent = clamp(Math.round(ai), 2, 97);
  const humanPercent = 100 - aiPercent;
  const verdict =
    humanPercent >= 70 ? 'human' : aiPercent >= 50 ? 'ai' : 'mixed';

  return { aiPercent, humanPercent, verdict, segments };
}

/** Juda uzun gapni bog'lovchi so'zdan ikkiga bo'ladi. */
function splitLongSentence(s) {
  const re = /,\s+(va|lekin|chunki|shuning uchun|natijada|and|but|because)\s+/gi;
  let m = null;
  let candidate = null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > 35) {
      candidate = m;
      break;
    }
  }
  if (!candidate) return null;
  const left = s.slice(0, candidate.index).trim().replace(/[,;:]$/, '') + '.';
  const rightRaw = s.slice(candidate.index + candidate[0].length).trim();
  if (!rightRaw) return null;
  const right = rightRaw.charAt(0).toUpperCase() + rightRaw.slice(1);
  if (words(left).length < 5 || words(right).length < 4) return null;
  return [left, /[.!?…]$/.test(right) ? right : right + '.'];
}

/** Nuqtadan keyingi kichik harflarni kattaga aylantiradi. */
function capitalizeAfterStops(s) {
  return s.replace(/(^|[.!?…]\s+)([\p{Ll}])/gu, (full, pre, ch) => pre + ch.toUpperCase());
}

/* ———————————————————————————— Saqlash yordamchisi ———————————————————————————— */

export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* kvota to'lgan bo'lsa — jim o'tamiz */
  }
}

export { clamp, round1 };
