import { useEffect, useMemo, useRef, useState } from 'react';
import { GraduationCap, Search, Sparkles, X, Menu } from 'lucide-react';

/** Barcha modullar ro'yxati (qidiruv va navigatsiya uchun). */
export const MODULES = [
  { id: 'summarizer', label: 'Konspekt AI', full: 'AI Konspekt va Qisqartiruvchi' },
  { id: 'essay', label: 'Insho tekshirish', full: 'AI Insho va Grammatika Tekshiruvchi' },
  { id: 'quiz', label: 'Test generator', full: 'AI Test Generator' },
  { id: 'tutor', label: 'AI repetitor', full: 'AI Homework Solver & Tutor Chatbot' },
  { id: 'pomodoro', label: 'Pomodoro', full: 'Pomodoro Focus Timer & Lo-Fi Audio' },
  { id: 'planner', label: "O'quv jadvali", full: 'O‘quv Jadvali va To-Do Tracker' },
  { id: 'gpa', label: 'GPA kalkulyator', full: 'Akademik GPA Kalkulyatori' },
  { id: 'formulas', label: 'Formulalar', full: 'Formulalar Ma’lumotnomasi' },
];

export default function Header() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MODULES.filter(
      (m) => m.label.toLowerCase().includes(q) || m.full.toLowerCase().includes(q),
    );
  }, [query]);

  // Tashqariga bosilganda qidiruv yopiladi
  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function goTo(id) {
    setOpen(false);
    setMenuOpen(false);
    setQuery('');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 text-[#0d0d1a] shadow-[0_0_24px_-4px_rgba(6,182,212,0.7)]">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="hidden text-base font-extrabold tracking-tight text-white sm:block">
            Student<span className="text-cyan-300 glow-text-cyan">Assistant</span>
          </span>
        </a>

        {/* Status belgilari */}
        <div className="hidden items-center gap-2 md:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            AI Online
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
            <Sparkles className="h-3 w-3 text-purple-300" aria-hidden="true" />
            2026/2027 Academic Year
          </span>
        </div>

        <div className="flex-1" />

        {/* Qidiruv */}
        <div ref={boxRef} className="relative w-full max-w-xs sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Modul qidirish…"
            aria-label="Modul qidirish"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pr-8 pl-9 text-sm text-white placeholder-slate-500 backdrop-blur-xl transition-colors focus:border-cyan-400/50 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Qidiruvni tozalash"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {open && query.trim() && (
            <div className="glass absolute right-0 mt-2 w-full overflow-hidden p-1.5">
              {results.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-slate-400">
                  «{query}» bo'yicha modul topilmadi.
                </p>
              ) : (
                results.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => goTo(m.id)}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    <span className="font-semibold">{m.label}</span>
                    <span className="ml-2 text-xs text-slate-500">{m.full}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Mobil menyu */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menyu"
          aria-expanded={menuOpen}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white lg:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Tezkor navigatsiya chizig'i */}
      <nav
        aria-label="Bo'limlararo navigatsiya"
        className="hidden border-t border-white/5 lg:block"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6 lg:px-8">
          {MODULES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => goTo(m.id)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-cyan-200"
            >
              <span className="mr-1.5 font-mono text-[11px] text-slate-600">
                {String(i + 1).padStart(2, '0')}
              </span>
              {m.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobil menyu paneli */}
      {menuOpen && (
        <nav className="border-t border-white/10 bg-[#0d0d1a]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-2 gap-1.5">
            {MODULES.map((m) => (
              <button
                key={m.id}
                onClick={() => goTo(m.id)}
                className="rounded-xl border border-white/5 bg-white/5 px-3 py-2.5 text-left text-[13px] font-medium text-slate-300 hover:border-cyan-500/30 hover:text-cyan-200"
              >
                {m.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
