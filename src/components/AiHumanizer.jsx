import { useState } from 'react';
import { Check, ClipboardCopy, Eraser, Feather, Sparkles, Trash2, Wand2 } from 'lucide-react';
import Section from './ui/Section.jsx';
import { humanizeText, loadState, saveState } from '../lib/ai.js';

const STORAGE_KEY = 'sa_humanizer_text';

const INTENSITIES = [
  { id: 'light', label: 'Yengil', hint: 'Faqat eng ko\'p uchraydigan qoliplarni olib tashlaydi' },
  { id: 'medium', label: "O'rta", hint: 'Qolip so\'zlar + tabiiy variant tanlovi + ritm' },
  { id: 'strong', label: 'Kuchli', hint: 'To\'liq qayta yozish uslubi, uzun gaplar bo\'linadi' },
];

/** Namuna: sun'iy intellekt uslubidagi quruq, qoliplarga to'la matn. */
const SAMPLE =
  "Zamonaviy dunyoda raqamli texnologiyalar muhim ahamiyatga ega. " +
  "Shuni ta'kidlash joizki, ular ta'lim jarayonini tubdan o'zgartirmoqda. " +
  "Bundan tashqari, ushbu texnologiyalar o'quvchilarning imkonini beradi. " +
  "Ta'kidlash kerakki, raqamli vositalar keng qamrovli imkoniyatlar yaratadi. " +
  "Xulosa qilib aytganda, texnologiyalarni qo'llash juda muhim hisoblanadi.";

