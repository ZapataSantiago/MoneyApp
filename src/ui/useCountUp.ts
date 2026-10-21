import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Número que cuenta suavemente hasta `target`; inmediato si el sistema pide reducir movimiento. */
export function useCountUp(target: number, durationMs = 600): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    const from = shownRef.current;
    const set = (v: number) => {
      shownRef.current = v;
      setShown(v);
    };

    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce || from === target) return set(target);
      const start = Date.now();
      const step = () => {
        const t = Math.min((Date.now() - start) / durationMs, 1);
        set(Math.round(from + (target - from) * easeOutCubic(t)));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [target, durationMs]);

  return shown;
}
