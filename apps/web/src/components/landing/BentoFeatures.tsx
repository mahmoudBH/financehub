'use client';

// ============================================
// LedgerFeatures — The Bank Ledger
// NOT a bento grid. An accordion-style
// sticky-scroll list that mimics a high-end
// physical bank ledger. Hovering reveals an
// inline preview. Clip-path reveals, not fades.
// ============================================

import { useState, useRef, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion';

// ── Feature entries ──────────────────────────
const features = [
  {
    id: 'analytics',
    index: '01',
    title: 'Real-time Analytics',
    subtitle: 'INTELLIGENCE',
    description:
      'Interactive Recharts dashboards with revenue tracking, spending breakdowns, and AI-powered financial insights. Every metric, visualized in real-time.',
    stat: '47 data points',
    color: '#DFFF00',
  },
  {
    id: 'cards',
    index: '02',
    title: '3D Virtual Cards',
    subtitle: 'INSTRUMENTS',
    description:
      'Physics-based interactive cards with tilt, glare, and flip animations. Create, freeze, and manage virtual instruments instantly.',
    stat: '∞ virtual cards',
    color: '#E5E4DF',
  },
  {
    id: 'transfers',
    index: '03',
    title: 'Instant Transfers',
    subtitle: 'SETTLEMENT',
    description:
      'Send money with 2FA/OTP verification, real-time validation, and a full cryptographic audit trail. Sub-second settlement.',
    stat: '<12ms latency',
    color: '#E5E4DF',
  },
  {
    id: 'vaults',
    index: '04',
    title: 'Smart Savings Vaults',
    subtitle: 'ALLOCATION',
    description:
      'Automated round-up savings, visual progress tracking, and AI-optimized goal targets. Your capital, working autonomously.',
    stat: '23% avg. increase',
    color: '#E5E4DF',
  },
  {
    id: 'security',
    index: '05',
    title: 'Enterprise Security',
    subtitle: 'PROTOCOL',
    description:
      'JWT rotation, bcrypt hashing, rate limiting, RBAC guards, session management, and full audit logs. Zero compromise.',
    stat: 'SOC2 compliant',
    color: '#E5E4DF',
  },
  {
    id: 'ai',
    index: '06',
    title: 'AI-Driven Insights',
    subtitle: 'COGNITION',
    description:
      'Spending pattern analysis, smart tips, anomaly detection, and automated financial health scoring. Intelligence at every layer.',
    stat: '3 ML models',
    color: '#DFFF00',
  },
];

// ── Individual Ledger Row ────────────────────
function LedgerRow({
  feature,
  isActive,
  onActivate,
}: {
  feature: (typeof features)[0];
  isActive: boolean;
  onActivate: () => void;
}) {
  return (
    <motion.div
      className="group cursor-pointer"
      onMouseEnter={onActivate}
      id={`feature-${feature.id}`}
    >
      {/* Row separator */}
      <div className="h-px w-full bg-[#E5E4DF]/[0.06]" />

      {/* Row content */}
      <div className="py-6 md:py-8 px-0 md:px-4">
        <div className="flex items-start gap-6 md:gap-12">
          {/* Index */}
          <span className="font-mono text-[11px] tracking-[0.2em] text-[#3A3A3A] pt-2 shrink-0 w-8">
            {feature.index}
          </span>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-4 md:gap-8 flex-wrap">
              {/* Title */}
              <motion.h3
                className="text-[clamp(1.5rem,3.5vw,3rem)] font-bold tracking-[-0.03em] leading-[1.1] transition-colors duration-300"
                style={{
                  color: isActive ? feature.color : '#4A4A4A',
                }}
              >
                {feature.title}
              </motion.h3>

              {/* Subtitle tag */}
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#3A3A3A] hidden md:inline">
                {feature.subtitle}
              </span>

              {/* Stat — right aligned */}
              <motion.span
                className="font-mono text-[11px] tracking-[0.1em] ml-auto hidden md:block"
                animate={{
                  color: isActive ? feature.color : '#2A2A2A',
                  opacity: isActive ? 1 : 0.4,
                }}
                transition={{ duration: 0.3 }}
              >
                {feature.stat}
              </motion.span>
            </div>

            {/* Expandable description — clip-path reveal */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
                  animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                  exit={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-[14px] leading-[1.8] text-[#7A7A7A] max-w-[600px] mt-4 pr-4">
                    {feature.description}
                  </p>

                  {/* Inline preview bar */}
                  <div className="mt-4 flex items-center gap-4">
                    <div
                      className="h-px flex-1"
                      style={{ backgroundColor: `${feature.color}20` }}
                    />
                    <span className="font-mono text-[8px] tracking-[0.3em] uppercase" style={{ color: feature.color }}>
                      ● Active
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Export ──────────────────────────────
export function LedgerFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const labelX = useTransform(scrollYProgress, [0, 1], [-100, 0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-32 md:py-48"
    >
      {/* ── Section Header — Editorial style ── */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="flex items-end gap-8"
        >
          {/* Vertical label — architectural */}
          <motion.div
            style={{ x: labelX }}
            className="hidden lg:flex items-center gap-4"
          >
            <div className="w-16 h-px bg-[#DFFF00]" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5A5A5A]">
              Feature Ledger
            </span>
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-[-0.04em] leading-[1.05] text-[#E5E4DF] mt-6"
        >
          Everything you need.
          <br />
          <span className="text-[#3A3A3A]">Nothing you don&apos;t.</span>
        </motion.h2>
      </div>

      {/* ── Ledger List ── */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-16">
        {features.map((feature, i) => (
          <LedgerRow
            key={feature.id}
            feature={feature}
            isActive={activeIndex === i}
            onActivate={() => setActiveIndex(i)}
          />
        ))}
        {/* Final separator */}
        <div className="h-px w-full bg-[#E5E4DF]/[0.06]" />
      </div>
    </section>
  );
}