export default function AiHumanizer() {
  const [text, setText] = useState(() => loadState(STORAGE_KEY, ''));
  const [intensity, setIntensity] = useState('medium');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleChange(v) {
    setText(v);
    saveState(STORAGE_KEY, v);
  }

  function handleHumanize() {
    if (text.trim().length < 30) {
      alert("Iltimos, kamida 30 ta belgidan iborat matn kiriting — AI uchun juda qisqa.");
      return;
    }
    setLoading(true);
    setResult(null);
    // "AI qayta yozish" uchun qisqa simulyatsiya kechikishi
    setTimeout(() => {
      setResult(humanizeText(text, { intensity }));
      setLoading(false);
    }, 800);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback: eski usul
      const ta = document.createElement('textarea');
      ta.value = result.text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  const scoreTone =
    result && result.stats.delta > 0
      ? 'text-emerald-300'
      : 'text-slate-400';

  return (
    <Section
      id="humanizer"
      number="10"
      icon={Feather}
      title="AI Text Humanizer"
      subtitle="ChatGPT uslubidagi quruq, qolip matnni joylang — AI uni olib tashlab, oddiy inson yozgandek tirik va ravon uslubga o'girib beradi."
    >
      {/* Terminal-ko'rinishidagi modul indikatori */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0a0a14]/60 px-4 py-2.5 font-mono text-[11px] tracking-wider">
        <span className="text-cyan-300">
          <span className="text-slate-500">$</span> MODULE{' '}
          <span className="font-bold text-cyan-200">10</span>{' '}
          <span className="text-purple-400">//</span>{' '}
          <span className="text-purple-300">AI_HUMANIZER</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          humanize.engine v2 · offline
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kiritish paneli */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="humanizer-input"
              className="text-xs font-semibold tracking-widest text-slate-400 uppercase"
            >
              Matn kiritish
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleChange(SAMPLE)}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-200"
              >
                Namuna
              </button>
              <button
                onClick={() => {
                  handleChange('');
                  setResult(null);
                }}
                aria-label="Matnni tozalash"
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition-colors hover:border-rose-500/40 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            id="humanizer-input"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            rows={11}
            placeholder="Bu yerga AI yozgan quruq matnni, ese yoki xabarni joylang…"
            className="w-full resize-y rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-[13px] leading-relaxed text-slate-200 backdrop-blur-xl transition-colors focus:border-cyan-400/50 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono">
              {text.trim() ? text.trim().split(/\s+/).length : 0} so'z ·{' '}
              {text.length} belgi
            </span>
            <span>Matn faqat brauzeringizda saqlanadi</span>
          </div>

          {/* Qayta yozish kuchi */}
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Qayta yozish kuchi
            </div>
            <div className="grid grid-cols-3 gap-2">
              {INTENSITIES.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setIntensity(lvl.id)}
                  title={lvl.hint}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    intensity === lvl.id
                      ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              {INTENSITIES.find((l) => l.id === intensity)?.hint}
            </p>
          </div>

          <button
            onClick={handleHumanize}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_28px_-8px_rgba(168,85,247,0.8)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Qayta yozilmoqda…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" aria-hidden="true" />
                Tabiiy holatga keltirish
              </>
            )}
          </button>
        </div>

        {/* Natija paneli */}
        <div className="flex flex-col">
          <div className="mb-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Tabiiylashtirilgan matn
          </div>

          {!result && !loading && (
            <div className="glass flex flex-1 flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
              <Feather className="h-8 w-8 text-slate-600" aria-hidden="true" />
              <p className="max-w-xs text-sm text-slate-500">
                Matnni kiriting va «Tabiiy holatga keltirish» tugmasini bosing —
                toza, inson yozgandek matn shu yerda paydo bo'ladi.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass flex flex-1 flex-col items-center justify-center gap-3 p-8">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-typing-dot"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-400">Qoliplar olib tashlanmoqda…</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-fade-up space-y-4">
              {/* AIlik oldin / keyin */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                  <p className="font-mono text-lg font-bold text-rose-300">
                    {result.stats.scoreBefore}
                    <span className="text-xs text-slate-500">/100</span>
                  </p>
                  <p className="text-[10px] tracking-wider text-slate-500 uppercase">
                    AIlik — oldin
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-center">
                  <p className="font-mono text-lg font-bold text-emerald-300">
                    {result.stats.scoreAfter}
                    <span className="text-xs text-slate-400">/100</span>
                  </p>
                  <p className="text-[10px] tracking-wider text-slate-400 uppercase">
                    AIlik — keyin
                  </p>
                </div>
              </div>

              {/* Tabiiylashtirilgan matn */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-2 flex items-center justify-between gap-2 text-sm font-bold text-white">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    Natija
                  </span>
                  <span className={`font-mono text-xs font-bold ${scoreTone}`}>
                    {result.stats.delta > 0
                      ? `−${result.stats.delta} AIlik`
                      : 'allaqachon tabiiy'}
                  </span>
                </h3>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-slate-300">
                  {result.text}
                </p>
              </div>

              {/* Statistika */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['Qoliplar', result.stats.clichesRemoved],
                  ['O\'zgartirishlar', result.stats.changes],
                  ['So\'zlar', `${result.stats.wordsBefore}→${result.stats.wordsAfter}`],
                  ['AIlik', `${result.stats.scoreBefore}→${result.stats.scoreAfter}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center"
                  >
                    <p className="font-mono text-lg font-bold text-cyan-300">{value}</p>
                    <p className="text-[10px] tracking-wider text-slate-500 uppercase">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Olib tashlangan qoliplar */}
              {result.changes.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-2.5 text-sm font-bold text-white">
                    Nima o'zgardi
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.changes.map((c, i) => (
                      <span
                        key={`${c.from}-${i}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/25 bg-purple-400/10 px-2.5 py-1 font-mono text-[11px] text-purple-200"
                        title={c.type}
                      >
                        <span className="text-rose-300 line-through decoration-rose-400/60">
                          {c.from}
                        </span>
                        <span className="text-slate-500">→</span>
                        <span className="text-emerald-300">{c.to}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Amallar */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/40 hover:text-cyan-200"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <ClipboardCopy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Nusxalandi' : 'Nusxalash'}
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-rose-500/40 hover:text-rose-300"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Natijani tozalash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
