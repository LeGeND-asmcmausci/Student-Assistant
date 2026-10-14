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
