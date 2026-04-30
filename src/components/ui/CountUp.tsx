"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";

export interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  decimals?: number;
}

export function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  decimals = 0,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);

  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  const isInView = useInView(ref, { once: true, margin: "-10px" });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(direction === "down" ? from : to);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, motionValue, to, from, delay, direction]);

  useMotionValueEvent(springValue, "change", (latest) => {
    if (ref.current) {
      ref.current.textContent = Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(Number(latest.toFixed(decimals)));
    }
  });

  return <span className={className} ref={ref} />;
}
