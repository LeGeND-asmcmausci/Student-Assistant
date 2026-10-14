import { useState } from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import Section from './ui/Section.jsx';
import { loadState, saveState } from '../lib/ai.js';

const GRADES = [5, 4, 3, 2];

/** 5-ballik bahoni 4.0 shkalaga o'tkazish. */
const TO_FOUR = { 5: 4.0, 4: 3.0, 3: 2.0, 2: 1.0 };

const INITIAL = [
  { id: 'g1', name: 'Matematika', credit: 5, grade: 5 },
  { id: 'g2', name: 'Fizika', credit: 4, grade: 4 },
  { id: 'g3', name: 'Ingliz tili', credit: 3, grade: 5 },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function statusOf(gpa) {
  if (gpa >= 4.5) return { label: 'Ajoyib — dekanat stipendiyasi darajasi', color: '#10b981' };
  if (gpa >= 4.0) return { label: 'Yaxshi natija — barqaror o\u2018quv', color: '#06b6d4' };
  if (gpa >= 3.5) return { label: 'Qoniqarli — ba\u2018zi fanlarni kuchaytiring', color: '#a855f7' };
  if (gpa >= 3.0) return { label: 'O\u2018rtacha — qo\u2018shimcha mashq kerak', color: '#f59e0b' };
  return { label: 'Eslatma — darslarga muntazam tashrif buyuring', color: '#f43f5e' };
}

export default function GpaCalculator() {
  const [rows, setRows] = useState(() => loadState('sa_gpa', INITIAL));

  function update(next) {
    setRows(next);
    saveState('sa_gpa', next);
  }

  function addRow() {
    update([...rows, { id: uid(), name: '', credit: 3, grade: 4 }]);
  }

  function patch(id, field, value) {
    update(
      rows.map((r) =>
        r.id === id
          ? { ...r, [field]: field === 'name' ? value : Number(value) }
          : r,
      ),
    );
  }

  function removeRow(id) {
    update(rows.filter((r) => r.id !== id));
  }

  const totalCredits = rows.reduce((a, r) => a + (r.credit || 0), 0);
  const weighted = rows.reduce((a, r) => a + (r.credit || 0) * (r.grade || 0), 0);
  const gpa5 = totalCredits ? weighted / totalCredits : 0;
  const weighted4 = rows.reduce(
    (a, r) => a + (r.credit || 0) * (TO_FOUR[r.grade] ?? 0),
    0,
  );
  const gpa4 = totalCredits ? weighted4 / totalCredits : 0;
  const status = statusOf(gpa5);

  const maxGrade = 5;

  return (
    <Section
      id="gpa"
      number="07"
      icon={GraduationCap}
      title="Akademik GPA Kalkulyatori"
      subtitle="Fanlar, kreditlar va baholarni kiriting — umumiy GPA ball hisoblanadi va grafik ko‘rinishida chiqariladi."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Jadval */}
        <div className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-2.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Fan</th>
                  <th className="w-24 pb-2.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Kredit</th>
                  <th className="w-28 pb-2.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Baho</th>
                  <th className="w-10 pb-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-2 pr-2">
                      <input
                        value={r.name}
                        onChange={(e) => patch(r.id, 'name', e.target.value)}
                        placeholder="Fan nomi"
                        aria-label="Fan nomi"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={r.credit}
                        onChange={(e) => patch(r.id, 'credit', e.target.value)}
                        aria-label="Kredit"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center font-mono text-sm text-cyan-300 focus:border-cyan-400/50 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <div className="flex gap-1">
                        {GRADES.map((g) => (
                          <button
                            key={g}
                            onClick={() => patch(r.id, 'grade', g)}
                            aria-label={`${g} baho`}
                            className={`h-8 flex-1 rounded-lg border font-mono text-xs font-bold transition-all ${
                              r.grade === g
                                ? g >= 4
                                  ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
                                  : 'border-amber-400/50 bg-amber-400/10 text-amber-300'
                                : 'border-white/10 bg-white/5 text-slate-500 hover:border-white/25'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => removeRow(r.id)}
                        aria-label="Fan o'chirish"
                        className="rounded-lg p-1.5 text-slate-600 transition-colors hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addRow}
            className="mt-3 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition-colors hover:border-cyan-500/40 hover:text-cyan-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Fan qo'shish
          </button>
        </div>

        {/* Natija + grafik */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-[11px] tracking-widest text-slate-500 uppercase">Umumiy GPA (5-ballik)</p>
            <p className="mt-1 font-mono text-5xl font-extrabold" style={{ color: status.color }}>
              {gpa5.toFixed(2)}
            </p>
            <p className="mt-1 font-mono text-sm text-slate-400">4.0 shkalada: {gpa4.toFixed(2)}</p>
            <p className="mt-2 text-[12px] leading-snug" style={{ color: status.color }}>
              {status.label}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              Jami kredit: <span className="font-mono text-slate-300">{totalCredits}</span> ·
              Fanlar: <span className="font-mono text-slate-300">{rows.length}</span>
            </p>
          </div>

          {/* Bar grafik */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-[11px] tracking-widest text-slate-500 uppercase">Fanlar bo‘yicha grafik</p>
            {rows.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-slate-600">Fan qo‘shing — grafik shu yerda ko‘rinadi.</p>
            ) : (
              <ul className="space-y-2.5">
                {rows.map((r) => (
                  <li key={r.id}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="max-w-[65%] truncate text-slate-300">{r.name || 'Nomsiz fan'}</span>
                      <span className="font-mono text-slate-500">
                        {r.grade}.0 · {r.credit} kr
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(r.grade / maxGrade) * 100}%`,
                          background:
                            r.grade >= 4
                              ? 'linear-gradient(90deg,#06b6d4,#10b981)'
                              : 'linear-gradient(90deg,#f59e0b,#f43f5e)',
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
