'use client';

// ============================================
// NoiseOverlay — Analog Film Grain
// Full-viewport SVG feTurbulence texture with
// randomized seed cycling at cinematic 6fps.
// mix-blend-mode: overlay for physical depth.
// ============================================

import { useEffect, useRef } from 'react';

export function NoiseOverlay() {
  const seedRef = useRef(0);
  const turbRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    let raf: number;
    let lastTime = 0;
    const FPS = 6; // cinematic grain flicker cadence
    const interval = 1000 / FPS;

    function tick(time: number) {
      raf = requestAnimationFrame(tick);
      if (time - lastTime < interval) return;
      lastTime = time;
      // Random seed creates organic non-repeating grain
      seedRef.current = Math.floor(Math.random() * 500);
      turbRef.current?.setAttribute('seed', String(seedRef.current));
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ opacity: 0.04, mixBlendMode: 'overlay' }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
      >
        <filter id="editorial-grain">
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
            seed="0"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#editorial-grain)"
        />
      </svg>
    </div>
  );
}
