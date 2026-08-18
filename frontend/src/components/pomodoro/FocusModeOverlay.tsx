import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Play, Pause, RotateCcw, Volume2, VolumeX, Flame, CheckCircle2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTheme } from '@/hooks/useTheme';
import { soundscapes, CALMING_SOUNDSCAPES, type SoundscapeId } from '@/utils/soundscapes';

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
  const [soundType, setSoundType] = useState<SoundscapeId>('mp3-lofi');
  const [isPlayingAudio, setIsPlayingAudio] = useState(soundscapes.isPlaying);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  useEffect(() => {
    const unsub = soundscapes.subscribe(() => {
      setIsPlayingAudio(soundscapes.isPlaying);
    });
    return unsub;
  }, []);

  const toggleAudio = () => {
    if (isPlayingAudio) {
      soundscapes.stopAll();
    } else {
      soundscapes.playSoundscape(soundType);
    }
  };

  const changeAudioType = (type: SoundscapeId) => {
    setSoundType(type);
    if (isPlayingAudio) {
      soundscapes.playSoundscape(type);
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
        className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 p-6 sm:p-10 text-white overflow-hidden"
      >
        {/* Top Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur-md">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Cycle {(sessionCount % 4) + 1} of 4
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur-md">
              {mode === 'work' ? 'Deep Work Focus' : 'Recovery Rest'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span>Exit Fullscreen</span>
          </button>
        </div>

        {/* Center: Big Animated Timer Ring */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center">
            {/* Ambient Background Glow */}
            {isRunning && (
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20"
                style={{ background: activePalette.gradient }}
              />
            )}

            {/* Circular Progress SVG */}
            <svg width={360} height={360} className="rotate-[-90deg] transform">
              <circle
                cx={180}
                cy={180}
                r={160}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={10}
              />
              <circle
                cx={180}
                cy={180}
                r={160}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 160}
                strokeDashoffset={2 * Math.PI * 160 * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>

            {/* Timer Digits Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-7xl sm:text-8xl font-black tracking-tight text-white drop-shadow-lg">
                {display}
              </span>
              <span className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                {isRunning ? 'Flow State Active' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Quick Adjust Buttons */}
          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustTime(-60)}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
              title="Subtract 1 minute"
            >
              <Minus className="h-3 w-3" /> 1m
            </button>
            <button
              type="button"
              onClick={() => adjustTime(60)}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
              title="Add 1 minute"
            >
              <Plus className="h-3 w-3" /> 1m
            </button>
            <button
              type="button"
              onClick={() => adjustTime(300)}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
              title="Add 5 minutes"
            >
              <Plus className="h-3 w-3" /> 5m
            </button>
          </div>

          {/* Controls Bar */}
          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={isRunning ? pause : start}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              {isRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
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
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {isPlayingAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {isPlayingAudio ? 'Ambient Audio On' : 'Play Soundscape'}
            </button>

            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
              {CALMING_SOUNDSCAPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => changeAudioType(s.id)}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                    soundType === s.id
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.name}
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
