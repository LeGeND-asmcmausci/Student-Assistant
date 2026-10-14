import { useMemo, useState } from 'react';
import { Check, ClipboardCopy, Search, Sigma, X } from 'lucide-react';
import Section from './ui/Section.jsx';
import { FORMULA_GROUPS } from '../data/formulas.js';

const TAB_COLORS = {
  cyan: 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200 shadow-[0_0_24px_-8px_rgba(6,182,212,0.8)]',
  purple: 'border-purple-400/60 bg-purple-400/10 text-purple-200 shadow-[0_0_24px_-8px_rgba(168,85,247,0.8)]',
  emerald: 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200 shadow-[0_0_24px_-8px_rgba(16,185,129,0.8)]',
};
const CHIP_COLORS = {
  cyan: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
  purple: 'border-purple-400/25 bg-purple-400/10 text-purple-300',
  emerald: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
};

export default function FormulaCheatSheet() {
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      active === 'all'
        ? FORMULA_GROUPS
        : FORMULA_GROUPS.filter((g) => g.id === active);
    if (!q) return base;
    return base
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            it.formula.toLowerCase().includes(q) ||
            it.note.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [active, query]);

  const totalCount = groups.reduce((a, g) => a + g.items.length, 0);

  async function copyFormula(id, text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <Section
      id="formulas"
      number="08"
      icon={Sigma}
      title="Formulalar Ma’lumotnomasi"
      subtitle="Matematika, Fizika va Kimyo fanlaridan asosiy formulalar to‘plami — tezkor qidiruv va bir bosishda nusxalash bilan."
    >
      {/* Qidiruv */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Formula qidirish… (masalan: diskriminant, tezlik, mol)"
          aria-label="Formulani qidirish"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-10 pl-10 text-sm text-white backdrop-blur-xl transition-colors focus:border-cyan-400/50 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Qidiruvni tozalash"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Fan tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setActive('all')}
          className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
            active === 'all'
              ? 'border-white/40 bg-white/10 text-white'
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/25'
          }`}
        >
          Barchasi
        </button>
        {FORMULA_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
              active === g.id
                ? TAB_COLORS[g.color]
                : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/25'
            }`}
          >
            {g.label}
          </button>
        ))}
        <span className="ml-auto self-center font-mono text-[11px] text-slate-600">
          {totalCount} ta formula
        </span>
      </div>

      {/* Formula kartalari */}
      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
          <Sigma className="mx-auto mb-2 h-8 w-8 text-slate-600" aria-hidden="true" />
          <p className="text-sm text-slate-500">
            «{query}» bo‘yicha formula topilmadi.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.id}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <span className={`rounded-md border px-2 py-0.5 text-[11px] ${CHIP_COLORS[g.color]}`}>
                  {g.label}
                </span>
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {g.items.map((item) => {
                  const id = `${g.id}:${item.name}`;
                  return (
                    <div
                      key={id}
                      className="group glass glass-hover flex flex-col gap-2 p-4"
                    >
                      <p className="text-[13px] font-bold text-white">{item.name}</p>
                      <code className="block rounded-lg border border-white/10 bg-[#0a0a18] px-3 py-2.5 font-mono text-[13px] leading-relaxed break-words text-cyan-200">
                        {item.formula}
                      </code>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] leading-snug text-slate-500">{item.note}</p>
                        <button
                          onClick={() => copyFormula(id, item.formula)}
                          aria-label="Formulani nusxalash"
                          className={`flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                            copiedId === id
                              ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                              : 'border-white/10 bg-white/5 text-slate-400 opacity-0 group-hover:opacity-100 hover:border-cyan-500/40 hover:text-cyan-200 focus:opacity-100'
                          }`}
                        >
                          {copiedId === id ? (
                            <>
                              <Check className="h-3 w-3" /> Nusxalandi
                            </>
                          ) : (
                            <>
                              <ClipboardCopy className="h-3 w-3" /> Nusxalash
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
