'use client';

// ============================================
// TechStack & Security — Architectural Grid
// Brutalist marquee for tech. Numbered list
// for security protocols. No bouncy cards,
// no rounded corners, no glassmorphism.
// ============================================

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ── Stack Items ──────────────────────────────
const stackItems = [
  { name: 'Next.js 14', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'TailwindCSS', category: 'Styling' },
  { name: 'Framer Motion', category: 'Animation' },
  { name: 'NestJS', category: 'Backend' },
  { name: 'Prisma ORM', category: 'Database' },
  { name: 'MySQL', category: 'Database' },
  { name: 'Redis', category: 'Cache' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'GitHub Actions', category: 'CI/CD' },
  { name: 'Swagger', category: 'API Docs' },
  { name: 'Turborepo', category: 'Monorepo' },
];

// ── Security Protocols ───────────────────────
const securityProtocols = [
  {
    index: '01',
    title: 'JWT + Refresh Token Rotation',
    description: 'Cryptographic token management with automatic rotation and secure httpOnly storage.',
  },
  {
    index: '02',
    title: '2FA / OTP Verification',
    description: 'Multi-factor authentication for transfers and high-sensitivity operations.',
  },
  {
    index: '03',
    title: 'Full Audit Trail',
    description: 'Every action logged with IP, user agent, and timestamp for compliance.',
  },
  {
    index: '04',
    title: 'RBAC Authorization',
    description: 'Role-based access control guards protecting every endpoint and resource.',
  },
  {
    index: '05',
    title: 'Rate Limiting & Helmet',
    description: '100 req/min throttling, security headers, CORS strict mode, and XSS protection.',
  },
  {
    index: '06',
    title: 'CI/CD Pipeline',
    description: 'Automated lint, type-check, build, and deploy workflows via GitHub Actions.',
  },
];

// ── Infinite Marquee Row ─────────────────────
function MarqueeRow({ direction = 1 }: { direction?: number }) {
  const items = [...stackItems, ...stackItems, ...stackItems]; // triple for seamless loop

  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
      <motion.div
        animate={{ x: direction > 0 ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="flex gap-0 shrink-0"
      >
        {items.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="flex items-center gap-4 px-8 py-4 border-r border-[#E5E4DF]/[0.04] whitespace-nowrap group hover:bg-[#E5E4DF]/[0.02] transition-colors duration-300"
          >
            <span className="text-[14px] font-semibold text-[#E5E4DF] tracking-tight group-hover:text-[#DFFF00] transition-colors duration-300">
              {item.name}
            </span>
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#3A3A3A]">
              {item.category}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Main Export ──────────────────────────────
export function TechStack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const lineWidth = useTransform(scrollYProgress, [0, 0.5], ['0%', '100%']);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="stack" className="relative py-32 md:py-48">
      {/* ── Tech Stack — Marquee ── */}
      <div className="mb-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-[#DFFF00]" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A]">
                Technology
              </span>
            </div>
            <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-[-0.04em] leading-[1.05] text-[#E5E4DF]">
              Enterprise-Grade
              <br />
              <span className="text-[#3A3A3A]">Architecture.</span>
            </h2>
          </motion.div>
        </div>

        {/* Full-width marquee — breaks container */}
        <div className="border-y border-[#E5E4DF]/[0.04] space-y-0">
          <MarqueeRow direction={1} />
          <div className="h-px bg-[#E5E4DF]/[0.04]" />
          <MarqueeRow direction={-1} />
        </div>
      </div>

      {/* ── Security Protocols — Numbered List ── */}
      <div id="security" className="max-w-[1600px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-[#E5E4DF]/20" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A]">
              Security Protocol
            </span>
          </div>
          <h2 className="text-[clamp(1.5rem,3vw,3rem)] font-bold tracking-[-0.03em] leading-[1.1] text-[#E5E4DF]">
            Bank-grade protection.
            <br />
            <span className="text-[#3A3A3A]">Zero compromise.</span>
          </h2>
        </motion.div>

        {/* Protocol grid — 2 columns, numbered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {securityProtocols.map((protocol, i) => (
            <motion.div
              key={protocol.index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.4 + i * 0.08,
                duration: 0.6,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="group border-b border-[#E5E4DF]/[0.04] py-8 pr-8 md:odd:border-r md:odd:pr-12 md:even:pl-12"
            >
              <div className="flex items-start gap-6">
                <span className="font-mono text-[11px] tracking-[0.2em] text-[#3A3A3A] pt-1 shrink-0">
                  {protocol.index}
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#E5E4DF] tracking-tight mb-2 group-hover:text-[#DFFF00] transition-colors duration-300">
                    {protocol.title}
                  </h3>
                  <p className="text-[13px] leading-[1.7] text-[#5A5A5A]">
                    {protocol.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll-driven reveal line */}
        <motion.div
          className="h-px bg-[#DFFF00] mt-12"
          style={{ width: lineWidth }}
        />
      </div>
    </section>
  );
}
