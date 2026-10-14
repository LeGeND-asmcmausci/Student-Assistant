import { useState } from 'react';
import { ClipboardCopy, Check, Download, FileText, Sparkles, Trash2 } from 'lucide-react';
import Section from './ui/Section.jsx';
import { summarize, loadState, saveState } from '../lib/ai.js';

const STORAGE_KEY = 'sa_summarizer_text';

/** Matnni TXT fayl sifatida yuklab oladi. */
function downloadTxt(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Natijani print-dialog orqali PDF saqlash uchun ochadi. */
function downloadPdf(title, takeaways, summary) {
  const win = window.open('', '_blank', 'width=820,height=1000');
  if (!win) return;
  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  win.document.write(`<!doctype html><html lang="uz"><head><meta charset="utf-8">
  <title>${esc(title)}</title>
  <style>
    body{font-family:Georgia,serif;max-width:720px;margin:48px auto;color:#111;line-height:1.7;padding:0 24px}
    h1{font-size:22px;border-bottom:2px solid #111;padding-bottom:8px}
    h2{font-size:16px;margin-top:28px}
    li{margin-bottom:10px}
    footer{margin-top:40px;font-size:11px;color:#777;border-top:1px solid #ddd;padding-top:8px}
    @media print{body{margin:24px auto}}
  </style></head><body>
  <h1>${esc(title)}</h1>
  <h2>Asosiy fikrlar (Key Takeaways)</h2>
  <ol>${takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
  <h2>Qisqa konspekt</h2>
  <p>${esc(summary)}</p>
  <footer>Student Assistant — AI Konspekt Qisqartiruvchi · ${new Date().toLocaleDateString('uz-UZ')}</footer>
  <script>window.onload = () => { window.print(); }<\/script>
  </body></html>`);
  win.document.close();
}

const SAMPLE =
  'Zamonaviy ta\u2019lim tizimida raqamli texnologiyalar muhim o\u2018rin egallaydi. ' +
  'Elektron darsliklar va onlayn laboratoriyalar o\u2018quv jarayonini qulaylashtiradi, ' +
  'shuningdek har bir talabaning o\u2018z tezligida o\u2018rganish imkonini beradi. ' +
  'Biroq texnologiyalarga haddan tashqari qaramlik jiddiy muammo bo\u2018lishi mumkin. ' +
  'Shuning uchun o\u2018qituvchilar pedagogik mahorat bilan raqamli vositalarni qo\u2018llashi kerak. ' +
  'Tajribalar shuni ko\u2018rsatadiki, aralash (blended) ta\u2019lim usuli eng samarali hisoblanadi. ' +
  'U nazariy bilimni amaliyot bilan uyg\u2018unlashtiradi va o\u2018quvchida mustaqil fikrlashni rivojlantiradi. ' +
  'Kelajakda sun\u2018iy intellekt dars rejalarini shaxsiylashtirishda yordam beradi.';

export default function AiSummarizer() {
  const [text, setText] = useState(() => loadState(STORAGE_KEY, ''));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleChange(v) {
    setText(v);
    saveState(STORAGE_KEY, v);
  }

  function handleAnalyze() {
    if (text.trim().length < 40) {
      alert('Iltimos, kamida 40 ta belgidan iborat matn kiriting.');
      return;
    }
    setLoading(true);
    setResult(null);
    // "AI tahlili" uchun qisqa simulyatsiya kechikishi
    setTimeout(() => {
      setResult(summarize(text, 5));
      setLoading(false);
    }, 700);
  }

  async function handleCopy() {
    if (!result) return;
    const payload =
      'Asosiy fikrlar:\n' +
      result.takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n') +
      '\n\nQisqa konspekt:\n' +
      result.summary;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback: eski usul
      const ta = document.createElement('textarea');
      ta.value = payload;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <Section
      id="summarizer"
      number="01"
      icon={FileText}
      title="AI Konspekt va Qisqartiruvchi"
      subtitle="Darslik matnini yoki maqolani joylang — AI eng muhim 5 ta asosiy fikrni ajratib, qisqa konspekt tuzib beradi."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kiritish paneli */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="sum-input"
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
            id="sum-input"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            rows={12}
            placeholder="Bu yerga darslik matnini, maqolani yoki seminar mavzusini joylang…"
            className="w-full resize-y rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-[13px] leading-relaxed text-slate-200 backdrop-blur-xl transition-colors focus:border-cyan-400/50 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono">
              {text.trim() ? text.trim().split(/\s+/).length : 0} so'z ·{' '}
              {text.length} belgi
            </span>
            <span>Matn faqat brauzeringizda saqlanadi</span>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_28px_-8px_rgba(6,182,212,0.8)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Tahlil qilinmoqda…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                AI tahlil qilish
              </>
            )}
          </button>
        </div>

        {/* Natija */}
        <div className="flex flex-col">
          <div className="mb-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
            AI natijasi
          </div>
          {!result && !loading && (
            <div className="glass flex flex-1 flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
              <Sparkles className="h-8 w-8 text-slate-600" aria-hidden="true" />
              <p className="max-w-xs text-sm text-slate-500">
                Matnni kiriting va «AI tahlil qilish» tugmasini bosing — asosiy
                fikrlar shu yerda paydo bo'ladi.
              </p>
            </div>
          )}
          {loading && (
            <div className="glass flex flex-1 flex-col items-center justify-center gap-3 p-8">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-typing-dot"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-400">Matn tahlil qilinmoqda…</p>
            </div>
          )}
          {result && !loading && (
            <div className="animate-fade-up space-y-4">
              {/* Statistika */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['So\u2018zlar', result.stats.words],
                  ['Gaplar', result.stats.sentences],
                  ['O\u2018qish', `${result.stats.readingMinutes} daq`],
                  ['Siqish', `${result.stats.compression}%`],
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

              {/* Asosiy fikrlar */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles className="h-4 w-4 text-purple-300" aria-hidden="true" />
                  Asosiy fikrlar (Key Takeaways)
                </h3>
                <ol className="space-y-2.5">
                  {result.takeaways.map((t, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cyan-400/15 font-mono text-[11px] font-bold text-cyan-300">
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Qisqa konspekt */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-2 text-sm font-bold text-white">Qisqa konspekt</h3>
                <p className="text-[13px] leading-relaxed text-slate-300">{result.summary}</p>
              </div>

              {/* Kalit so'zlar */}
              {result.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.map((k) => (
                    <span
                      key={k.word}
                      className="rounded-full border border-purple-400/25 bg-purple-400/10 px-2.5 py-1 font-mono text-[11px] text-purple-200"
                      title={`${k.count} marta uchradi`}
                    >
                      {k.word}
                      <span className="ml-1 text-purple-400">{k.count}</span>
                    </span>
                  ))}
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
                  onClick={() =>
                    downloadTxt(
                      'konspekt.txt',
                      'Asosiy fikrlar:\n' +
                        result.takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n') +
                        '\n\nQisqa konspekt:\n' +
                        result.summary,
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/40 hover:text-cyan-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  TXT yuklab olish
                </button>
                <button
                  onClick={() => downloadPdf('AI Konspekt', result.takeaways, result.summary)}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition-colors hover:border-emerald-400/50"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF saqlash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
