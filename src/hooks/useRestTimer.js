// useRestTimer.js
// Date.now() se chalta hai, setInterval ke ticks gin ke nahi. Tab background me ho ya phone lock ho,
// wapas aane par time sahi dikhta hai.
//
// const { remaining, running, progress, start, pause, resume, addTime, reset } = useRestTimer(60, { onFinish });
// <button onClick={() => start(exercise.rest)}>Start rest</button>
import { useState, useRef, useEffect, useCallback } from 'react';

export default function useRestTimer(defaultSeconds = 60, { onFinish, vibrate = true } = {}) {
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState(defaultSeconds);

  const endRef = useRef(0);
  const pausedLeftRef = useRef(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const start = useCallback((seconds) => {
    const s = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : defaultSeconds;
    pausedLeftRef.current = null;
    endRef.current = Date.now() + s * 1000;
    setTotal(s);
    setRemaining(s);
    setRunning(true);
  }, [defaultSeconds]);

  const pause = useCallback(() => {
    if (!running) return;
    pausedLeftRef.current = Math.max(0, endRef.current - Date.now());
    setRunning(false);
  }, [running]);

  const resume = useCallback(() => {
    if (running || pausedLeftRef.current == null) return;
    endRef.current = Date.now() + pausedLeftRef.current;
    pausedLeftRef.current = null;
    setRunning(true);
  }, [running]);

  const addTime = useCallback((seconds = 15) => {
    if (running) {
      endRef.current += seconds * 1000;
    } else if (pausedLeftRef.current != null) {
      pausedLeftRef.current += seconds * 1000;
    }
    setTotal((t) => t + seconds);
    setRemaining((r) => r + seconds);
  }, [running]);

  const reset = useCallback(() => {
    pausedLeftRef.current = null;
    setRunning(false);
    setRemaining(defaultSeconds);
    setTotal(defaultSeconds);
  }, [defaultSeconds]);

  useEffect(() => {
    if (!running) return undefined;

    const tick = () => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        if (vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        if (onFinishRef.current) onFinishRef.current();
      }
    };

    tick();
    const id = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [running, vibrate]);

  const progress = total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 0;
  return { remaining, running, total, progress, start, pause, resume, addTime, reset };
}
