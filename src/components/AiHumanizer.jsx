import { useState } from 'react';
import { Activity, Check, ClipboardCopy, Eraser, Feather, Radar, Sparkles, Trash2, Wand2 } from 'lucide-react';
import Section from './ui/Section.jsx';
import { detectAiText, humanizeText, loadState, saveState } from '../lib/ai.js';

const STORAGE_KEY = 'sa_humanizer_text';

const INTENSITIES = [
  { id: 'light', label: 'Yengil', hint: "Faqat eng ko'p uchraydigan qoliplarni olib tashlaydi" },
  { id: 'medium', label: "O'rta", hint: 'Qolip so\'zlar + tabiiy variant tanlovi + ritm' },
  { id: 'strong', label: 'Kuchli', hint: "To'liq sintaksis qayta quriladi: pasiv→faol, ritm, tabiiy savollar" },
];

/** Namuna: sun'iy intellekt uslubidagi quruq, qoliplarga to'la matn. */
const SAMPLE =
  "Zamonaviy dunyoda raqamli texnologiyalar muhim ahamiyatga ega. " +
  "Shuni ta'kidlash joizki, ular ta'lim jarayonini tubdan o'zgartirmoqda. " +
  "Bundan tashqari, ushbu texnologiyalar o'quvchilarning imkonini beradi. " +
  "Ta'kidlash kerakki, raqamli vositalar keng qamrovli imkoniyatlar yaratadi. " +
  "Xulosa qilib aytganda, texnologiyalarni qo'llash juda muhim hisoblanadi.";

