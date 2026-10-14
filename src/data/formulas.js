/**
 * Formulalar ma\u2018lumotnomasi (FormulaCheatSheet).
 * Har bir yozuv: { name, formula, note }
 */

export const FORMULA_GROUPS = [
  {
    id: 'math',
    label: 'Matematika',
    color: 'cyan',
    items: [
      { name: 'Kvadrat tenglama ildizlari', formula: 'x = (\u2212b \u00b1 \u221a(b\u00b2 \u2212 4ac)) / 2a', note: 'D = b\u00b2 \u2212 4ac \u2014 diskriminant' },
      { name: 'Teorema: Pythagor', formula: 'a\u00b2 + b\u00b2 = c\u00b2', note: 'Faqat to\u2018g\u2018ri burchakli uchburchakda' },
      { name: 'Uchburchak maydoni', formula: 'S = (a \u00b7 h) / 2', note: 'a \u2014 poydevor, h \u2014 balandlik' },
      { name: 'Aylana perimetri va maydoni', formula: 'P = 2\u03c0r,  S = \u03c0r\u00b2', note: 'd = 2r \u2014 diametr' },
      { name: 'Foiz hisobi', formula: 'X = (A \u00b7 p) / 100', note: 'Yangi qiymat: A + X' },
      { name: 'Arifmetik progressiya', formula: 'a\u2099 = a\u2081 + (n \u2212 1)d', note: 'S\u2099 = n(a\u2081 + a\u2099) / 2' },
      { name: 'Geometrik progressiya', formula: 'b\u2099 = b\u2081 \\u00b7 q\u207f\u2212\u00b9', note: 'S\u2099 = b\u2081(q\u207f \u2212 1)/(q \u2212 1)' },
      { name: 'Iksit va kvadrat ildiz', formula: '\u207f\u221ax = x^(1/n),  \u221ax = x^(1/2)', note: 'Umumiy qoida: x^(m/n)' },
      { name: 'Logarifm qoidalari', formula: 'log(ab) = log a + log b', note: 'log(a/b) = log a \u2212 log b' },
      { name: 'Binom formulasi', formula: '(a + b)^n = \u03a3 C(n,k)\u00b7a^(n\u2212k)\u00b7b^k', note: 'Newton binomi' },
    ],
  },
  {
    id: 'physics',
    label: 'Fizika',
    color: 'purple',
    items: [
      { name: 'Tezlik', formula: 'v = s / t', note: 'm/s \u2014 SI birligi' },
      { name: 'Tezlanish', formula: 'a = (v \u2212 v\u2080) / t', note: 'm/s\u00b2' },
      { name: 'Erkin tushish', formula: 'h = gt\u00b2 / 2,  g \u2248 9.8 m/s\u00b2', note: 'Boshlang\u2018ich tezlik 0 bo\u2018lsa' },
      { name: 'Kinetik energiya', formula: 'E\u2096 = mv\u00b2 / 2', note: 'Joule (J)' },
      { name: 'Potensial energiya', formula: 'E\u1d64 = mgh', note: 'Yer yaqinida' },
      { name: 'Ish (mexanika)', formula: 'A = F \u00b7 s \u00b7 cos\u03b1', note: 'F \u2014 kuch, s \u2014 masofa' },
      { name: 'Ohm qonuni', formula: 'U = I \u00b7 R', note: 'U (V), I (A), R (\u03a9)' },
      { name: 'Elektr energiyasi', formula: 'W = P \u00b7 t', note: 'P = UI, 1 kWh = 3.6 MJ' },
      { name: 'Issiqlik miqdori', formula: 'Q = cm\u0394t', note: 'Suv uchun c = 4200 J/kg\u00b7\u00b0C' },
      { name: 'Fazo ishi (gas)', formula: 'pV = \u03bdRT (idealgaz)', note: '\u03bd \u2014 mol soni, R = 8.31' },
    ],
  },
  {
    id: 'chemistry',
    label: 'Kimyo',
    color: 'emerald',
    items: [
      { name: 'Mol soni', formula: 'n = m / M', note: 'm \u2014 massa (g), M \u2014 molyar massa' },
      { name: 'Mol hajmi (sharoit 0\u00b0C, 1 atm)', formula: 'V = n \u00b7 22.4 L', note: 'Bir mol gaz hajmi' },
      { name: 'Konsentratsiya', formula: 'C = n / V', note: 'mol/L (molar)' },
      { name: 'Tenglama muvozanati', formula: '\u03a3N(\u0410)reakt = \u03a3N(\u0410)mahsul', note: 'Har bir element teng' },
      { name: 'Massa ulushi', formula: '\u03c9(A) = m(A) / m(eritma)', note: '0 dan 1 gacha' },
      { name: 'Ideal gaz qonuni', formula: 'pV = nRT', note: 'R = 8.31 J/(mol\u00b7K)' },
      { name: 'pH hisobi', formula: 'pH = \u2212log[H\u207a]', note: 'pH < 7 kislota, > 7 asos' },
      { name: 'Oksidlanish darajasi', formula: '\u03a3 darajalar = zaryad', note: 'Ion zaryadiga teng' },
    ],
  },
];
