import { useEffect, useRef, useState } from 'react';
import { Coffee, Pause, Play, RotateCcw, Volume2, VolumeX, Timer } from 'lucide-react';
import Section from './ui/Section.jsx';

const MODES = [
  { id: 'focus', label: 'Fokus', minutes: 25, color: '#06b6d4' },
  { id: 'short', label: 'Qisqa tanaffus', minutes: 5, color: '#10b981' },
  { id: 'long', label: 'Uzun tanaffus', minutes: 15, color: '#a855f7' },
];

const SOUNDSCAPES = [
  { id: 'rain', label: 'Yomg\u2018ir (Lo-Fi)' },
  { id: 'waves', label: 'Dengiz to\u2018lqini' },
  { id: 'cafe', label: 'Kafe shovqini' },
  { id: 'forest', label: 'O\u2018rmon ambience' },
];

/** Web Audio API orqali shovqin generatsiya qiluvchi pleyer. */
function createSoundscape(ctx, type) {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Noize buffer (2 soniya, loop)
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1;
    // Brown noise uchun integratsiya
    last = (last + 0.02 * white) / 1.02;
    data[i] = type === 'waves' || type === 'cafe' ? last * 3.5 : white;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  if (type === 'rain') {
    filter.type = 'lowpass';
    filter.frequency.value = 1400;
  } else if (type === 'waves') {
    filter.type = 'lowpass';
    filter.frequency.value = 500;
  } else if (type === 'cafe') {
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.6;
  } else {
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.4;
  }
  noise.connect(filter);
  filter.connect(master);

  // To'lqin effekti uchun LFO
  let lfo = null;
  let lfoGain = null;
  if (type === 'waves' || type === 'forest') {
    lfo = ctx.createOscillator();
    lfo.frequency.value = type === 'waves' ? 0.09 : 0.15;
    lfoGain = ctx.createGain();
    lfoGain.gain.value = type === 'waves' ? 320 : 260;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
  }

  noise.start();

  return {
    fadeTo(value, seconds = 1.2) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(value, now + seconds);
    },
    stop() {
      try {
        noise.stop();
        lfo?.stop();
      } catch {
        /* allaqachon to'xtagan bo'lishi mumkin */
      }
      master.disconnect();
    },
  };
}

export default function PomodoroTimer() {
  const [modeId, setModeId] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [soundId, setSoundId] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);

  const endTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const soundRef = useRef(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume * (muted ? 0 : 1);

  const mode = MODES.find((m) => m.id === modeId);
  const totalSeconds = mode.minutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  /* —— Taymer tick (timestamp asosida — throttling ta'siri yo'q) —— */
  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return undefined;
    }
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(intervalRef.current);
        setRunning(false);
        if (modeId === 'focus') setCompleted((c) => c + 1);
        beep();
      }
    }, 250);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function beep() {
    try {
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 830;
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch {
      /* Audio ruxsat yo'q bo'lsa — jim o'tamiz */
    }
  }

  function selectMode(id) {
    const m = MODES.find((x) => x.id === id);
    setModeId(id);
    setRunning(false);
    setSecondsLeft(m.minutes * 60);
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(totalSeconds);
  }

  /* —— Lo-Fi pleyer —— */
  function toggleSound(id) {
    if (soundId === id) {
      soundRef.current?.fadeTo(0, 0.6);
      const s = soundRef.current;
      setTimeout(() => s?.stop(), 700);
      setSoundId(null);
      return;
    }
    soundRef.current?.stop();
    try {
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      soundRef.current = createSoundscape(ctx, id);
      soundRef.current.fadeTo(volumeRef.current || 0.4);
      setSoundId(id);
    } catch {
      alert('Audio uchun ruxsat berilmadi yoki brauzer qo\u2018llab-quvvatlamaydi.');
    }
  }

  useEffect(() => {
    soundRef.current?.fadeTo(volumeRef.current, 0.3);
  }, [volume, muted]);

  useEffect(() => () => soundRef.current?.stop(), []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const r = 108;
  const c = 2 * Math.PI * r;

  return (
    <Section
      id="pomodoro"
      number="05"
      icon={Timer}
      title="Pomodoro Focus Timer & Lo-Fi Audio Player"
      subtitle="25/5 daqiqali Pomodoro usuli bilan diqqatingizni jamlang va qulay o‘quv ambient tovushlarini tinglang."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Taymer */}
        <div className="flex flex-col items-center">
          {/* Rejimlar */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMode(m.id)}
                className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                  modeId === m.id
                    ? 'border-cyan-400/60 bg-cyan-400/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-cyan-500/30 hover:text-slate-200'
                }`}
              >
                {m.label} · {m.minutes}m
              </button>
            ))}
          </div>

          {/* Ring */}
          <div className="relative h-64 w-64">
            <svg viewBox="0 0 256 256" className="h-full w-full -rotate-90">
              <circle cx="128" cy="128" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
              <circle
                cx="128" cy="128" r={r}
                fill="none"
                stroke={mode.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c - (c * progress) / 100}
                style={{ transition: 'stroke-dashoffset 0.4s linear', filter: `drop-shadow(0 0 10px ${mode.color}80)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl font-extrabold tracking-tight text-white">
                {mm}:{ss}
              </span>
              <span className="mt-1 text-[11px] tracking-widest text-slate-500 uppercase">
                {running ? 'ishlayapti…' : 'kutilmoqda'}
              </span>
            </div>
          </div>

          {/* Boshqaruv */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setRunning((v) => !v)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-7 py-3 text-sm font-bold text-white shadow-[0_0_28px_-8px_rgba(6,182,212,0.9)] transition-all hover:brightness-110"
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? 'Pauza' : 'Boshlash'}
            </button>
            <button
              onClick={reset}
              aria-label="Qayta tiklash"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Hisoblagich */}
          <p className="mt-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-400">
            <Coffee className="h-3 w-3 text-amber-300" aria-hidden="true" />
            Bugun yakunlangan pomodoro: <span className="font-mono text-amber-200">{completed}</span>
          </p>
        </div>

        {/* Lo-Fi pleyer */}
        <div className="flex flex-col justify-center">
          <h3 className="mb-1 text-lg font-bold text-white">Lo-Fi & Ambient pleyer</h3>
          <p className="mb-5 text-[13px] leading-relaxed text-slate-400">
            Tovushlar brauzeringizda real vaqtda sintez qilinadi — internet yoki
            fayl yuklab olish shart emas.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {SOUNDSCAPES.map((s) => {
              const active = soundId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSound(s.id)}
                  className={`rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                    active
                      ? 'border-emerald-400/60 bg-emerald-400/10 text-white shadow-[0_0_24px_-8px_rgba(16,185,129,0.9)]'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-500/40'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    {s.label}
                    {active && (
                      <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1 rounded-sm bg-emerald-400 animate-typing-dot"
                            style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Volim */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <button
              onClick={() => setMuted((v) => !v)}
              aria-label={muted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
              className="text-slate-400 transition-colors hover:text-white"
            >
              {muted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Ovoz balandligi"
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400"
            />
            <span className="w-9 text-right font-mono text-[11px] text-slate-500">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}
