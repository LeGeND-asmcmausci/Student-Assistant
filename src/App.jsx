import { Bot, Feather, FileText, GraduationCap, ListChecks } from 'lucide-react';
import Header from './components/Header.jsx';
import AiSummarizer from './components/AiSummarizer.jsx';
import AiEssayChecker from './components/AiEssayChecker.jsx';
import AiQuizGenerator from './components/AiQuizGenerator.jsx';
import AiTutor from './components/AiTutor.jsx';
import PomodoroTimer from './components/PomodoroTimer.jsx';
import StudyPlanner from './components/StudyPlanner.jsx';
import GpaCalculator from './components/GpaCalculator.jsx';
import FormulaCheatSheet from './components/FormulaCheatSheet.jsx';
import AiHumanizer from './components/AiHumanizer.jsx';

const FEATURES = [
  { icon: FileText, text: 'Konspekt AI' },
  { icon: ListChecks, text: 'Test generator' },
  { icon: Bot, text: 'AI repetitor' },
  { icon: GraduationCap, text: 'GPA va jadval' },
  { icon: Feather, text: 'AI Humanizer' },
];

export default function App() {
  return (
    <div id="top" className="relative min-h-screen">
      {/* Harakatlanuvchi Aurora gradient dog'lari */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-orb" />
      </div>

      <Header />

      <main className="space-y-16 pb-20 pt-12 sm:space-y-20">
        {/* ——— Hero ——— */}
        <section className="px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl animate-fade-up">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-300">
              <Bot className="h-3.5 w-3.5" aria-hidden="true" />
              Sun'iy intellekt asosidagi o'quv platformasi
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              O'quvchi va talaba uchun{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
                AI yordamchi
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Konspekt yasash, insho tekshirish, test tuzish, masala yechish,
              dars jadvali va GPA nazorati \u2014 barchasi bitta toza, zamonaviy
              interfeysda.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#summarizer"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_-6px_rgba(6,182,212,0.7)] transition-all hover:shadow-[0_0_40px_-6px_rgba(168,85,247,0.8)] hover:brightness-110"
              >
                Boshlash →
              </a>
              <a
                href="#tutor"
                className="glass glass-hover px-6 py-3 text-sm font-semibold text-slate-200"
              >
                AI repetitorga savol berish
              </a>
            </div>
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-xl"
                >
                  <Icon className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ——— 9 ta modul ——— */}
        <AiSummarizer />
        <AiEssayChecker />
        <AiQuizGenerator />
        <AiTutor />
        <PomodoroTimer />
        <StudyPlanner />
        <GpaCalculator />
        <FormulaCheatSheet />
        <AiHumanizer />

        {/* ——— Footer ——— */}
        <footer className="px-4 sm:px-6 lg:px-8">
          <div className="glass mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 p-6 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 text-[#0d0d1a]">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Student Assistant</p>
                <p className="text-xs text-slate-500">
                  2026/2027 Academic Year · AI-powered study platform
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Barcha hisob-kitoblar brauzeringizda — ma'lumotlaringiz
              hech qayerga yuborilmaydi.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