const VERDICT = {
  human: { label: 'HUMAN WRITTEN', cls: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300', dot: 'bg-emerald-400' },
  mixed: { label: 'MIXED / AI-ASSISTED', cls: 'border-amber-400/40 bg-amber-400/10 text-amber-300', dot: 'bg-amber-400' },
  ai: { label: 'AI GENERATED', cls: 'border-rose-400/45 bg-rose-500/10 text-rose-300', dot: 'bg-rose-400' },
  short: { label: 'MATN JUDA QISQA', cls: 'border-white/15 bg-white/5 text-slate-400', dot: 'bg-slate-500' },
};

/**
 * ZeroGPT-uslubidagi yarim aylana indikator (SVG):
 * chapdan (HUMAN, neon yashil) o'sadi, qolgan qismi (AI, qizil-sariq) fonga chiqadi.
 */
function SemiGauge({ human, ai }) {
  const R = 66;
  const LEN = Math.PI * R; // yarim aylana uzunligi
  const greenLen = (human / 100) * LEN;
  return (
    <svg
      viewBox="0 0 160 96"
      className="mx-auto w-full max-w-[240px]"
      role="img"
      aria-label={`Human ${human}%, AI ${ai}%`}
    >
      <defs>
        <linearGradient id="humGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
        <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      {/* AI foni (sariq → qizil gradient) */}
      <path
        d="M 14 80 A 66 66 0 0 1 146 80"
        fill="none"
        stroke="url(#aiGrad)"
        strokeOpacity="0.35"
        strokeWidth="13"
        strokeLinecap="round"
      />
      {/* HUMAN oldinga chizig'i (neon yashil) */}
      <path
        d="M 14 80 A 66 66 0 0 1 146 80"
        fill="none"
        stroke="url(#humGrad)"
        strokeWidth="13"
        strokeLinecap="round"
        strokeDasharray={`${greenLen} ${LEN}`}
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
      <text
        x="80"
        y="66"
        textAnchor="middle"
        style={{ fontSize: 27, fontWeight: 800, fill: '#6ee7b7', fontFamily: 'JetBrains Mono, monospace' }}
      >
        {human}%
      </text>
      <text
        x="80"
        y="82"
        textAnchor="middle"
        style={{ fontSize: 9, letterSpacing: 2.5, fill: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}
      >
        HUMAN
      </text>
      {/* Ai foizi burchak ostida */}
      <text
        x="80"
        y="94"
        textAnchor="middle"
        style={{ fontSize: 9.5, letterSpacing: 1.5, fill: '#fb7185', fontFamily: 'JetBrains Mono, monospace' }}
      >
        {ai}% AI
      </text>
    </svg>
  );
}

/** Bar ko'rinishidagi foiz indikatori (neon yashil / qizil-sariq). */
function PercentBar({ label, value, tone }) {
  const isHuman = tone === 'human';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold tracking-widest uppercase">
        <span className={isHuman ? 'text-emerald-300' : 'text-rose-300'}>{label}</span>
        <span className={`font-mono font-bold ${isHuman ? 'text-emerald-300' : 'text-rose-300'}`}>
          {value}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isHuman
              ? 'bg-gradient-to-r from-emerald-500 to-lime-300 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
              : 'bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function AiHumanizer() {
  const [text, setText] = useState(() => loadState(STORAGE_KEY, ''));
  const [intensity, setIntensity] = useState('medium');
  const [result, setResult] = useState(null);
  const [detector, setDetector] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleChange(v) {
    setText(v);
    saveState(STORAGE_KEY, v);
  }

  /** Humanize: qayta yozish + avtomatik ZeroGPT tekshiruvi (Auto-Check). */
  function handleHumanize() {
    if (text.trim().length < 30) {
      alert("Iltimos, kamida 30 ta belgidan iborat matn kiriting — AI uchun juda qisqa.");
      return;
    }
    setLoading(true);
    setResult(null);
    setDetector(null);
    setTimeout(() => {
      const res = humanizeText(text, { intensity });
      setResult(res);
      // Auto-Check: qayta yozilgan matnni darhol tekshirish
      setDetector({ source: 'output', ...detectAiText(res.text) });
      setLoading(false);
    }, 800);
  }

  /** Re-Check: qayta yozmasdan, faqat kiritilgan matnni tekshirish. */
  function handleReCheck() {
    if (text.trim().length < 30) {
      alert("Tekshirish uchun kamida 30 ta belgi kiriting.");
      return;
    }
    setChecking(true);
    setDetector(null);
    setTimeout(() => {
      setDetector({ source: 'input', ...detectAiText(text) });
      setChecking(false);
    }, 500);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
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
    result && result.stats.delta > 0 ? 'text-emerald-300' : 'text-slate-400';

  const verdict = detector ? VERDICT[detector.verdict] : null;

  return (
    <Section
      id="humanizer"
      number="10"
      icon={Feather}
      title="AI Text Humanizer"
      subtitle="ChatGPT uslubidagi quruq, qolip matnni joylang — AI uni olib tashlab, oddiy inson yozgandek tirik va ravon uslubga o'girib beradi. Har bir qayta yozish ZeroGPT algoritmi bo'yicha avtomatik tekshiriladi."
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
          humanize.engine v4 · burstiness ruleset
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
                  setDetector(null);
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

          {/* Asosiy amallar: Humanize + Re-Check */}
          <div className="mt-4 grid gap-2">
            <button
              onClick={handleHumanize}
              disabled={loading || checking}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_28px_-8px_rgba(168,85,247,0.8)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Qayta yozilmoqda va tekshirilmoqda…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" aria-hidden="true" />
                  Tabiiy holatga keltirish
                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-mono">
                    + auto-check
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleReCheck}
              disabled={loading || checking}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-6 py-2.5 text-xs font-bold tracking-wider text-emerald-300 uppercase transition-all hover:border-emerald-400/60 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300/30 border-t-emerald-300" />
                  Tekshirilmoqda…
                </>
              ) : (
                <>
                  <Radar className="h-4 w-4" aria-hidden="true" />
                  Qayta tekshirish · ZeroGPT
                </>
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-slate-500">
            «Qayta tekshirish» matnni o'zgartirmaydi — faqat AI foizini hisoblaydi.
          </p>
        </div>

        {/* Natija paneli */}
        <div className="flex flex-col">
          <div className="mb-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
            {detector?.source === 'input' && !result
              ? 'AI Detector natijasi'
              : 'Tabiiylashtirilgan matn'}
          </div>

          {!result && !loading && !checking && !detector && (
            <div className="glass flex flex-1 flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
              <Feather className="h-8 w-8 text-slate-600" aria-hidden="true" />
              <p className="max-w-xs text-sm text-slate-500">
                Matnni kiriting va «Tabiiy holatga keltirish» tugmasini bosing —
                qayta yozilgan matn ZeroGPT bo'yicha avtomatik tekshiriladi.
              </p>
            </div>
          )}

          {(loading || checking) && (
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
              <p className="text-sm text-slate-400">
                {checking ? 'ZeroGPT tekshiruvi…' : 'Qoliplar olib tashlanmoqda…'}
              </p>
            </div>
          )}

          {/* AI Detector Dashboard */}
          {detector && !loading && !checking && (
            <div className="animate-fade-up glass mb-4 rounded-xl border border-white/10 p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Activity className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  AI Detector Dashboard
                  <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] font-normal text-slate-500">
                    zerogpt.v1
                  </span>
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider ${verdict.cls}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${verdict.dot} animate-pulse-dot`} />
                  {verdict.label}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr] sm:items-center">
                <SemiGauge human={detector.humanPercent} ai={detector.aiPercent} />
                <div className="space-y-3">
                  <PercentBar label="Human Written" value={detector.humanPercent} tone="human" />
                  <PercentBar label="AI Generated" value={detector.aiPercent} tone="ai" />
                  <p className="font-mono text-[11px] leading-relaxed text-slate-500">
                    {detector.source === 'output'
                      ? `Tekshirilgan: qayta yozilgan matn · ${detector.segments.length} gap`
                      : `Tekshirilgan: kiritilgan matn · ${detector.segments.length} gap · ${detector.segments.filter((s) => s.level !== 'human').length} ta shubhali`}
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap gap-3 border-t border-white/5 pt-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-4 rounded-sm border border-rose-400/50 bg-rose-500/40" />
                  AI belgilari
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-4 rounded-sm border border-amber-400/50 bg-amber-400/35" />
                  Shubhali
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-4 rounded-sm border border-white/15 bg-white/5" />
                  Inson yozgandek
                </span>
              </div>

              {/* Re-Check natijasi: kirish matnini highlight bilan ko'rsatish */}
              {detector.source === 'input' && (
                <div className="mt-4 rounded-xl border border-white/10 bg-[#0a0a14]/50 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-300 uppercase">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                    Tekshirilgan matn
                  </h4>
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-slate-300">
                    {detector.segments.map((seg, i) => (
                      <span
                        key={i}
                        title={`AI ehtimoli: ${seg.score}%`}
                        className={
                          seg.level === 'ai'
                            ? 'rounded-sm bg-rose-500/30 px-0.5 text-rose-100 decoration-rose-400/70 underline decoration-dotted underline-offset-2'
                            : seg.level === 'warn'
                              ? 'rounded-sm bg-amber-400/25 px-0.5 text-amber-100'
                              : ''
                        }
                      >
                        {seg.text}{' '}
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          )}

          {result && !loading && !checking && (
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

              {/* Tabiiylashtirilgan matn — AI belgili gaplar highlight qilingan */}
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
                  {detector?.source === 'output'
                    ? detector.segments.map((seg, i) => (
                        <span
                          key={i}
                          title={`AI ehtimoli: ${seg.score}%`}
                          className={
                            seg.level === 'ai'
                              ? 'rounded-sm bg-rose-500/30 px-0.5 text-rose-100 decoration-rose-400/70 underline decoration-dotted underline-offset-2'
                              : seg.level === 'warn'
                                ? 'rounded-sm bg-amber-400/25 px-0.5 text-amber-100'
                                : ''
                          }
                        >
                          {seg.text}{' '}
                        </span>
                      ))
                    : result.text}
                </p>
              </div>

              {/* Statistika */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  ['Qayta yozilgan', `${result.stats.changePercent}%`],
                  ['Qoliplar', result.stats.clichesRemoved],
                  ["O'zgartirishlar", result.stats.changes],
                  ["So'zlar", `${result.stats.wordsBefore}→${result.stats.wordsAfter}`],
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
                  <h3 className="mb-2.5 text-sm font-bold text-white">Nima o'zgardi</h3>
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
                  onClick={() => {
                    setResult(null);
                    setDetector(null);
                  }}
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
