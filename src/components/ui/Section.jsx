import { Sparkles } from 'lucide-react';

/**
 * Har bir modul uchun qayta ishlatiladigan glass-section o'rami.
 * Sarlavha raqami, ikonka, nom va qisqa tavsif beradi.
 */
export default function Section({ id, number, icon: Icon, title, subtitle, children }) {
  return (
    <section id={id} className="scroll-mt-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start gap-4">
          <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300 backdrop-blur-xl">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-widest text-cyan-300/90 uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Modul {number}
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="glass p-5 shadow-[0_8px_40px_-16px_rgba(6,182,212,0.25)] sm:p-6">
          {children}
        </div>
      </div>
    </section>
  );
}
