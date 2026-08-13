import { describe, expect, it, beforeEach } from 'vitest';
import { usePomodoroStore } from '@/store/pomodoro.store';

describe('pomodoro store', () => {
  beforeEach(() => {
    usePomodoroStore.getState().reset();
    usePomodoroStore.setState({
      mode: 'work',
      durations: { work: 1500, 'short-break': 300, 'long-break': 900 },
      secondsLeft: 1500,
      totalSeconds: 1500,
      isRunning: false,
      targetEndTime: null,
    });
  });

  it('adjusts remaining time upwards and downwards correctly when idle', () => {
    const store = usePomodoroStore.getState();
    expect(store.secondsLeft).toBe(1500);

    store.adjustTime(300); // +5 min
    expect(usePomodoroStore.getState().secondsLeft).toBe(1800);
    expect(usePomodoroStore.getState().totalSeconds).toBe(1800);

    store.adjustTime(-600); // -10 min
    expect(usePomodoroStore.getState().secondsLeft).toBe(1200);
  });

  it('re-calculates targetEndTime accurately when adjusting time while running', () => {
    const store = usePomodoroStore.getState();
    store.start();

    const initialRunningState = usePomodoroStore.getState();
    expect(initialRunningState.isRunning).toBe(true);
    expect(initialRunningState.targetEndTime).not.toBeNull();

    const prevTargetEndTime = initialRunningState.targetEndTime!;
    
    // Add 60 seconds
    usePomodoroStore.getState().adjustTime(60);

    const updatedState = usePomodoroStore.getState();
    expect(updatedState.secondsLeft).toBe(1560);
    expect(updatedState.targetEndTime).toBeGreaterThanOrEqual(prevTargetEndTime + 50000);
  });

  it('allows customizing base mode durations', () => {
    const store = usePomodoroStore.getState();
    store.setCustomDuration('work', 30); // 30 minutes

    expect(usePomodoroStore.getState().durations.work).toBe(1800);
    expect(usePomodoroStore.getState().secondsLeft).toBe(1800);
  });

  it('clamps subtracted time to 0 seconds to prevent negative countdowns', () => {
    const store = usePomodoroStore.getState();
    store.adjustTime(-99999);

    expect(usePomodoroStore.getState().secondsLeft).toBe(0);
  });
});
