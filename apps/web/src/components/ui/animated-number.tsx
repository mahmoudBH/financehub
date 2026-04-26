'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  currency?: string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  currency = 'EUR',
  duration = 1.2,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 100,
    duration: duration * 1000,
  });
  const [displayValue, setDisplayValue] = useState('0.00');

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      const formatted = new Intl.NumberFormat('en-EU', {
        style: currency ? 'currency' : 'decimal',
        currency: currency || undefined,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(latest);
      setDisplayValue(formatted);
    });
    return unsubscribe;
  }, [springValue, currency]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}

// Simple animated percentage
export function AnimatedPercent({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 40, stiffness: 100 });
  const [display, setDisplay] = useState('0.0');

  useEffect(() => { motionValue.set(value); }, [value, motionValue]);
  useEffect(() => {
    const unsub = springValue.on('change', (v) => setDisplay(v.toFixed(1)));
    return unsub;
  }, [springValue]);

  return <span className={className}>{display}%</span>;
}
