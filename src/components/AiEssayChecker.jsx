import { useState } from 'react';
import { AlertTriangle, CheckCircle2, PenLine, Sparkles, Trash2 } from 'lucide-react';
import Section from './ui/Section.jsx';
import { analyzeEssay, loadState, saveState } from '../lib/ai.js';

const STORAGE_KEY = 'sa_essay_text';

const SAMPLE_ESSAY =
  'Texnologiya ta\u2019limni tubdan o\u2018zgartirmoqda. Avvalo, elektron darsliklar ' +
  'o\u2018quvchiga istalgan joydan o\u2018rganish imkonini beradi. Biroq faqat texnologiya ' +
  'oz\u2019i yetarli emas. Natijada, o\u2018qituvchi roli yo\u2018qolmaydi, balki maslahatchilikka ' +
  'aylanadi. Masalan, aralash ta\u2019lim usulida onlayn materiallar jonli dars bilan ' +
  'uyg\u2018unlashtiriladi. Shuningdek, shaxsiylashtirilgan o\u2018quv yo\u2018nalishi har bir ' +
  'talabaning ehtiyojiga mos keladi. Xulosa qilib aytganda, muvaffaqiyatli ta\u2019lim ' +
  'uchun texnologiya va pedagogik mahoratni birgalikda qo\u2018llash zarur.';

/** 10 ballik shkala bo'yicha ring (donut) chizish uchun SVG. */
function ScoreRing({ score }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score * 10));
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle
          cx="64" cy="64" r={r}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"
        />
        <circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke="url(#score-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <defs>
          <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-extrabold text-white">{score}</span>
        <span className="text-[10px] tracking-widest text-slate-500 uppercase">/ 10 ball</span>
      </div>
    </div>
  );
}

const SEVERITY_STYLE = {
  high: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  medium: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  low: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
};
const SEVERITY_LABEL = { high: 'Jiddiy', medium: "O'rta", low: 'Yengil' };

export default function AiEssayChecker() {
  const [text, setText] = useState(() => loadState(STORAGE_KEY, ''));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(v) {
    setText(v);
    saveState(STORAGE_KEY, v);
  }

  function handleAnalyze() {
    if (text.trim().length < 30) {
      alert('Iltimos, kamida 30 ta belgidan iborat insho matni kiriting.');
      return;
    }
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(analyzeEssay(text));
      setLoading(false);
    }, 750);
  }

  return (
    <Section
      id="essay"
      number="02"
      icon={PenLine}
      title="AI Insho va Grammatika Tekshiruvchi"
      subtitle="Insho matnini joylang — AI grammatik xatolarni topadi, so‘z boyligi va tuzilish bo‘yicha tavsiya beradi hamda 10 ballik akademik baho chiqaradi."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kiritish */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="essay-input"
              className="text-xs font-semibold tracking-widest text-slate-400 uppercase"
            >
              Insho matni
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleChange(SAMPLE_ESSAY)}
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
            id="essay-input"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            rows={12}
            placeholder={
              'Mavzu: «Raqamli ta\u2019limning zamonaviy o\u2018quv jarayonidagi o\u2018rni»\n\nInsho matningizni shu yerga yozing…'
            }
            className="w-full resize-y rounded-xl border border-white/10 bg-white/5 p-4 text-[13px] leading-relaxed text-slate-200 backdrop-blur-xl transition-colors focus:border-cyan-400/50 focus:outline-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_28px_-8px_rgba(6,182,212,0.8)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Baholanmoqda…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Akademik baholash
              </>
            )}
          </button>
        </div>

        {/* Natija: Academic Score Dashboard */}
        <div>
          <div className="mb-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Academic Score Dashboard
          </div>
          {!result && !loading && (
            <div className="glass flex h-[calc(100%-1.5rem)] flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
              <PenLine className="h-8 w-8 text-slate-600" aria-hidden="true" />
              <p className="max-w-xs text-sm text-slate-500">
                Insho matnini kiriting — ball, tahlil va shaxsiy tavsiyalar shu
                yerda ko'rsatiladi.
              </p>
            </div>
          )}
          {loading && (
            <div className="glass flex h-[calc(100%-1.5rem)] flex-col items-center justify-center gap-3 p-8">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-typing-dot"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-400">Insho tahlil qilinmoqda…</p>
            </div>
          )}
          {result && !loading && (
            <div className="animate-fade-up space-y-4">
              <div className="flex items-center gap-5 rounded-xl border border-white/10 bg-white/5 p-4">
                <ScoreRing score={result.score} />
                <div>
                  <p className="text-lg font-bold text-white">{result.grade}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
                    Ball hajm, struktura, so'z boyligi va grammatika asosida
                    hisoblandi.
                  </p>
                </div>
              </div>

              {/* Metrikalar */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {result.metrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="font-mono text-lg font-bold text-cyan-300">{m.value}</p>
                    <p className="text-[10px] leading-tight tracking-wide text-slate-500 uppercase">
                      {m.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-600">{m.hint}</p>
                  </div>
                ))}
              </div>

              {/* Grammatik ogohlantirishlar */}
              {result.issues.length > 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                    <AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden="true" />
                    Grammatik tahlil ({result.issues.length})
                  </h3>
                  <ul className="space-y-2">
                    {result.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-slate-300">
                        <span
                          className={`mt-0.5 shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${SEVERITY_STYLE[issue.severity]}`}
                        >
                          {SEVERITY_LABEL[issue.severity]}
                        </span>
                        <span>
                          {issue.message}
                          {issue.sample && (
                            <code className="ml-1.5 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-rose-200">
                              {issue.sample}
                            </code>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-[13px] text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Grammatik jihatdan aniqlovchi qoidalar bo'yicha muammo
                  topilmadi.
                </div>
              )}

              {/* Tavsiyalar */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles className="h-4 w-4 text-purple-300" aria-hidden="true" />
                  AI tavsiyalari
                </h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
