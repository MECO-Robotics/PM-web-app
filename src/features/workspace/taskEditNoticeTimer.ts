type TimerHandle = ReturnType<typeof globalThis.setTimeout>;
type TimerCallback = () => void;

export interface PausableTimeoutController {
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}

interface TimerClock {
  now: () => number;
  setTimeout: (callback: TimerCallback, delayMs: number) => TimerHandle;
  clearTimeout: (timeoutId: TimerHandle) => void;
}

const defaultClock: TimerClock = {
  now: () => Date.now(),
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (timeoutId) => globalThis.clearTimeout(timeoutId),
};

export function createPausableTimeout(
  callback: TimerCallback,
  delayMs: number,
  clock: TimerClock = defaultClock,
): PausableTimeoutController {
  let timeoutId: TimerHandle | null = null;
  let startedAt = clock.now();
  let remainingMs = delayMs;
  let isCancelled = false;
  let isPaused = false;

  const clearTimer = () => {
    if (timeoutId === null) {
      return;
    }

    clock.clearTimeout(timeoutId);
    timeoutId = null;
  };

  const finish = () => {
    timeoutId = null;
    isCancelled = true;
    isPaused = false;
    callback();
  };

  const schedule = (waitMs: number) => {
    clearTimer();
    startedAt = clock.now();
    timeoutId = clock.setTimeout(finish, waitMs);
  };

  schedule(delayMs);

  return {
    pause() {
      if (isCancelled || isPaused || timeoutId === null) {
        return;
      }

      remainingMs = Math.max(0, remainingMs - (clock.now() - startedAt));
      clearTimer();
      isPaused = true;
    },
    resume() {
      if (isCancelled || !isPaused) {
        return;
      }

      isPaused = false;

      if (remainingMs <= 0) {
        finish();
        return;
      }

      schedule(remainingMs);
    },
    cancel() {
      isCancelled = true;
      isPaused = false;
      clearTimer();
    },
  };
}
