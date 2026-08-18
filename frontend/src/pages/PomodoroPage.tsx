import { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Volume2,
  VolumeX,
  Flame,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Sliders,
  Check,
  Edit3,
  Music,
  Upload,
  Trash2,
  Square,
  Sparkles,
  Plus,
} from 'lucide-react';
import { usePomodoro, type PomodoroMode } from '@/hooks/usePomodoro';
import { useTasks, useCompleteTask } from '@/hooks/useTasks';
import {
  soundscapes,
  CURATED_MP3_TRACKS,
  type StudyTrack,
  type CustomMp3Track,
  getStoredCustomTracks,
  saveCustomLocalTrack,
  deleteCustomTrack,
} from '@/utils/soundscapes';
import { FocusModeOverlay } from '@/components/pomodoro/FocusModeOverlay';
import { useNotificationStore } from '@/store/notification.store';
import { cn } from '@/utils/cn';

const MODE_DEFS: { value: PomodoroMode; label: string; defaultMinutes: number }[] = [
  { value: 'work', label: 'Deep Focus', defaultMinutes: 25 },
  { value: 'short-break', label: 'Short Break', defaultMinutes: 5 },
  { value: 'long-break', label: 'Long Rest', defaultMinutes: 15 },
];

const PRESETS = [
  { name: 'Classic 25/5', work: 25, short: 5, long: 15 },
  { name: 'Extended 50/10', work: 50, short: 10, long: 20 },
  { name: 'Deep Work 90/20', work: 90, short: 15, long: 30 },
  { name: 'Quick Sprint 15/3', work: 15, short: 3, long: 10 },
];

function DynamicTimerRing({ progress, isRunning, size = 320 }: { progress: number; isRunning: boolean; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient wave when running */}
      {isRunning && (
        <div
          className="absolute inset-0 rounded-full animate-pulse opacity-20 bg-[var(--color-primary)] scale-105"
          style={{ transition: 'transform 1s ease' }}
        />
      )}

      <svg width={size} height={size} className="rotate-[-90deg] transform select-none" aria-hidden="true">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-secondary)"
          strokeWidth={strokeWidth}
        />
        {/* Active Progress Ring */}
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
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
    </div>
  );
}

function formatAudioTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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

  const { data: tasksData } = useTasks({ status: 'TODO', size: 20 });
  const { mutate: completeTask } = useCompleteTask();
  const pendingTasks = tasksData?.content ?? [];
  const notify = useNotificationStore((s) => s.notify);

  // Active task selection
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const selectedTask = pendingTasks.find((t) => t.id === selectedTaskId);

  // Audio Engine Reactive State
  const [audioState, setAudioState] = useState({
    isPlaying: soundscapes.isPlaying,
    activeId: soundscapes.activeId,
    activeName: soundscapes.activeName,
    volume: soundscapes.volume,
    currentTime: soundscapes.currentTime,
    duration: soundscapes.duration,
  });
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  // Offline Custom Tracks State
  const [customTracks, setCustomTracks] = useState<CustomMp3Track[]>([]);
  const [isUploadingTrack, setIsUploadingTrack] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings & overlays
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Direct Click-to-Edit Custom Time State
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutesInput, setEditMinutesInput] = useState('');

  // Brain dump scratchpad
  const [scratchpad, setScratchpad] = useState('');

  const sessionNumber = (sessionCount % 4) + 1;

  // Subscribe to audio engine changes
  useEffect(() => {
    const unsubscribe = soundscapes.subscribe(() => {
      setAudioState({
        isPlaying: soundscapes.isPlaying,
        activeId: soundscapes.activeId,
        activeName: soundscapes.activeName,
        volume: soundscapes.volume,
        currentTime: soundscapes.currentTime,
        duration: soundscapes.duration,
      });
    });
    return unsubscribe;
  }, []);

  // Load custom tracks from IndexedDB
  useEffect(() => {
    getStoredCustomTracks().then(setCustomTracks);
  }, []);

  // Upload local offline audio file (MP3/WAV)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (customTracks.length >= 5) {
      notify({
        title: 'Offline Limit Reached',
        message: 'You can save up to 5 offline songs. Delete an existing track to add a new one.',
        tone: 'warning',
      });
      return;
    }

    setIsUploadingTrack(true);
    try {
      const saved = await saveCustomLocalTrack(file);
      setCustomTracks((prev) => [...prev, saved]);
      notify({
        title: 'Song Saved Offline 🎵',
        message: `"${saved.name}" stored for offline study focus.`,
        tone: 'success',
      });
    } catch (err: any) {
      notify({
        title: 'Upload Failed',
        message: err?.message || 'Could not save audio file.',
        tone: 'error',
      });
    } finally {
      setIsUploadingTrack(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete custom track
  const handleDeleteTrack = async (id: string, name: string) => {
    if (audioState.isPlaying && audioState.activeId === id) {
      soundscapes.stopAll();
    }
    await deleteCustomTrack(id);
    setCustomTracks((prev) => prev.filter((t) => t.id !== id));
    notify({
      title: 'Track Removed',
      message: `"${name}" removed from offline storage.`,
      tone: 'info',
    });
  };

  // Master Common Audio Toggle (Play default track or Stop All)
  const handleMasterAudioToggle = () => {
    if (audioState.isPlaying) {
      soundscapes.stopAll();
    } else {
      soundscapes.playCurated(CURATED_MP3_TRACKS[0]);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setCustomDuration('work', preset.work);
    setCustomDuration('short-break', preset.short);
    setCustomDuration('long-break', preset.long);
  };

  const handleStartEditingTime = () => {
    const currentMins = Math.round((durations[mode] || 1500) / 60);
    setEditMinutesInput(String(currentMins));
    setIsEditingTime(true);
  };

  const handleSaveCustomTime = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(editMinutesInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      setCustomDuration(mode, parsed);
    }
    setIsEditingTime(false);
  };

  const handleTaskComplete = (taskId: number) => {
    completeTask(taskId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      {/* Fullscreen Overlay */}
      <FocusModeOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)]">
            <span>Session {sessionNumber} of 4</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
            <Flame className="h-3.5 w-3.5 fill-[var(--color-primary)] text-[var(--color-primary)]" />
            <span>{sessionCount} Sprints Logged</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Master Common Audio Toggle Button */}
          <button
            type="button"
            onClick={handleMasterAudioToggle}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors border border-[var(--color-border)]',
              audioState.isPlaying
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
            )}
            title="Common Master Audio Toggle (Play / Stop All)"
          >
            {audioState.isPlaying ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{audioState.isPlaying ? 'Stop Audio' : 'Study MP3 Music'}</span>
          </button>

          {/* Settings button */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Configure Timers"
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={() => setIsOverlayOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-xs"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-xs">
          {MODE_DEFS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => {
                setMode(m.value);
                setIsEditingTime(false);
              }}
              className={cn(
                'rounded-md px-4 py-1.5 text-xs font-semibold transition-colors',
                mode === m.value
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Presets & Settings Panel */}
      {showSettings && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Quick Timer Presets
            </h3>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-2xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-left hover:border-[var(--color-primary)] transition-colors"
              >
                <div className="text-xs font-bold text-[var(--color-text-primary)]">{p.name}</div>
                <div className="text-2xs text-[var(--color-text-secondary)] mt-0.5">
                  {p.work}m focus · {p.short}m rest
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--color-border)]">
            <h4 className="text-xs font-bold text-[var(--color-text-secondary)] mb-2">
              Custom Interval Durations (Minutes)
            </h4>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {MODE_DEFS.map((m) => {
                const mins = Math.round((durations[m.value] || 1500) / 60);
                return (
                  <div key={m.value} className="p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-container)] space-y-1">
                    <label className="text-2xs font-semibold text-[var(--color-text-secondary)]">{m.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={mins}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) setCustomDuration(m.value, val);
                        }}
                        className="w-full h-7 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs font-bold text-center text-[var(--color-text-primary)]"
                      />
                      <span className="text-xs text-[var(--color-text-tertiary)]">min</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Timer Display Section */}
      <div className="flex flex-col items-center justify-center py-6 space-y-6">
        {/* Dynamic Timer Ring with Click-to-Customize Time */}
        <div className="relative flex items-center justify-center">
          <DynamicTimerRing progress={progress} isRunning={isRunning} size={300} />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isEditingTime ? (
              <form onSubmit={handleSaveCustomTime} className="flex flex-col items-center gap-2 z-20">
                <div className="flex items-center gap-1.5 bg-[var(--color-surface-secondary)] border-2 border-[var(--color-primary)] rounded-lg px-3 py-1 shadow-sm">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={editMinutesInput}
                    onChange={(e) => setEditMinutesInput(e.target.value)}
                    autoFocus
                    onBlur={() => handleSaveCustomTime()}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsEditingTime(false);
                    }}
                    className="w-20 text-4xl sm:text-5xl font-mono font-bold text-center bg-transparent text-[var(--color-text-primary)] focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[var(--color-primary)]">min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    className="h-6 px-3 rounded bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 shadow-xs"
                  >
                    Set Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTime(false)}
                    className="h-6 px-2.5 rounded border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div
                onClick={handleStartEditingTime}
                className="group flex flex-col items-center cursor-pointer select-none px-4 py-2 rounded-2xl transition-all hover:bg-[var(--color-surface-secondary)]/60"
                title="Click to customize time duration"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                    {display}
                  </span>
                  <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-70 text-[var(--color-primary)] transition-opacity" />
                </div>
                <span className="text-2xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mt-1 group-hover:text-[var(--color-primary)] transition-colors">
                  {mode === 'work' ? 'Deep Work Focus' : mode === 'short-break' ? 'Short Recovery Rest' : 'Long Recharging Rest'}
                </span>
                <span className="text-[10px] text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to edit minutes
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 4-Cycle Session Dots Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((dotIndex) => (
            <div
              key={dotIndex}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                sessionNumber === dotIndex && isRunning
                  ? 'w-6 bg-[var(--color-primary)]'
                  : sessionNumber >= dotIndex
                  ? 'w-2 bg-[var(--color-primary)]'
                  : 'w-2 bg-[var(--color-surface-secondary)] border border-[var(--color-border)]'
              )}
              title={`Focus Cycle ${dotIndex} of 4`}
            />
          ))}
        </div>

        {/* Main Play / Pause Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors shadow-xs"
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={isRunning ? pause : start}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-all shadow-md active:scale-95"
            title={isRunning ? 'Pause Timer' : 'Start Focus Sprint'}
          >
            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              const nextMode: PomodoroMode = mode === 'work' ? 'short-break' : 'work';
              setMode(nextMode);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors shadow-xs"
            title="Skip to Next Phase"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Task Binding + MP3 Focus Audio Player */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column 1: Bound Task Card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Focus on a Study Task
            </h3>
            {selectedTask && (
              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className="text-2xs text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
              >
                Clear Task
              </button>
            )}
          </div>

          {selectedTask ? (
            <div className="p-3 rounded-lg border border-[var(--color-primary)]/40 bg-[var(--color-primary-light)] flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-2xs font-bold text-[var(--color-primary)] uppercase">Active Objective</span>
                <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate mt-0.5">
                  {selectedTask.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTaskComplete(selectedTask.id)}
                className="flex items-center gap-1 h-7 px-2.5 rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark Done</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Select a task from your workspace to tie directly to this session:
              </p>
              {pendingTasks.length === 0 ? (
                <p className="text-2xs text-[var(--color-text-tertiary)] italic p-2 border border-dashed border-[var(--color-border)] rounded-md text-center">
                  No pending tasks. Create one in Tasks Studio.
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {pendingTasks.slice(0, 4).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className="w-full flex items-center justify-between p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-left hover:border-[var(--color-primary)] transition-colors"
                    >
                      <span className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                        {task.title}
                      </span>
                      <span className="text-2xs text-[var(--color-primary)] font-semibold flex-none ml-2">
                        Focus this →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Brain Dump Scratchpad */}
          <div className="pt-2 border-t border-[var(--color-border)] space-y-1">
            <label className="text-2xs font-semibold text-[var(--color-text-tertiary)] uppercase">
              Distraction Brain Dump (Saved Locally)
            </label>
            <input
              type="text"
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              placeholder="Jot stray thoughts here so you don't lose focus..."
              className="w-full h-8 px-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-strong)]"
            />
          </div>
        </div>

        {/* Column 2: Pure MP3 Study Tracks & Offline Saved Audio */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs space-y-4">
          {/* Header with Master Stop/Play Toggle */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Focus MP3 Audio & Saved Music
                </h3>
              </div>
              {audioState.isPlaying && (
                <div className="flex items-center gap-1.5 text-2xs font-bold text-[var(--color-primary)] mt-0.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-primary)] animate-ping" />
                  <span className="truncate">Playing: {audioState.activeName}</span>
                </div>
              )}
            </div>

            {/* Common Master Stop / Play Toggle */}
            <button
              type="button"
              onClick={handleMasterAudioToggle}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors border',
                audioState.isPlaying
                  ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                  : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {audioState.isPlaying ? <Square className="h-3 w-3 fill-rose-600 text-rose-600" /> : <Play className="h-3 w-3" />}
              <span>{audioState.isPlaying ? 'Stop Audio' : 'Start Audio'}</span>
            </button>
          </div>

          {/* Master Volume Slider */}
          <div className="flex items-center gap-2">
            <Volume2 className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={audioState.volume}
              onChange={(e) => soundscapes.setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-[var(--color-surface-secondary)] rounded-lg accent-[var(--color-primary)] cursor-pointer"
              title="Master Audio Volume"
            />
            <span className="text-2xs font-mono text-[var(--color-text-tertiary)] w-8 text-right">
              {Math.round(audioState.volume * 100)}%
            </span>
          </div>

          {/* Audio Seek Slider */}
          {audioState.isPlaying && audioState.duration > 0 && audioState.duration !== Infinity && (
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono text-[var(--color-text-tertiary)] w-8 text-right">
                {formatAudioTime(scrubTime !== null ? scrubTime : audioState.currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={audioState.duration}
                step={1}
                value={scrubTime !== null ? scrubTime : audioState.currentTime}
                onChange={(e) => setScrubTime(parseFloat(e.target.value))}
                onMouseUp={(e) => {
                  soundscapes.seek(parseFloat(e.currentTarget.value));
                  setScrubTime(null);
                }}
                onTouchEnd={(e) => {
                  soundscapes.seek(parseFloat(e.currentTarget.value));
                  setScrubTime(null);
                }}
                className="w-full h-1 bg-[var(--color-surface-secondary)] rounded-lg accent-[var(--color-primary)] cursor-pointer"
                title="Seek Audio Position"
              />
              <span className="text-2xs font-mono text-[var(--color-text-tertiary)] w-8 text-left">
                {formatAudioTime(audioState.duration)}
              </span>
            </div>
          )}

          {/* 1. Curated Copyright-Free MP3 Study Tracks */}
          <div className="space-y-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Calming MP3 Study Music
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CURATED_MP3_TRACKS.map((t) => {
                const isCurrentPlaying = audioState.isPlaying && audioState.activeId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => soundscapes.togglePlayCurated(t)}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg border text-left transition-all',
                      isCurrentPlaying
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-xs'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]'
                    )}
                  >
                    <div className="min-w-0 pr-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{t.icon}</span>
                        <span className="text-xs font-semibold truncate text-[var(--color-text-primary)]">
                          {t.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] truncate mt-0.5">
                        {t.subtitle}
                      </p>
                    </div>

                    <div
                      className={cn(
                        'flex h-6 w-6 flex-none items-center justify-center rounded-full transition-colors',
                        isCurrentPlaying
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                      )}
                    >
                      {isCurrentPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. My Saved Offline MP3 Songs (Max 5 tracks) */}
          <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                <span className="text-2xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  My Offline MP3 Songs ({customTracks.length}/5 Saved)
                </span>
              </div>

              {/* Hidden file input & upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={customTracks.length >= 5 || isUploadingTrack}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={customTracks.length >= 5 || isUploadingTrack}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <Upload className="h-3 w-3" />
                <span>{isUploadingTrack ? 'Saving...' : '+ Upload MP3'}</span>
              </button>
            </div>

            {customTracks.length === 0 ? (
              <div className="p-3 border border-dashed border-[var(--color-border)] rounded-lg text-center space-y-1">
                <p className="text-2xs text-[var(--color-text-secondary)]">
                  No offline songs added yet.
                </p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  Upload up to 5 favorite MP3/WAV tracks to listen offline anytime during your study sessions.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {customTracks.map((track) => {
                  const isTrackPlaying = audioState.isPlaying && audioState.activeId === track.id;
                  return (
                    <div
                      key={track.id}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-lg border text-xs transition-all',
                        isTrackPlaying
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]'
                      )}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <Music className="h-3.5 w-3.5 flex-none text-[var(--color-primary)]" />
                          <span className="font-semibold truncate">{track.name}</span>
                        </div>
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                          {track.sizeFormatted} · Saved Offline
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-none">
                        {/* Play/Stop Individual Track */}
                        <button
                          type="button"
                          onClick={() => soundscapes.togglePlayCustom(track)}
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                            isTrackPlaying
                              ? 'bg-[var(--color-primary)] text-white'
                              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
                          )}
                          title={isTrackPlaying ? 'Stop Track' : 'Play Track'}
                        >
                          {isTrackPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
                        </button>

                        {/* Delete Track */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTrack(track.id, track.name)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-text-tertiary)] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete from offline storage"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
