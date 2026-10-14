import { useMemo, useState } from 'react';
import { CalendarDays, CheckSquare, Plus, Trash2, PartyPopper } from 'lucide-react';
import Section from './ui/Section.jsx';
import { loadState, saveState } from '../lib/ai.js';

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

const todayIndex = () => (new Date().getDay() + 6) % 7; // 0 = Dushanba

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const PRIORITY_STYLE = {
  high: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  medium: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  low: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
};
const PRIORITY_LABEL = { high: 'Muhim', medium: "O'rta", low: 'Past' };

const INITIAL_STATE = {
  tasks: [
    { id: 't1', title: 'Algebra: 3-uy vazifa', day: 0, priority: 'high', done: false },
    { id: 't2', title: 'Ingliz tili: esse yozish', day: 1, priority: 'medium', done: false },
    { id: 't3', title: 'Fizika: laboratoriya hisoboti', day: 3, priority: 'high', done: false },
  ],
  lessons: [
    { id: 'l1', day: 0, time: '09:00', subject: 'Matematika', room: '210-xona' },
    { id: 'l2', day: 0, time: '11:00', subject: 'Fizika', room: 'Laboratoriya' },
    { id: 'l3', day: 2, time: '10:00', subject: 'Ingliz tili', room: '105-xona' },
  ],
};

