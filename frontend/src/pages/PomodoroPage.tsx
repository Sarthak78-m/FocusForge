import { useState } from 'react';
import { Maximize2, Volume2, VolumeX, Flame, Sparkles, RefreshCw, Play, Pause } from 'lucide-react';
import { usePomodoro, type PomodoroMode } from '@/hooks/usePomodoro';
import { useTheme } from '@/hooks/useTheme';
import { soundscapes } from '@/utils/soundscapes';
import { FocusModeOverlay } from '@/components/pomodoro/FocusModeOverlay';
import { cn } from '@/utils/cn';

const MODES: { value: PomodoroMode; label: string; minutes: number }[] = [
  { value: 'work', label: 'Focus Sprint', minutes: 25 },
  { value: 'short-break', label: 'Short Break', minutes: 5 },
  { value: 'long-break', label: 'Long Rest', minutes: 15 },
];

function TimerRing({ progress, size = 260 }: { progress: number; size?: number }) {
  const { activePalette } = useTheme();
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#timer-accent-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <defs>
        <linearGradient id="timer-accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={activePalette.primary} />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const SESSION_DOTS = 4;

export function PomodoroPage() {
  const {
    mode,
    display,
    progress,
    isRunning,
    sessionCount,
    start,
    pause,
    reset,
    setMode,
  } = usePomodoro();

  const { activePalette } = useTheme();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [soundType, setSoundType] = useState<'rain' | 'white-noise' | 'deep-space' | 'lofi-hum'>('rain');

  const dotsCompleted = sessionCount % SESSION_DOTS;
  const currentModeConfig = MODES.find((m) => m.value === mode)!;

  const toggleAudio = () => {
    if (isPlayingAudio) {
      soundscapes.stop();
      setIsPlayingAudio(false);
    } else {
      soundscapes.play(soundType, 0.15);
      setIsPlayingAudio(true);
    }
  };

  const changeSound = (type: 'rain' | 'white-noise' | 'deep-space' | 'lofi-hum') => {
    setSoundType(type);
    if (isPlayingAudio) {
      soundscapes.play(type, 0.15);
    }
  };

  return (
    <div className="space-y-8">
      {/* Fullscreen Overlay */}
      <FocusModeOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Pomodoro Focus Engine
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
              <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              {sessionCount} Sessions Today
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Inspired by Paymo, Focus Keeper, and Momentum Pro
          </p>
        </div>

        {/* Launcher Button */}
        <button
          type="button"
          onClick={() => setIsOverlayOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
          style={{ background: activePalette.gradient }}
        >
          <Maximize2 className="h-4 w-4" />
          Full-Screen Focus Mode
        </button>
      </div>

      <div className="mx-auto max-w-xl">
        {/* Mode tabs */}
        <div className="mb-8 flex rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                'flex flex-1 flex-col items-center rounded-xl px-3 py-2.5 text-center transition-all duration-200',
                mode === m.value
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
              )}
            >
              <span className="text-xs">{m.label}</span>
              <span className="mt-0.5 text-[11px] font-semibold opacity-70">{m.minutes} min</span>
            </button>
          ))}
        </div>

        {/* Timer display card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <TimerRing progress={progress} size={260} />
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {display}
              </span>
              <span className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                {currentModeConfig.label}
              </span>
            </div>
          </div>

          {/* Session Progress Dots */}
          <div className="mt-6 flex items-center gap-2">
            {Array.from({ length: SESSION_DOTS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-3 w-3 rounded-full transition-all',
                  i < dotsCompleted
                    ? 'scale-110 shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800',
                )}
                style={{ background: i < dotsCompleted ? activePalette.primary : undefined }}
              />
            ))}
          </div>

          <p className="mt-2 text-xs font-medium text-slate-500">
            {sessionCount} total sessions completed · Long break every {SESSION_DOTS} sessions
          </p>

          {/* Controls */}
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={isRunning ? pause : start}
              className="flex min-w-[130px] items-center justify-center gap-2 rounded-full px-8 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
              style={{ background: activePalette.gradient }}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>
          </div>
        </div>

        {/* Ambient Soundscapes Audio Bar */}
        <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAudio}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  isPlayingAudio
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
                title={isPlayingAudio ? 'Mute Ambient Audio' : 'Play Ambient Audio'}
              >
                {isPlayingAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Ambient Study Soundscapes
                </p>
                <p className="text-[11px] text-slate-500">
                  {isPlayingAudio ? `Playing ${soundType.replace('-', ' ')}` : 'Select audio to boost focus'}
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              {(['rain', 'white-noise', 'deep-space', 'lofi-hum'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => changeSound(type)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                    soundType === type
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {type.split('-')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
