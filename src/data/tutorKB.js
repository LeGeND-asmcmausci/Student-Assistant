/**
 * AI repetitor (AiTutor) uchun bilim bazasi.
 * Har bir yozuv: { topic, keywords, steps, answer? }
 * steps — Sokratik uslubdagi yo'l-yo'lakay yo'naltiruvchi savollar/javoblar.
 */

export const TUTOR_KB = [
  {
    topic: 'Kvadrat tenglama',
    keywords: ['kvadrat', 'tenglama', 'x^2', 'diskriminant', 'ax^2', '2-ta ildiz'],
    steps: [
      'Tenglamaning umumiy ko\u2018rinishini yozing: ax\u00b2 + bx + c = 0.',
      'a, b, c koeffitsientlarni ajratib oling (belgilar bilan birga).',
      'Diskriminantni hisoblang: D = b\u00b2 \u2212 4ac.',
      'D > 0 bo\u2018lsa \u2014 ikkita ildiz, D = 0 \u2014 bitta, D < 0 \u2014 haqiqiy ildiz yo\u2018q.',
      'Ildizlar formulasi: x = (\u2212b \u00b1 \u221aD) / (2a). Hisoblab ko\u2018ring.',
    ],
    answer: 'x1,2 = (\u2212b \u00b1 \u221aD)/(2a), D = b\u00b2 \u2212 4ac',
  },
  {
    topic: 'Foiz masalalari',
    keywords: ['foiz', 'foizda', 'qiskardi', 'qimmatlashdi', 'oshib', 'chiqindi', 'soliq'],
    steps: [
      'Asosiy qiymatni (100%) va foiz o\u2018zgarishini aniq belgilang.',
      'Foizning o\u2018nli kasrini yozing: 15% = 0.15.',
      'O\u2018zgarish miqdorini hisoblang: asosiy qiymat \u00d7 0.15.',
      'Natijani asosiy qiymatga qo\u2018shing (yoki ayiring) \u2014 yangi qiymat tayyor.',
      'Savol "necha foizga" deb so\u2018rasa: (o\u2018zgarish / boshlang\u2018ich qiymat) \u00d7 100.',
    ],
    answer: null,
  },
  {
    topic: 'Uchburchak maydoni',
    keywords: ['uchburchak', 'maydoni', 'poydevor', 'balandlik', 'heron', 'pisqacha'],
    steps: [
      'Uchburchak turi qaysi: to\u2018g\u2018ri burchakmi, teng tomonlimi, umumiyimi?',
      'To\u2018g\u2018ri burchakli: maydon = (katet \u00d7 katet) / 2.',
      'Umumiy holda: maydon = (poydevor \u00d7 balandlik) / 2.',
      'Balandlik berilmagan bo\u2018lsa, kosinus teoremasi yoki Pisqicha teoremasi bilan toping.',
      'Hisobni yakunlab, o\u2018lcham birligini tekshiring (kv.birlik).',
    ],
    answer: 'S = (a \u00d7 h) / 2',
  },
  {
    topic: 'Ohm qonuni (elektr)',
    keywords: ['ohm', 'qonuni', 'kuchlanish', 'tok', 'qarshilik', 'volt', 'amper', 'oom', 'elektr'],
    steps: [
      'Uchta kattalikni belgilang: U (kuchlanish, V), I (tok, A), R (qarshilik, \u03a9).',
      'Asosiy formulasini yozing: U = I \u00d7 R.',
      'Qaysi kattalik so\u2018ralganini aniqlang va formulani o\u2018zgartiring: I = U/R, R = U/I.',
      'Barcha o\u2018lchamlarni birlashtiring (V, A, \u03a9).',
      'Hisobni qiyosiy tekshiring: qarshilik oshsa, tok kamayadi \u2014 natija mantiqan to\u2018g\u2018rimi?',
    ],
    answer: 'U = I \u00d7 R',
  },
  {
    topic: 'Tezlik masalalari',
    keywords: ['tezlik', 'masofa', 'vaqt', 'km/soat', 'm/s', 'poyezd', 'avtomobil', 'yugur'],
    steps: [
      'Berilganlarni yozing: masofa (s), vaqt (t), tezlik (v) \u2014 qaysi ikkitasi ma\u2018lum?',
      'Asosiy formulani yozing: v = s / t.',
      'Agar tezlik so\u2018ralsa: s = v \u00d7 t; vaqt so\u2018ralsa: t = s / v.',
      'O\u2018lchamlarni birlashtiring: km/soat \u2192 m/s uchun 3.6 ga bo\u2018ling.',
      'Natijani tekshiring: masofa oshsa tezlik ham oshadimi \u2014 mantiq mosmi?',
    ],
    answer: 'v = s / t',
  },
  {
    topic: 'Mol massa (kimyo)',
    keywords: ['mol', 'massa', 'molyar', 'avogadro', '6.02', 'kimyoviy', 'reaksiya', 'element'],
    steps: [
      'Tenglamani muvozanatga keltiring \u2014 har bir element soni teng bo\u2018lsin.',
      'Molyar massani jadvaldan aniqling (g/mol).',
      'Formulani yozing: n = m / M (mol soni = massa / molyar massa).',
      'Stexiometrik koeffitsientlar nisbatini qo\u2018llang: n(A) : n(B) = k(A) : k(B).',
      'Savolga qarab: m = n \u00d7 M yoki V = n \u00d7 22.4 (sharoit 0\u00b0C, 1 atm) bilan yakunlang.',
    ],
    answer: 'n = m / M',
  },
  {
    topic: 'Oksidlanish-qaytarilish',
    keywords: ['oksidlanish', 'qaytarilish', 'oksid', 'qaytargich', 'elektron', 'daraja'],
    steps: [
      'Har bir atomning oksidlanish darajasini belgilang (erkin element = 0).',
      'Qaysi atom darajasi oshgan (oksidlangan), qaysi biri kamaygan (qaytargan)?',
      'Elektronlar yo\u2018qotish va qabul qilish soni teng bo\u2018lishi shart.',
      'Kerak bo\u2018lsa, tenglamaga H\u2082O, H\u207a yoki OH\u207b qo\u2018shib, muvozanatlang.',
      'Yakunda: yig\u2018indi darajalar nolga tengligini tekshiring.',
    ],
    answer: null,
  },
  {
    topic: 'Present Perfect zamon',
    keywords: ['present perfect', 'have+past', 'ingliz', 'zamon', 'have done', 'has done', 'qizil kitob'],
    steps: [
      'Gap hozirgi holat bilan o\u2018tgan natijani bog\u2018laydimi? Demak, Present Perfect.',
      'Formulani yod oling: have/has + V3 (3-shakl).',
      '3-shaklni to\u2018g\u2018ri yozing (done, written, gone \u2014 qoidani eslang).',
      '"Ever", "never", "already", "just", "yet" so\u2018zlari shu zamonga xos.',
      'Past Simple bilan adashtirmang: aniq vaqt (\u2026yili, kecha) bo\u2018lsa Past Simple.',
    ],
    answer: 'have/has + V3',
  },
  {
    topic: 'Tenglikni yechish (algebra)',
    keywords: ['tenglik', 'yeching', 'ildiz', 'x=', 'chiziqli', 'algebra'],
    steps: [
      'Tenglikning bir tomoniga noma\u2018lum, ikkinchisiga sonlarni yig\u2018ing.',
      'Tenglikni saqlagan holda qo\u2018shimchalarni almashtiring (qarshi amal).',
      'Bir xil ifodalarni ixchamlang (birlashtiring).',
      'noma\u2018lumni ajratib oling: x = son.',
      'Topilgan qiymatni tenglikka qayta qo\u2018yib tekshiring.',
    ],
    answer: null,
  },
  {
    topic: 'Kaloriya va issiqlik',
    keywords: ['kaloriya', 'issiqlik', 'suv', 'qizdirish', 'cm', 'temperatura', 'o\u2018tish nuqtasi'],
    steps: [
      'Formula: Q = cm\u0394t (c \u2014 maxsus issiqlik sig\u2018imi).',
      'Massani kg ga, \u0394t ni Kelvin yoki \u00b0C fariga o\u2018ting.',
      'Suv uchun c = 4200 J/(kg\u00b7\u00b0C) \u2014 bu qiymatni qo\u2018ying.',
      'Agar fazaviy o\u2018zgarish bo\u2018lsa: Q = \u03bbm (\u03bb \u2014 o\u2018tish issiqligi).',
      'Yig\u2018indi issiqlikni qo\u2018shib, natijani tekshiring.',
    ],
    answer: 'Q = cm\u0394t',
  },
];
