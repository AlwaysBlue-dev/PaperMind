"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type CountUpProps = {
  value: number;
  duration?: number;
};

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
}

function AnimatedCount({ value, duration = 1500 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const start = performance.now();

        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

export function CountUp({ value, duration }: CountUpProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <span>{value.toLocaleString()}</span>;
  }

  return <AnimatedCount value={value} duration={duration} />;
}
