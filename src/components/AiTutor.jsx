import { useRef, useState } from 'react';
import { Bot, CornerDownLeft, Send, Trash2, User } from 'lucide-react';
import Section from './ui/Section.jsx';
import { tutorRespond } from '../lib/ai.js';

const GREETING = {
  id: 'ai-greeting',
  role: 'ai',
  topic: 'Salom!',
  steps: [
    'Men AI repetitorman va masalani bosqichma-bosqich yechishda yordam beraman.',
    'Savolingizni yozing: masalan «x^2 - 5x + 6 = 0 tenglamani yeching» yoki «Ohm qonuni qanday?».',
    'Men tayyor javob bermasdan oldin, sizni to\u2018g\u2018ri yo\u2018nalishga yo\u2018naltiraman.',
  ],
  answer: null,
};

export default function AiTutor() {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  function send() {
    const q = input.trim();
    if (!q || typing) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: q }]);
    setInput('');
    setTyping(true);

    // "AI javobi" uchun qisqa kechikish
    setTimeout(() => {
      const reply = tutorRespond(q);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', ...reply },
      ]);
      setTyping(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }, 700);
  }

  function clearChat() {
    setMessages([GREETING]);
    setInput('');
  }

  return (
    <Section
      id="tutor"
      number="04"
      icon={Bot}
      title="AI Homework Solver & Tutor Chatbot"
      subtitle="Tushunarsiz masala yoki savolingizni yuboring — AI repetitor Sokratik uslubda bosqichma-bosqich yo‘naltirib tushuntiradi."
    >
      <div className="mx-auto flex h-[560px] max-w-3xl flex-col">
        {/* Chat xabarlar */}
        <div
          ref={listRef}
          className="flex-1 space-y-4 overflow-y-auto pr-1 pb-4"
          aria-live="polite"
        >
          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="flex justify-end">
                <div className="flex max-w-[85%] items-start gap-2.5 rounded-2xl rounded-tr-sm border border-cyan-400/25 bg-cyan-400/10 px-4 py-3">
                  <p className="text-[13px] leading-relaxed text-cyan-100">{m.text}</p>
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <div className="flex max-w-[92%] items-start gap-2.5 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/25 to-purple-500/25">
                    <Bot className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="mb-1 text-[11px] font-bold tracking-wider text-purple-300 uppercase">
                      {m.topic}
                    </p>
                    <ol className="space-y-2">
                      {m.steps.map((s, i) => (
                        <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-300">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-purple-400/15 font-mono text-[11px] font-bold text-purple-300">
                            {i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                    {m.answer && (
                      <p className="mt-3 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 font-mono text-[12px] font-semibold text-emerald-200">
                        Yakuniy javob: {m.answer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-typing-dot"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </span>
                <span className="text-[12px] text-slate-400">AI fikrlayapti…</span>
              </div>
            </div>
          )}
        </div>

        {/* Yuborish paneli */}
        <div className="flex items-center gap-2 border-t border-white/10 pt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Masala yoki savolingizni yozing…"
            aria-label="Savolingiz"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-xl transition-colors focus:border-cyan-400/50 focus:outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || typing}
            aria-label="Yuborish"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_24px_-8px_rgba(6,182,212,0.9)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={clearChat}
            aria-label="Suhbatni tozalash"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-rose-500/40 hover:text-rose-300"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600">
          <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
          Enter — yuborish. Javoblar ta'lim maqsadidagi yo'nalish beradi.
        </p>
      </div>
    </Section>
  );
}
