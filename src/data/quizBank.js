/**
 * AI Test Generator (AiQuizGenerator) uchun savollar bazasi.
 * Har bir savol: { q, options[], answer (index), difficulty: 'easy'|'medium'|'hard', explain }
 */

export const DIFFICULTIES = [
  { id: 'easy', label: 'Oson', desc: 'Asosiy tushunchalar' },
  { id: 'medium', label: "O'rta", desc: 'Formula va mantiq talab qiladi' },
  { id: 'hard', label: 'Murakkab', desc: 'Chuqur tahlil va bog\u2018ish' },
];

export const QUIZ_BANK = {
  Matematika: {
    easy: [
      { q: 'Tenglamani yeching: 2x + 6 = 14', options: ['x = 2', 'x = 4', 'x = 8', 'x = 10'], answer: 1, explain: '2x = 14 \u2212 6 = 8, demak x = 8 / 2 = 4.' },
      { q: '3 chiziqli sonning 25% qancha?', options: ['0.5', '0.75', '0.25', '1.5'], answer: 1, explain: '3 \u00d7 0.25 = 0.75.' },
      { q: 'Ichki burchaklari yig\u2018indisi necha gradus?', options: ['90\u00b0', '180\u00b0', '270\u00b0', '360\u00b0'], answer: 1, explain: 'Har qanday uchburchakda ichki burchaklar yig\u2018indisi 180\u00b0.' },
      { q: "\u221a49 + \u221a16 = ?", options: ['9', '10', '11', '13'], answer: 2, explain: '7 + 4 = 11.' },
    ],
    medium: [
      { q: 'Kvadrat tenglama: x\u00b2 \u2212 5x + 6 = 0. Ildizlar qanday?', options: ['1 va 4', '2 va 3', '\u22122 va \u22123', '0 va 5'], answer: 1, explain: 'D = 25 \u2212 24 = 1; x = (5 \u00b1 1)/2 \u2192 x\u2081 = 3, x\u2082 = 2.' },
      { q: 'Arifmetik progressiyada a\u2081 = 2, d = 3 bo\u2018lsa, a\u2087 necha?', options: ['17', '18', '20', '23'], answer: 2, explain: 'a\u2087 = a\u2081 + 6d = 2 + 18 = 20.' },
      { q: 'log\u2082 32 ning qiymati nechaga teng?', options: ['4', '5', '16', '32'], answer: 1, explain: '2\u2075 = 32, demak log\u2082 32 = 5.' },
      { q: 'Ikkita sonning koppliklari 12 va 18 bo\u2018lsa, ularning eng katta umumiy bo\u2018uvchisi?', options: ['6', '9', '18', '36'], answer: 0, explain: '12 = 2\u00b2\u00b73, 18 = 2\u00b73\u00b2 \u2192 EKUB = 2\u00b73 = 6.' },
    ],
    hard: [
      { q: 'Kvadrat tenglama x\u00b2 + 2x + 5 = 0 diskriminantini hisoblang.', options: ['D = 16', 'D = 4', 'D = \u221216', 'D = 24'], answer: 2, explain: 'D = b\u00b2 \u2212 4ac = 4 \u2212 20 = \u221216 \u2014 haqiqiy ildiz yo\u2018q.' },
      { q: 'sum\u2086 (2k+1) ifodaning qiymati necha? (k = 1 dan 6 gacha)', options: ['36', '42', '48', '54'], answer: 1, explain: '1+3+5+7+9+11 = 42.' },
      { q: 'sin 30\u00b0 + cos 60\u00b0 ning qiymati?', options: ['0.5', '1', '\u221a3/2', '2'], answer: 1, explain: '0.5 + 0.5 = 1.' },
    ],
  },
  Fizika: {
    easy: [
      { q: 'Kuchlanish birligi qaysi?', options: ['Amper', 'Vatt', 'Volt', 'Om'], answer: 2, explain: 'Kuchlanish Volt (V) da o\u2018lchanadi.' },
      { q: 'Tezlik formulasini toping.', options: ['v = s\u00b7t', 'v = s/t', 'v = t/s', 'v = s+t'], answer: 1, explain: 'Tezlik = masofa / vaqt.' },
      { q: 'Erkin tushish tezligi taxminan necha m/s\u00b2?', options: ['4.9', '8.9', '9.8', '12.6'], answer: 2, explain: 'Yer yaqinida g \u2248 9.8 m/s\u00b2.' },
    ],
    medium: [
      { q: '4 \u03a9 qarshilikdan 12 V kuchlanish oqsa, tok kuchi qancha?', options: ['2 A', '3 A', '4 A', '48 A'], answer: 1, explain: 'I = U/R = 12/4 = 3 A.' },
      { q: '2 kg massali jism 10 m/s tezlik bilan yugursa, uning kinetik energiyasi qancha?', options: ['50 J', '100 J', '200 J', '400 J'], answer: 1, explain: 'Ek = mv\u00b2/2 = 2 \u00b7 10\u00b2 / 2 = 100 J.' },
      { q: '1 kg suv 20\u00b0C dan 30\u00b0C gacha qizdisa, qabul qilgan issiqligi qancha? (c = 4200 J/kg\u00b7\u00b0C)', options: ['4 200 J', '42 000 J', '420 000 J', '4 200 000 J'], answer: 1, explain: 'Q = cm\u0394t = 4200 \u00b7 1 \u00b7 10 = 42 000 J.' },
    ],
    hard: [
      { q: 'Elektr stansiyasi 100 kW tok ishlab chiqarsa, 2 soatda nechta energiya beradi?', options: ['100 kWh', '200 kWh', '500 kWh', '2000 kWh'], answer: 1, explain: 'W = P\u00b7t = 100 kW \u00b7 2 soat = 200 kWh.' },
      { q: 'Kuch va masofa berilganda ish formulasini tanlang.', options: ['A = F/s', 'A = F\u00b7s', 'A = s/F', 'A = F+t'], answer: 1, explain: 'Ish (A) = kuch (F) \u00d7 masofa (s).' },
    ],
  },
  Kimyo: {
    easy: [
      { q: 'Suvning kimyoviy formulasi qanday?', options: ['CO\u2082', 'H\u2082O', 'O\u2082', 'NaCl'], answer: 1, explain: 'Suv \u2014 H\u2082O (2 vodorod + 1 kislorod).' },
      { q: 'Kimyoviy elementning eng kichik bo\u2018limi nima?', options: ['Molekula', 'Atom', 'Ion', 'Elektron'], answer: 1, explain: 'Atom \u2014 elementning kimyoviy xossalarni saqlovchi eng kichik bo\u2018limi.' },
      { q: 'Davriy jadvalda oltin qaysi guruhda?', options: ['Galogenlar', 'O\u2018tish metallari', 'Asosiy metallar', 'Nodir gazlar'], answer: 1, explain: 'Oltin (Au) \u2014 o\u2018tish metallari guruhi.' },
    ],
    medium: [
      { q: 'Bir mol gazning sharoit 0\u00b0C, 1 atm da hajmi qancha?', options: ['11.2 L', '22.4 L', '2.24 L', '224 L'], answer: 1, explain: 'Mol hajmi (STT) \u2014 22.4 L/mol.' },
      { q: 'pH qiymati 3 bo\u2018lgan eritma qanday?', options: ['Asoslar', 'Kislota', 'Neytral', 'Tuz'], answer: 1, explain: 'pH < 7 \u2014 kislotali muhit.' },
      { q: 'Vodorodning atom massasi taxminan necha?', options: ['1', '8', '12', '16'], answer: 0, explain: 'Ar = 1.008 \u2248 1.' },
    ],
    hard: [
      { q: 'NaOH + HCl \u2192 ? (mahsulotlarni yozing)', options: ['NaCl + H\u2082O', 'NaO + HCl', 'NaH + Cl\u2082O', 'NaCl + H\u2082'], answer: 0, explain: 'Kislota + asos \u2192 tuz + suv (neytrallanish).' },
      { q: '2 mol O\u2082 da nechta molekula bor? (N\u1d04 = 6\u00b710\u00b2\u00b3)', options: ['6\u00b710\u00b2\u00b3', '12\u00b710\u00b2\u00b3', '24\u00b710\u00b2\u00b3', '3\u00b710\u00b2\u00b3'], answer: 1, explain: 'N = n\u00b7N\u1d04 = 2 \u00b7 6\u00b710\u00b2\u00b3.' },
    ],
  },
  Biologiya: {
    easy: [
      { q: 'Hujjatning "energiya stansiyasi" qaysi organoid?', options: ['Yadro', 'Ribosoma', 'Mitoxondriya', 'Vakuola'], answer: 2, explain: 'Mitoxondriyada ATP energiyasi ishlab chiqariladi.' },
      { q: 'Fotosintez qaysi organoidda kechadi?', options: ['Xloroplast', 'Lizosoma', 'Yadro', 'Ribosoma'], answer: 0, explain: 'Xloroplast \u2014 xlorofil pigmenti fotosintez uchun javobgar.' },
      { q: 'Insonda qon guruhlari nechta turga bo\u2018linadi?', options: ['2', '3', '4', '6'], answer: 2, explain: '0, A, B, AB \u2014 4 ta asosiy guruh.' },
    ],
    medium: [
      { q: 'Genetikada "men del" qonuni kim tomonidan kashf etilgan?', options: ['Darvin', 'Mendel', 'Vatson', 'Pavlov'], answer: 1, explain: 'Gregor Mendel \u2014 irsiyat fanining asoschisi.' },
      { q: 'DNK ning spiral qismi nima deyiladi?', options: ['Peptid', 'Nukleotid', 'Gelix', 'Polipeptid'], answer: 2, explain: 'DNK ikki spiral zanjirli qurilishga ega (gelix).' },
    ],
    hard: [
      { q: 'Mendel qonunlariga ko\u2018ra Aa \u00d7 Aa kesishuvida "a" allel homozigot nisbati qancha?', options: ['1/2', '1/3', '1/4', '2/3'], answer: 2, explain: 'AA : Aa : aa = 1 : 2 : 1 \u2192 aa = 1/4.' },
      { q: 'Fermentlar asosan qaysi moddalardan iborat?', options: ['Lipidlar', 'Oqsillar', 'Uglevodlar', 'Nuklein kislotalar'], answer: 1, explain: 'Fermentlar \u2014 katalizator ro\u2018lidagi oqsillar.' },
    ],
  },
  'Ingliz tili': {
    easy: [
      { q: 'Choose the correct: She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], answer: 1, explain: 'Uchinchi shaxs, odatdagi vaqt: goes.' },
      { q: 'What is the plural of "child"?', options: ['childs', 'childes', 'children', 'childrens'], answer: 2, explain: 'Noto\u2018g\u2018ri qoidali ko\u2018plik: children.' },
      { q: '"Beautiful" so\u2018zining ma\u2018nosi qanday?', options: ['Chiroyli', 'Katta', 'Tez', 'Sekin'], answer: 0, explain: 'Beautiful \u2014 chiroyli, go\u2018zal.' },
    ],
    medium: [
      { q: 'Present Perfect: I ___ my homework already.', options: ['did', 'have done', 'do', 'am doing'], answer: 1, explain: 'have/has + V3 \u2014 Present Perfect.' },
      { q: 'Choose: If it ___ tomorrow, we will stay home.', options: ['rains', 'rained', 'will rain', 'raining'], answer: 0, explain: 'First Conditional: If + Present Simple, will + V1.' },
    ],
    hard: [
      { q: '"Had been waiting" \u2014 qaysi zamon?', options: ['Past Simple', 'Past Perfect Continuous', 'Future Continuous', 'Present Continuous'], answer: 1, explain: 'had + been + V-ing \u2014 Past Perfect Continuous.' },
      { q: 'Choose correct: He spoke as if he ___ everything.', options: ['knows', 'knew', 'has known', 'will know'], answer: 1, explain: 'Kontraktiv qoida: as if bilan Past Simple (knew).' },
    ],
  },
  'Dasturlash (IT)': {
    easy: [
      { q: 'HTML nima uchun ishlatiladi?', options: ['Ma\u2018lumotlar bazasi uchun', 'Sahifa tuzilishi uchun', 'Server uchun', 'Grafika uchun'], answer: 1, explain: 'HTML \u2014 veb-sahifaning tuzilishini belgilaydi.' },
      { q: 'const nima anglatadi (JavaScript)?', options: ["O'zgarmas qiymat", "O'zgaruvchan", "Funksiya", "Klass"], answer: 0, explain: 'const \u2014 qayta tayinlanmaydigan (o\u2018zgarmas) qiymat.' },
      { q: '1 byte nechta bitdan iborat?', options: ['4', '8', '16', '32'], answer: 1, explain: '1 byte = 8 bit.' },
    ],
    medium: [
      { q: '[1,2,3].map(x => x*2) natijasi nima?', options: ['[1,2,3]', '[2,4,6]', '[3,4,5]', '6'], answer: 1, explain: 'map har bir elementni ko\u2018paytiradi: [2, 4, 6].' },
      { q: 'CSS da "backdrop-filter: blur" nima qiladi?', options: ['Elementni blur qiladi', 'Orqa fonni blur qiladi', 'Shriftni o\u2018zgartiradi', 'Animatsiya qo\u2018shadi'], answer: 1, explain: 'Element ortidagi fon gaussian blur bo\u2018ladi (glassmorphism!).' },
    ],
    hard: [
      { q: 'Big-O notation: binary search murakkabligi qancha?', options: ['O(n)', 'O(n\u00b2)', 'O(log n)', 'O(1)'], answer: 2, explain: 'Har qadamda qidiruv maydoni yarmiga kamayadi \u2192 O(log n).' },
      { q: 'React da "key" prop nima uchun kerak?', options: ['Uchun stil uchun', 'Elementlarni identifikatsiya qilish uchun', 'Tezlik uchun', 'Xavfsizlik uchun'], answer: 1, explain: 'Key React ga ro\u2018yxatdagi har bir elementni tanib olish imkonini beradi.' },
    ],
  },
};

/** Mavzu bo\u2018yicha savol tayyorlash: fan nomi mos kelsa bankdan, aks holda generativ shablon. */
export function pickQuestions(topic, difficulty) {
  const bank = QUIZ_BANK[topic];
  if (bank) {
    const main = bank[difficulty] || [];
    const others = Object.values(bank).flat().filter((q) => !main.includes(q));
    const shuffled = [...main].sort(() => Math.random() - 0.5);
    const filler = [...others].sort(() => Math.random() - 0.5).slice(0, Math.max(0, 5 - shuffled.length));
    return [...shuffled, ...filler].slice(0, 5).map((q) => ({ ...q, source: topic }));
  }

  // Fan bazada yo\u2018q — mavzu nomi bilan generativ savollar (demo AI rejim)
  const t = topic.trim() || 'Mavzu';
  const generic = [
    { q: `\u00ab${t}\u00bb mavzusining asosiy tushunchasi nimani anglatadi?`, options: ['Uni aniq ta\u2019riflash qobiliyati', 'Faqat misol keltirish', 'Uni eslab qolish', 'Umuman bilmayman'], answer: 0, explain: `Tushunchani o\u2018z so\u2018zlaringiz bilan ta\u2019riflash \u2014 «${t}» ni egallaganingizni bildiradi.` },
    { q: `\u00ab${t}\u00bb mavzusini o\u2018rganishda qaysi usul samarali?`, options: ['Faqat yodlash', 'Nazariya + amaliyot + takrorlash', 'Faqat o\u2018qish', 'Hech qanday usul'], answer: 1, explain: 'Nazariyani amaliy misollar bilan mustahkamlash chuqur o\u2018zlashtirish beradi.' },
    { q: `\u00ab${t}\u00bb bo\u2018yicha topilgan xatodan nima o\u2018rganish mumkin?`, options: ['Hech narsa', 'Zaif tomonni aniqlash va tuzatish', 'Faqat bahoni pasaytirish', 'Vazifani bekor qilish'], answer: 1, explain: 'Xato \u2014 eng yaxshi o\u2018qituvchi: zaif joyingizni ko\u2018rsatadi.' },
    { q: `\u00ab${t}\u00bb mavzusini mustaqil chuqurro\u2018q o\u2018rganish uchun nima qilish kerak?`, options: ['Qo\u2018shimcha manbalar va masalalar bilan mashq qilish', 'Bir marta o\u2018qish', 'Do\u2018stlardan so\u2018rash', 'Taqdimotga qarash'], answer: 0, explain: 'Qo\u2018shimcha manbalar va ko\u2018p mashq \u2014 chuqurlik kaliti.' },
    { q: `\u00ab${t}\u00bb mavzusini kim uchun qo\u2018llash mumkin?`, options: ['Faqat o\u2018qituvchilar uchun', 'O\u2018quvchi/talaba va amaliyotchilar uchun', 'Hech kim uchun', 'Faqot dasturchilar uchun'], answer: 1, explain: `«${t}» \u2014 amaliy qobiliyat beruvchi universal mavzu.` },
  ];
  return generic.sort(() => Math.random() - 0.5).slice(0, 5).map((q) => ({ ...q, source: t }));
}
