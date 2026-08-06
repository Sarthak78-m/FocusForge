import { usePomodoro, type PomodoroMode } from '@/hooks/usePomodoro';
import { cn } from '@/utils/cn';

const MODES: { value: PomodoroMode; label: string; minutes: number }[] = [
  { value: 'work', label: 'Focus', minutes: 25 },
  { value: 'short-break', label: 'Short break', minutes: 5 },
  { value: 'long-break', label: 'Long break', minutes: 15 },
];

const MODE_COLORS: Record<PomodoroMode, string> = {
  work: '#EC6530',          // Primary Coral
  'short-break': '#2DA7AE',  // Accent Teal
  'long-break': '#FFAE6E',   // Secondary Peach
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
        className="text-[var(--color-border)]"
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
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Pomodoro</h1>
        <p className="mt-0.5 text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">
          Focus timer — stay in the zone
        </p>
      </div>

      <div className="mx-auto max-w-lg">
        {/* Mode tabs */}
        <div className="mb-8 flex rounded-2xl border border-[var(--color-border)] bg-white p-1.5 shadow-soft dark:bg-[var(--color-surface)]">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                'flex flex-1 flex-col items-center rounded-xl px-3 py-2.5 text-center transition-all duration-200',
                mode === m.value
                  ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-950 dark:text-primary-300 font-semibold'
                  : 'text-text-secondary hover:bg-primary-50/50 hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)] dark:hover:bg-primary-950/50',
              )}
            >
              <span className="text-xs font-medium">{m.label}</span>
              <span className="mt-0.5 text-xs opacity-75">{m.minutes} min</span>
            </button>
          ))}
        </div>

        {/* Timer display */}
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <TimerRing progress={progress} mode={mode} size={256} />
            <div className="absolute flex flex-col items-center">
              <span
                className="text-5xl font-mono font-semibold tracking-tight text-[var(--color-text-primary)]"
                aria-live="polite"
                aria-atomic="true"
              >
                {display}
              </span>
              <span className="mt-1 text-sm font-medium text-text-secondary dark:text-[var(--color-text-secondary)]">
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
                  'h-2.5 w-2.5 rounded-full transition-colors',
                  i < dotsCompleted
                    ? 'bg-primary-500 shadow-sm'
                    : 'bg-[var(--color-border)]',
                )}
              />
            ))}
          </div>

          <p className="mt-2 text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
            {sessionCount} sessions completed · Long break every {SESSION_DOTS}
          </p>

          {/* Controls */}
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all duration-200 hover:bg-primary-50 dark:bg-[var(--color-surface)] dark:hover:bg-primary-950"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={isRunning ? pause : start}
              className={cn(
                'min-w-[120px] rounded-xl px-8 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:shadow-md active:scale-95',
                isRunning
                  ? 'bg-text-primary hover:opacity-90'
                  : 'bg-primary-500 hover:bg-primary-600',
              )}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-soft dark:bg-[var(--color-surface)]">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-text-secondary dark:text-[var(--color-text-secondary)]">
            How it works
          </p>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Start a 25-minute Focus session.' },
              { step: '2', text: 'Take a 5-minute Short break.' },
              { step: '3', text: 'Repeat. After 4 sessions, take a 15-minute Long break.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-primary-300 text-xs font-medium text-primary-600 dark:border-primary-700 dark:text-primary-400">
                  {s.step}
                </span>
                <p className="text-sm text-[var(--color-text-primary)]">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
