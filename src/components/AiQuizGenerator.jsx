import { useState } from 'react';
import {
  ArrowRight, BarChart3, CheckCircle2, ListChecks, RotateCcw,
  Sparkles, Target, XCircle,
} from 'lucide-react';
import Section from './ui/Section.jsx';
import { DIFFICULTIES, pickQuestions, QUIZ_BANK } from '../data/quizBank.js';

const SUBJECTS = [...Object.keys(QUIZ_BANK), 'Boshqa mavzu…'];

export default function AiQuizGenerator() {
  const [topic, setTopic] = useState('Matematika');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [phase, setPhase] = useState('setup'); // setup | quiz | done
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  function handleGenerate() {
    if (!topic.trim()) {
      alert('Iltimos, fan yoki mavzu nomini kiriting.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setQuestions(pickQuestions(topic, difficulty));
      setCurrent(0);
      setAnswers([]);
      setPhase('quiz');
      setLoading(false);
    }, 650);
  }

  function answerWith(idx) {
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
    if (current + 1 < questions.length) {
      setTimeout(() => setCurrent((c) => c + 1), 350);
    } else {
      setTimeout(() => setPhase('done'), 450);
    }
  }

  const score = answers.reduce(
    (acc, a, i) => acc + (questions[i] && a === questions[i].answer ? 1 : 0),
    0,
  );
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <Section
      id="quiz"
      number="03"
      icon={ListChecks}
      title="AI Test Generator"
      subtitle="Fan yoki mavzu nomini yozing, qiyinchilik darajasini tanlang — AI 5 ta interaktiv test tuzadi, ularni yeching va yakuniy ball hamda xatolar tahlilini oling."
    >
      {phase === 'setup' && (
        <div className="mx-auto max-w-xl animate-fade-up">
          {/* Mavzu kiritish */}
          <label
            htmlFor="quiz-topic"
            className="mb-2 block text-xs font-semibold tracking-widest text-slate-400 uppercase"
          >
            Fan yoki mavzu nomi
          </label>
          <input
            id="quiz-topic"
            list="quiz-subjects"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Masalan: Matematika, Fizika, Kimyo…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-xl transition-colors focus:border-cyan-400/50 focus:outline-none"
          />
          <datalist id="quiz-subjects">
            {SUBJECTS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>

          {/* Qiyinchilik */}
          <p className="mb-2 mt-5 text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Qiyinchilik darajasi
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  difficulty === d.id
                    ? 'border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_24px_-8px_rgba(6,182,212,0.8)]'
                    : 'border-white/10 bg-white/5 hover:border-cyan-500/30'
                }`}
              >
                <p className="text-sm font-bold text-white">{d.label}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{d.desc}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_28px_-8px_rgba(168,85,247,0.8)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Test tuzilmoqda…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                AI test tuzish (5 savol)
              </>
            )}
          </button>
        </div>
      )}

      {phase === 'quiz' && questions.length > 0 && (
        <div className="mx-auto max-w-2xl animate-fade-up">
          {/* Progress */}
          <div className="mb-5 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">
              Savol {current + 1} / {questions.length}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
              {topic} · {DIFFICULTIES.find((d) => d.id === difficulty)?.label}
            </span>
          </div>
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Savol kartasi */}
          <div className="glass p-5 sm:p-6">
            <h3 className="mb-5 text-lg leading-snug font-bold text-white">
              {questions[current].q}
            </h3>
            <div className="space-y-2.5">
              {questions[current].options.map((opt, i) => {
                const chosen = answers[current] === i;
                return (
                  <button
                    key={i}
                    onClick={() => answerWith(i)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                      chosen
                        ? 'border-cyan-400/60 bg-cyan-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-500/40 hover:bg-white/[0.07]'
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-xs font-bold text-cyan-300">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="mx-auto max-w-2xl animate-fade-up space-y-5">
          {/* Yakuniy ball */}
          <div className="glass flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 font-mono text-2xl font-extrabold text-white">
              {pct}%
            </div>
            <div className="min-w-0">
              <p className="text-xl font-extrabold text-white">
                {score} / {questions.length} to'g'ri javob
              </p>
              <p className="mt-1 text-[13px] text-slate-400">
                {pct >= 80
                  ? 'Ajoyib natija! Mavzuni chuqur egallabsiz.'
                  : pct >= 60
                    ? 'Yaxshi! Ba\u2018zi joylarni yana bir ko\u2018z yugurtiring.'
                    : 'Mavzuni qayta o\u2018qib, testni takrorlang.'}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Yangi test
                </button>
                <button
                  onClick={() => setPhase('setup')}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/40"
                >
                  <Target className="h-3.5 w-3.5" aria-hidden="true" />
                  Mavzuni almashtirish
                </button>
              </div>
            </div>
          </div>

          {/* Savol-bosqichma-bosqich tahlil */}
          <div className="glass p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <BarChart3 className="h-4 w-4 text-purple-300" aria-hidden="true" />
              Savollar tahlili
            </h3>
            <ul className="space-y-3">
              {questions.map((q, i) => {
                const ok = answers[i] === q.answer;
                return (
                  <li key={i} className="flex items-start gap-3 text-[13px]">
                    {ok ? (
                      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-400" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200">{q.q}</p>
                      {!ok && (
                        <p className="mt-0.5 text-rose-300">
                          Siz: {answers[i] != null ? q.options[answers[i]] : 'javob berilmadi'}
                        </p>
                      )}
                      <p className="mt-0.5 text-emerald-300">To'g'ri: {q.options[q.answer]}</p>
                      <p className="mt-0.5 text-slate-500">{q.explain}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Section>
  );
}
