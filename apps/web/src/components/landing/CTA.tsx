'use client';

// ============================================
// GrandCTA — The Close
// Massive typographic statement. No gradient
// mesh. No radial blurs. Architectural space.
// Single magnetic CTA in Electric Chartreuse.
//
// Footer — Minimal Architectural
// A single horizontal rule. Credits. Done.
// ============================================

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { TextScramble } from './TextScramble';
import { MagneticButton } from './MagneticButton';

export function GrandCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const scaleText = useTransform(scrollYProgress, [0.2, 0.5], [0.9, 1]);
  const opacityText = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-48 overflow-hidden"
      id="cta"
    >
      {/* Architectural grid background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(90deg, rgba(229,228,223,0.02) 1px, transparent 1px),
          linear-gradient(0deg, rgba(229,228,223,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-16">
        {/* ── Eyebrow ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="w-16 h-px bg-[#DFFF00]" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A]">
            Begin
          </span>
        </motion.div>

        {/* ── Massive Headline ── */}
        <motion.div style={{ scale: scaleText, opacity: opacityText }}>
          <h2 className="text-[clamp(2.5rem,8vw,8rem)] font-extrabold tracking-[-0.05em] leading-[0.9] mb-8">
            <span className="block text-[#E5E4DF]">
              <TextScramble
                text="STOP"
                delay={200}
                speed={40}
                trigger={inView}
              />
            </span>
            <span className="block text-[#3A3A3A]">
              <TextScramble
                text="SIMULATING."
                delay={500}
                speed={40}
                trigger={inView}
              />
            </span>
            <span className="block text-[#DFFF00]">
              <TextScramble
                text="START BUILDING."
                delay={900}
                speed={35}
                trigger={inView}
              />
            </span>
          </h2>
        </motion.div>

        {/* ── Subtext ── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.4, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="text-[15px] leading-[1.8] text-[#5A5A5A] max-w-[500px] mb-12"
        >
          FinanceHub is open-source and ready for your portfolio.
          Fork it, customize it, make it yours.
        </motion.p>

        {/* ── CTA Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.8, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="flex items-center gap-2 flex-wrap -ml-14"
        >
          <MagneticButton variant="accent" href="/signup">
            Create Account
          </MagneticButton>
          <MagneticButton variant="outline" href="https://github.com">
            View Source ↗
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// Footer — Architectural Minimum
// ============================================

export function Footer() {
  return (
    <footer className="relative" id="footer">
      {/* Top rule */}
      <div className="h-px w-full bg-[#E5E4DF]/[0.06]" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-16 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* ── Brand mark ── */}
          <div className="flex items-center gap-0">
            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#E5E4DF]">
              Finance
            </span>
            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#DFFF00]">
              Hub
            </span>
            <span className="text-[#DFFF00] text-lg leading-none ml-0.5">.</span>
          </div>

          {/* ── Links ── */}
          <div className="flex items-center gap-8">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Architecture', href: '#stack' },
              { label: 'Protocol', href: '#security' },
              { label: 'Demo', href: '/login' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A] hover:text-[#E5E4DF] transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* ── Credit ── */}
          <p className="font-mono text-[10px] tracking-[0.15em] text-[#3A3A3A]">
            Designed & built by{' '}
            <span className="text-[#6A6A6A]">Mahmoud Bousbih</span>
          </p>
        </div>
      </div>

      {/* Bottom rule */}
      <div className="h-px w-full bg-[#E5E4DF]/[0.04]" />
    </footer>
  );
}