export default function StudyPlanner() {
  const [state, setState] = useState(() => loadState('sa_planner', INITIAL_STATE));
  const [taskInput, setTaskInput] = useState('');
  const [taskDay, setTaskDay] = useState(todayIndex());
  const [taskPriority, setTaskPriority] = useState('medium');
  const [lessonDay, setLessonDay] = useState(todayIndex());
  const [lessonTime, setLessonTime] = useState('09:00');
  const [lessonSubject, setLessonSubject] = useState('');
  const [lessonRoom, setLessonRoom] = useState('');

  function update(next) {
    setState(next);
    saveState('sa_planner', next);
  }

  function addTask() {
    const title = taskInput.trim();
    if (!title) return;
    update({
      ...state,
      tasks: [
        ...state.tasks,
        { id: uid(), title, day: Number(taskDay), priority: taskPriority, done: false },
      ],
    });
    setTaskInput('');
  }

  function toggleTask(id) {
    update({
      ...state,
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    });
  }

  function removeTask(id) {
    update({ ...state, tasks: state.tasks.filter((t) => t.id !== id) });
  }

  function addLesson() {
    const subject = lessonSubject.trim();
    if (!subject) return;
    update({
      ...state,
      lessons: [
        ...state.lessons,
        {
          id: uid(),
          day: Number(lessonDay),
          time: lessonTime,
          subject,
          room: lessonRoom.trim(),
        },
      ],
    });
    setLessonSubject('');
    setLessonRoom('');
  }

  function removeLesson(id) {
    update({ ...state, lessons: state.lessons.filter((l) => l.id !== id) });
  }

  // Kunlik progress: bugungi kun bo'yicha bajarilgan/vazifalar
  const todayTasks = state.tasks.filter((t) => t.day === todayIndex());
  const doneToday = todayTasks.filter((t) => t.done).length;
  const pctToday = todayTasks.length
    ? Math.round((doneToday / todayTasks.length) * 100)
    : 0;

  const byDay = useMemo(() => {
    const map = {};
    DAYS.forEach((_, i) => {
      map[i] = {
        lessons: state.lessons
          .filter((l) => l.day === i)
          .sort((a, b) => a.time.localeCompare(b.time)),
        tasks: state.tasks.filter((t) => t.day === i),
      };
    });
    return map;
  }, [state]);

  return (
    <Section
      id="planner"
      number="06"
      icon={CalendarDays}
      title="O‘quv Jadvali va To-Do Tracker"
      subtitle="Haftalik darslar jadvalini tuzing, vazifalar qo‘shing — bajarilgan vazifalar soniga qarab kunlik progress bar avtomatik to‘ladi."
    >
      {/* Kunlik progress */}
      <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold text-white">
            Bugun: {DAYS[todayIndex()]}
            {doneToday === todayTasks.length && todayTasks.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                <PartyPopper className="h-3.5 w-3.5" aria-hidden="true" />
                Barcha vazifalar bajarildi!
              </span>
            )}
          </p>
          <p className="font-mono text-sm text-cyan-300">
            {doneToday}/{todayTasks.length} · {pctToday}%
          </p>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-500 transition-all duration-700"
            style={{ width: `${pctToday}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ——— Vazifalar (To-Do) ——— */}
        <div className="lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <CheckSquare className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            Vazifalar
          </h3>
          <div className="mb-3 space-y-2">
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Yangi vazifa…"
              aria-label="Yangi vazifa"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white backdrop-blur-xl transition-colors focus:border-cyan-400/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={taskDay}
                onChange={(e) => setTaskDay(e.target.value)}
                aria-label="Vazifa kuni"
                className="flex-1 rounded-xl border border-white/10 bg-[#14142b] px-3 py-2.5 text-xs text-slate-200 focus:border-cyan-400/50 focus:outline-none"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                aria-label="Muhimlik"
                className="flex-1 rounded-xl border border-white/10 bg-[#14142b] px-3 py-2.5 text-xs text-slate-200 focus:border-cyan-400/50 focus:outline-none"
              >
                <option value="high">Muhim</option>
                <option value="medium">O‘rta</option>
                <option value="low">Past</option>
              </select>
              <button
                onClick={addTask}
                aria-label="Vazifa qo'shish"
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white transition-all hover:brightness-110"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ul className="space-y-2">
            {state.tasks.length === 0 && (
              <li className="rounded-xl border border-dashed border-white/10 p-5 text-center text-[13px] text-slate-500">
                Hozircha vazifa yo‘q — yangi vazifa qo‘shing.
              </li>
            )}
            {state.tasks.map((t) => (
              <li
                key={t.id}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  aria-label={t.done ? 'Bajarilmagan qilish' : 'Bajarildi qilish'}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                    t.done
                      ? 'border-emerald-400/60 bg-emerald-400/20 text-emerald-300'
                      : 'border-white/20 bg-white/5 text-transparent hover:border-cyan-400/50'
                  }`}
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6.5 4.8 9 10 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[13px] font-medium ${t.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {t.title}
                  </p>
                  <p className="text-[11px] text-slate-500">{DAYS[t.day]}</p>
                </div>
                <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${PRIORITY_STYLE[t.priority]}`}>
                  {PRIORITY_LABEL[t.priority]}
                </span>
                <button
                  onClick={() => removeTask(t.id)}
                  aria-label="Vazifani o'chirish"
                  className="shrink-0 rounded-md p-1 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ——— Haftalik jadval ——— */}
        <div className="lg:col-span-3">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <CalendarDays className="h-4 w-4 text-purple-300" aria-hidden="true" />
            Haftalik darslar jadvali
          </h3>

          {/* Dars qo'shish */}
          <div className="mb-3 flex flex-wrap gap-2">
            <select
              value={lessonDay}
              onChange={(e) => setLessonDay(e.target.value)}
              aria-label="Dars kuni"
              className="rounded-xl border border-white/10 bg-[#14142b] px-3 py-2.5 text-xs text-slate-200 focus:border-cyan-400/50 focus:outline-none"
            >
              {DAYS.map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </select>
            <input
              type="time"
              value={lessonTime}
              onChange={(e) => setLessonTime(e.target.value)}
              aria-label="Dars vaqti"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-xs text-slate-200 focus:border-cyan-400/50 focus:outline-none"
            />
            <input
              value={lessonSubject}
              onChange={(e) => setLessonSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLesson()}
              placeholder="Fan nomi"
              aria-label="Fan nomi"
              className="min-w-[120px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
            />
            <input
              value={lessonRoom}
              onChange={(e) => setLessonRoom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLesson()}
              placeholder="Xona"
              aria-label="Xona"
              className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
            />
            <button
              onClick={addLesson}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" />
              Qo'shish
            </button>
          </div>

          {/* Kunlar ustunlari */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            {DAYS.map((d, i) => {
              const isToday = i === todayIndex();
              return (
                <div
                  key={d}
                  className={`rounded-xl border p-2.5 ${
                    isToday
                      ? 'border-cyan-400/40 bg-cyan-400/[0.07]'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <p className={`mb-2 text-center text-[11px] font-bold tracking-wide uppercase ${
                    isToday ? 'text-cyan-300' : 'text-slate-400'
                  }`}>
                    {d}
                  </p>
                  <div className="space-y-1.5">
                    {byDay[i].lessons.length === 0 && (
                      <p className="py-2 text-center text-[10px] text-slate-600">—</p>
                    )}
                    {byDay[i].lessons.map((l) => (
                      <div
                        key={l.id}
                        className="group relative rounded-lg border border-white/10 bg-[#0f0f22] px-2 py-1.5"
                      >
                        <p className="font-mono text-[10px] font-bold text-cyan-300">{l.time}</p>
                        <p className="truncate text-[11px] font-semibold text-slate-200" title={l.subject}>
                          {l.subject}
                        </p>
                        {l.room && (
                          <p className="truncate text-[10px] text-slate-500">{l.room}</p>
                        )}
                        <button
                          onClick={() => removeLesson(l.id)}
                          aria-label="Darsni o'chirish"
                          className="absolute top-1 right-1 rounded-md p-0.5 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
