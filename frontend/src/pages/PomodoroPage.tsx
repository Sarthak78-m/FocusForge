import { useState } from 'react';
import { Maximize2, Volume2, VolumeX, Flame, Settings, RotateCcw, Play, Pause, SkipForward, CheckCircle2 } from 'lucide-react';
import { usePomodoro, type PomodoroMode } from '@/hooks/usePomodoro';
import { soundscapes } from '@/utils/soundscapes';
import { FocusModeOverlay } from '@/components/pomodoro/FocusModeOverlay';
import { cn } from '@/utils/cn';

const MODE_DEFS: { value: PomodoroMode; label: string }[] = [
  { value: 'work', label: 'Focus Mode' },
  { value: 'short-break', label: 'Short Break' },
  { value: 'long-break', label: 'Long Rest' },
];

function StitchTimerRing({ progress, size = 300 }: { progress: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="rotate-[-90deg] transform" aria-hidden="true">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-surface-secondary)"
        strokeWidth={strokeWidth}
      />
      {/* Progress Ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}

export function PomodoroPage() {
  const {
    mode,
    display,
    progress,
    isRunning,
    sessionCount,
    durations,
    start,
    pause,
    reset,
    setMode,
    setCustomDuration,
  } = usePomodoro();

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [soundType, setSoundType] = useState<'rain' | 'white-noise' | 'deep-space' | 'lofi-hum'>('rain');

  const sessionNumber = (sessionCount % 4) + 1;

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
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center py-6 px-4">
      {/* Fullscreen Overlay */}
      <FocusModeOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />

      {/* Header & Controls Bar */}
      <div className="mb-6 flex w-full max-w-xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-surface-container)] px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)]">
            Focus Mode
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {sessionCount} Sessions Today
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full border border-[var(--color-border)] bg-white p-2 text-[var(--color-text-secondary)] hover:bg-slate-50 dark:bg-slate-900 transition-all"
            title="Timer Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsOverlayOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] hover:scale-105"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Full Screen
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs (Focus / Short Break / Long Rest) */}
      <div className="mb-8 flex rounded-full border border-[var(--color-border)] bg-white p-1 shadow-xs dark:bg-slate-900">
        {MODE_DEFS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={cn(
              'rounded-full px-5 py-2 text-xs font-bold transition-all',
              mode === m.value
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Custom Duration Settings Panel */}
      {showSettings && (
        <div className="mb-8 w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-lg dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Configure Durations (Minutes)
            </h3>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              Done
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MODE_DEFS.map((m) => {
              const mins = Math.round((durations[m.value] || 1500) / 60);
              return (
                <div key={m.value} className="flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-slate-50 p-2.5 dark:bg-slate-950">
                  <label className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                    {m.label}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={mins}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setCustomDuration(m.value, val);
                    }}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-xs font-bold text-center text-[var(--color-text-primary)] dark:bg-slate-900"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Breadcrumb */}
      <div className="mb-4 text-center">
        <h2 className="text-sm font-bold text-[var(--color-text-secondary)]">
          Session {sessionNumber} of 4
        </h2>
      </div>

      {/* Stitch Pomodoro Timer Ring Component */}
      <div className="relative mb-8 flex h-72 w-72 md:h-80 md:w-80 items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <StitchTimerRing progress={progress} size={300} />
        </div>

        {/* Center Timer Glow Display */}
        <div className="z-10 flex h-60 w-60 md:h-64 md:w-64 flex-col items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-xl dark:bg-slate-900">
          <span className="font-bold text-5xl md:text-6xl tracking-tighter text-[var(--color-text-primary)] font-mono">
            {display}
          </span>
          <span className="mt-2 flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-xs font-bold text-[var(--color-primary)] border border-[var(--color-border-strong)]">
            <Flame className="h-3.5 w-3.5 fill-[var(--color-primary)] text-[var(--color-primary)]" />
            {isRunning ? 'In Flow' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Active Task Card (Stitch Design) */}
      <div className="mb-8 flex w-full max-w-md items-center gap-3.5 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-xs dark:bg-slate-900">
        <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)]">
            Reading Chapter 4 — Advanced Organic Chemistry
          </h3>
          <span className="mt-0.5 inline-block text-[10px] font-bold text-[var(--color-primary)]">
            #ExamPrep
          </span>
        </div>
      </div>

      {/* Timer Controls (Stitch Controls Bar) */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <button
          type="button"
          onClick={reset}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] transition-all hover:bg-slate-100 dark:bg-slate-900"
          title="Restart Session"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={isRunning ? pause : start}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-all hover:bg-[var(--color-primary-hover)] hover:scale-105 active:scale-95"
          title={isRunning ? 'Pause' : 'Start Focus'}
        >
          {isRunning ? (
            <Pause className="h-8 w-8 fill-white" />
          ) : (
            <Play className="h-8 w-8 fill-white ml-1" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            reset();
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] transition-all hover:bg-slate-100 dark:bg-slate-900"
          title="Skip to Next"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      {/* Soundscape Audio Bar */}
      <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 shadow-xs dark:bg-slate-900">
        <button
          type="button"
          onClick={toggleAudio}
          className={cn(
            'flex items-center gap-1.5 text-xs font-bold transition-all',
            isPlayingAudio ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]',
          )}
        >
          {isPlayingAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {isPlayingAudio ? 'Ambient Sound Playing' : 'Ambient Soundscape'}
        </button>

        <div className="h-4 w-[1px] bg-[var(--color-border)]" />

        <div className="flex gap-1">
          {(['rain', 'white-noise', 'deep-space', 'lofi-hum'] as const).map((snd) => (
            <button
              key={snd}
              type="button"
              onClick={() => changeSound(snd)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-bold capitalize transition-all',
                soundType === snd && isPlayingAudio
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
              )}
            >
              {snd.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
