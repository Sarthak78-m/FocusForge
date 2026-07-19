import { usePomodoro, type PomodoroMode } from '@/hooks/usePomodoro';
import { cn } from '@/utils/cn';

const MODES: { value: PomodoroMode; label: string; minutes: number }[] = [
  { value: 'work', label: 'Focus', minutes: 25 },
  { value: 'short-break', label: 'Short break', minutes: 5 },
  { value: 'long-break', label: 'Long break', minutes: 15 },
];

const MODE_COLORS: Record<PomodoroMode, string> = {
  work: '#4f46e5',           // indigo-600
  'short-break': '#059669',  // emerald-600
  'long-break': '#0284c7',   // sky-600
};

function TimerRing({
  progress,
  mode,
  size = 240,
}: {
  progress: number;
  mode: PomodoroMode;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const color = MODE_COLORS[mode];

  return (
    <svg width={size} height={size} className="rotate-[-90deg]" aria-hidden="true">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-stone-200 dark:text-stone-800"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
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

  const dotsCompleted = sessionCount % SESSION_DOTS;
  const currentModeConfig = MODES.find((m) => m.value === mode)!;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-stone-900 dark:text-white">Pomodoro</h1>
        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
          Focus timer — stay in the zone
        </p>
      </div>

      <div className="mx-auto max-w-lg">
        {/* Mode tabs */}
        <div className="mb-8 flex rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-950">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                'flex flex-1 flex-col items-center rounded-lg px-3 py-2 text-center transition-colors',
                mode === m.value
                  ? 'bg-stone-100 dark:bg-stone-800'
                  : 'hover:bg-stone-50 dark:hover:bg-stone-900',
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium',
                  mode === m.value
                    ? 'text-stone-900 dark:text-white'
                    : 'text-stone-500 dark:text-stone-400',
                )}
              >
                {m.label}
              </span>
              <span className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                {m.minutes} min
              </span>
            </button>
          ))}
        </div>

        {/* Timer display */}
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <TimerRing progress={progress} mode={mode} size={256} />
            <div className="absolute flex flex-col items-center">
              <span
                className="text-5xl font-mono font-semibold tracking-tight text-stone-900 dark:text-white"
                aria-live="polite"
                aria-atomic="true"
              >
                {display}
              </span>
              <span className="mt-1 text-sm font-medium text-stone-500 dark:text-stone-400">
                {currentModeConfig.label}
              </span>
            </div>
          </div>

          {/* Session dots */}
          <div className="mt-6 flex items-center gap-2" aria-label={`${dotsCompleted} of ${SESSION_DOTS} sessions done`}>
            {Array.from({ length: SESSION_DOTS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  i < dotsCompleted
                    ? 'bg-indigo-500'
                    : 'bg-stone-200 dark:bg-stone-700',
                )}
              />
            ))}
          </div>

          <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
            {sessionCount} sessions completed · Long break every {SESSION_DOTS}
          </p>

          {/* Controls */}
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:bg-stone-900"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={isRunning ? pause : start}
              className={cn(
                'min-w-[120px] rounded-xl px-8 py-2.5 text-sm font-medium text-white transition-colors',
                isRunning
                  ? 'bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500'
                  : 'bg-indigo-600 hover:bg-indigo-700',
              )}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
            How it works
          </p>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Start a 25-minute Focus session.' },
              { step: '2', text: 'Take a 5-minute Short break.' },
              { step: '3', text: 'Repeat. After 4 sessions, take a 15-minute Long break.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-stone-200 text-xs font-medium text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  {s.step}
                </span>
                <p className="text-sm text-stone-600 dark:text-stone-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
