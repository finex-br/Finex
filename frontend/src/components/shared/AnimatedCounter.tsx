import { useEffect, useRef } from "react";
import {
  useMotionValue,
  useSpring,
  useInView,
  motion,
} from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  format,
  className,
  duration = 1.2,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 80,
    damping: 30,
    duration: duration * 1000,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format
          ? format(latest)
          : Math.round(latest).toLocaleString("pt-BR");
      }
    });
    return unsubscribe;
  }, [springValue, format]);

  return <motion.span ref={ref} className={className} />;
}
