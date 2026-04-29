'use client';

// ============================================
// TextScramble — Bloomberg Terminal Decoder
// Decodes text character-by-character from a
// random symbol set, like a live trading
// terminal resolving data from a feed.
//
// NumberTicker — Live Terminal Counter
// Counts up to a target number with linear
// ticker-tape cadence. Monospaced, no easing.
// ============================================

import { useEffect, useState, useCallback, useRef } from 'react';

// Terminal-grade character set — no cutesy symbols
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

interface TextScrambleProps {
  text: string;
  /** Delay before scramble starts (ms) */
  delay?: number;
  /** How fast each character resolves (ms per tick) */
  speed?: number;
  className?: string;
  /** If true, starts the animation */
  trigger?: boolean;
  /** Character to show before reveal */
  placeholder?: string;
}

export function TextScramble({
  text,
  delay = 0,
  speed = 30,
  className = '',
  trigger = true,
  placeholder = '█',
}: TextScrambleProps) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);

  const scramble = useCallback(() => {
    let iteration = 0;
    const target = text;
    const totalLength = target.length;

    const interval = setInterval(() => {
      setDisplayed(
        target
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iteration) return target[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      iteration += 0.5; // resolves ~2 ticks per character

      if (iteration >= totalLength) {
        setDisplayed(target);
        setComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    if (!trigger || started) return;
    const timer = setTimeout(() => {
      setStarted(true);
      scramble();
    }, delay);
    return () => clearTimeout(timer);
  }, [trigger, started, delay, scramble]);

  // Before trigger, show block placeholder
  if (!started) {
    return (
      <span className={className} aria-label={text}>
        {text
          .split('')
          .map((c) => (c === ' ' ? ' ' : placeholder))
          .join('')}
      </span>
    );
  }

  return (
    <span className={className} aria-label={text}>
      {displayed.split('').map((char, i) => (
        <span
          key={i}
          style={{
            opacity: complete || i < displayed.length * 0.7 ? 1 : 0.6,
            transition: 'opacity 0.1s',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// ============================================
// NumberTicker — Terminal-Grade Counter
// ============================================

interface NumberTickerProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
  trigger?: boolean;
  /** Number of decimal places */
  decimals?: number;
}

export function NumberTicker({
  target,
  suffix = '',
  prefix = '',
  duration = 1800,
  delay = 0,
  className = '',
  trigger = true,
  decimals = 0,
}: NumberTickerProps) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!trigger) return;
    const timer = setTimeout(() => {
      const startTime = performance.now();

      function tick(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Linear — no easing, like a real counter
        const current = progress * target;
        setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setValue(target);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trigger, target, duration, delay, decimals]);

  const formatted = decimals > 0 ? value.toFixed(decimals) : value.toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
