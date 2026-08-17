import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Sparkles, CheckCircle2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTheme } from '@/hooks/useTheme';
import { soundscapes } from '@/utils/soundscapes';

type FocusModeOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MOTIVATIONAL_QUOTES = [
  "Focus is a muscle. The more you practice, the easier it gets.",
  "Small steps every day lead to massive results over time.",
  "Deep work isn't just about output — it's about mastering your mind.",
  "Your future self will thank you for staying focused right now.",
];

export function FocusModeOverlay({ isOpen, onClose }: FocusModeOverlayProps) {
  const { display, progress, isRunning, mode, start, pause, reset, sessionCount, adjustTime } = usePomodoro();
  const { activePalette } = useTheme();
  const [soundType, setSoundType] = useState<'rain' | 'white-noise' | 'deep-space' | 'lofi-hum'>('rain');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  useEffect(() => {
    if (!isOpen && isPlayingAudio) {
      soundscapes.stop();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  const toggleAudio = () => {
    if (isPlayingAudio) {
      soundscapes.stop();
      setIsPlayingAudio(false);
    } else {
      soundscapes.play(soundType, 0.15);
      setIsPlayingAudio(true);
    }
  };

  const changeAudioType = (type: 'rain' | 'white-noise' | 'deep-space' | 'lofi-hum') => {
    setSoundType(type);
    if (isPlayingAudio) {
      soundscapes.play(type, 0.15);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 p-6 sm:p-10 text-white backdrop-blur-3xl overflow-hidden"
      >
        {/* Ambient Gradient Background Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl transition-all duration-700"
          style={{ background: activePalette.gradient }}
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                FocusForge Distraction-Free Focus Mode
              </p>
              <p className="text-xs font-medium text-slate-300">
                {sessionCount} Sessions Completed Today 🔥
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
          >
            <Minimize2 className="h-4 w-4" />
            Exit Fullscreen
          </button>
        </div>

        {/* Center: Large Minimalist Radial Clock */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
          {/* Mode Pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <Flame className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {mode === 'work' ? 'Sprint Focus' : mode === 'short-break' ? 'Short Break' : 'Long Rest'}
            </span>
          </div>

          {/* Clock Display */}
          <div className="relative flex items-center justify-center">
            <svg width="300" height="300" className="transform -rotate-90">
              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="10"
              />
              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="url(#focus-gradient)"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 130}`}
                strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="focus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="#60A5FA" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-mono text-6xl font-extrabold tracking-tight sm:text-7xl">
                {display}
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {isRunning ? 'Session In Progress' : 'Paused'}
              </p>
            </div>
          </div>

          {/* Quick Dynamic Time Adjustments (+1m, +5m, -1m, -5m) */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => adjustTime(-300)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 backdrop-blur-md transition-all hover:bg-rose-500/20 hover:text-white"
              title="Subtract 5 minutes"
            >
              <Minus className="h-3 w-3" /> 5m
            </button>
            <button
              type="button"
              onClick={() => adjustTime(-60)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 backdrop-blur-md transition-all hover:bg-rose-500/20 hover:text-white"
              title="Subtract 1 minute"
            >
              <Minus className="h-3 w-3" /> 1m
            </button>
            <button
              type="button"
              onClick={() => adjustTime(60)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 backdrop-blur-md transition-all hover:bg-emerald-500/20 hover:text-white"
              title="Add 1 minute"
            >
              <Plus className="h-3 w-3" /> 1m
            </button>
            <button
              type="button"
              onClick={() => adjustTime(300)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 backdrop-blur-md transition-all hover:bg-emerald-500/20 hover:text-white"
              title="Add 5 minutes"
            >
              <Plus className="h-3 w-3" /> 5m
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={isRunning ? pause : start}
              className="flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:scale-105"
              style={{ background: activePalette.gradient }}
            >
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
              title="Reset Timer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

          {/* Motivational Quote */}
          <p className="mt-8 max-w-md text-xs font-medium italic text-slate-400">
            "{MOTIVATIONAL_QUOTES[quoteIndex]}"
          </p>
        </div>

        {/* Bottom Bar: Ambient Audio Controls */}
        <div className="relative z-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAudio}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-md transition-all ${
                isPlayingAudio
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {isPlayingAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {isPlayingAudio ? 'Ambient Audio On' : 'Play Soundscape'}
            </button>

            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
              {(['rain', 'deep-space', 'white-noise', 'lofi-hum'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => changeAudioType(type)}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                    soundType === type
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-slate-500">Press ESC or click button to exit</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
