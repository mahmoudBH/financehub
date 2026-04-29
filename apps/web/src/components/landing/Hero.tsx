'use client';

// ============================================
// Hero — The Terminal
// Character-by-character decode. Interactive
// SVG data visualization that reacts to cursor
// proximity. Scroll-velocity-driven skew.
// No floating 3D card. No radial gradients.
// No glassmorphism. Pure architecture.
// ============================================

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useVelocity,
  type MotionValue,
} from 'framer-motion';
import { TextScramble, NumberTicker } from './TextScramble';
import { MagneticButton } from './MagneticButton';

// ── Interactive Data Mesh ────────────────────
// Pure SVG + Framer Motion. Reacts to cursor.
function DataVisualization() {
  const svgRef = useRef<SVGSVGElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const [points, setPoints] = useState<{ x: number; y: number; baseX: number; baseY: number }[]>([]);

  // Generate grid points
  useEffect(() => {
    const cols = 12;
    const rows = 8;
    const pts: typeof points = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c / (cols - 1)) * 100;
        const y = (r / (rows - 1)) * 100;
        pts.push({ x, y, baseX: x, baseY: y });
      }
    }
    setPoints(pts);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  // Build path data for the animated mesh lines
  const pathData = points.length > 0
    ? generateMeshPaths(points, 12, 8)
    : '';

  return (
    <div className="relative w-full aspect-[16/10]">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        style={{ overflow: 'visible' }}
      >
        {/* Grid mesh lines */}
        <motion.g opacity={0.15}>
          {pathData.split('|||').filter(Boolean).map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke="#E5E4DF"
              strokeWidth="0.15"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.02, ease: [0.76, 0, 0.24, 1] }}
            />
          ))}
        </motion.g>

        {/* Data points */}
        {points.map((pt, i) => (
          <DataPoint key={i} pt={pt} index={i} mouseX={mouseX} mouseY={mouseY} />
        ))}

        {/* Accent pulse at center */}
        <motion.circle
          cx="50"
          cy="50"
          r="1.5"
          fill="#DFFF00"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0.8, 0.3, 0.8], scale: [1, 1.5, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        />

        {/* Animated scan line */}
        <motion.line
          x1="0"
          y1="0"
          x2="100"
          y2="0"
          stroke="#DFFF00"
          strokeWidth="0.2"
          opacity={0.3}
          initial={{ y1: 0, y2: 0 }}
          animate={{ y1: [0, 100, 0], y2: [0, 100, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* Corner coordinates — terminal aesthetic */}
      <div className="absolute top-0 left-0 font-mono text-[8px] text-[#3A3A3A] tracking-widest">
        0,0
      </div>
      <div className="absolute top-0 right-0 font-mono text-[8px] text-[#3A3A3A] tracking-widest">
        1920,0
      </div>
      <div className="absolute bottom-0 left-0 font-mono text-[8px] text-[#3A3A3A] tracking-widest">
        0,1080
      </div>
      <div className="absolute bottom-0 right-0 font-mono text-[8px] text-[#DFFF00]/40 tracking-widest">
        LIVE
      </div>
    </div>
  );
}

// Individual data point that reacts to cursor proximity
function DataPoint({
  pt,
  index,
  mouseX,
  mouseY,
}: {
  pt: { x: number; y: number };
  index: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.25);

  useEffect(() => {
    const unsubX = mouseX.on('change', () => {
      const mx = mouseX.get() * 100;
      const my = mouseY.get() * 100;
      const dist = Math.sqrt((pt.x - mx) ** 2 + (pt.y - my) ** 2);
      const proximity = Math.max(0, 1 - dist / 25);
      setScale(1 + proximity * 3);
      setOpacity(0.15 + proximity * 0.85);
    });
    return unsubX;
  }, [mouseX, mouseY, pt.x, pt.y]);

  return (
    <motion.circle
      cx={pt.x}
      cy={pt.y}
      r={0.4}
      fill={scale > 2 ? '#DFFF00' : '#E5E4DF'}
      initial={{ opacity: 0 }}
      animate={{ opacity, scale }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
    />
  );
}

// Generate SVG path strings for the mesh grid
function generateMeshPaths(
  points: { x: number; y: number }[],
  cols: number,
  rows: number
): string {
  const paths: string[] = [];

  // Horizontal lines
  for (let r = 0; r < rows; r++) {
    let d = '';
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const pt = points[idx];
      if (c === 0) d += `M ${pt.x} ${pt.y}`;
      else d += ` L ${pt.x} ${pt.y}`;
    }
    paths.push(d);
  }

  // Vertical lines
  for (let c = 0; c < cols; c++) {
    let d = '';
    for (let r = 0; r < rows; r++) {
      const idx = r * cols + c;
      const pt = points[idx];
      if (r === 0) d += `M ${pt.x} ${pt.y}`;
      else d += ` L ${pt.x} ${pt.y}`;
    }
    paths.push(d);
  }

  return paths.join('|||');
}

// ── Terminal Stats Row ───────────────────────
function TerminalStats({ inView }: { inView: boolean }) {
  const stats = [
    { label: 'AUM', value: 847, prefix: '$', suffix: 'M', delay: 200 },
    { label: 'TPS', value: 12400, suffix: '', delay: 400 },
    { label: 'UPTIME', value: 99.97, suffix: '%', delay: 600, decimals: 2 },
    { label: 'LATENCY', value: 12, suffix: 'ms', delay: 800 },
  ];

  return (
    <div className="flex items-center gap-8 md:gap-12 flex-wrap">
      {stats.map((stat) => (
        <div key={stat.label} className="group">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A] mb-1">
            {stat.label}
          </div>
          <div className="font-mono text-[22px] md:text-[28px] font-light text-[#E5E4DF] tracking-tight">
            <NumberTicker
              target={stat.value}
              prefix={stat.prefix || ''}
              suffix={stat.suffix}
              delay={stat.delay}
              trigger={inView}
              decimals={stat.decimals || 0}
              duration={2000}
            />
          </div>
        </div>
      ))}
      {/* Live dot */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFFF00] opacity-40" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFFF00]" />
        </span>
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#DFFF00]/60">
          Live
        </span>
      </div>
    </div>
  );
}

// ── Main Hero Export ─────────────────────────
export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Scroll-driven parallax
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { stiffness: 100, damping: 30 });

  // Velocity-driven typography skew
  const skewY = useTransform(smoothVelocity, [-3000, 0, 3000], [-2, 0, 2]);
  const headlineY = useTransform(scrollY, [0, 600], [0, 150]);
  const vizY = useTransform(scrollY, [0, 600], [0, -80]);
  const opacityParallax = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      style={{ paddingTop: '15vh', paddingBottom: '8vh' }}
    >
      {/* ── Background: Architectural grid lines ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical architectural lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(229,228,223,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20% 100%',
        }} />
        {/* Horizontal architectural lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(229,228,223,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 25%',
        }} />
      </div>

      {/* ── Content ── */}
      <motion.div
        style={{ opacity: opacityParallax }}
        className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-16 w-full"
      >
        {/* Asymmetric layout — break the grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.7fr] gap-8 lg:gap-4 items-end">
          {/* ── Left: Typography block ── */}
          <motion.div style={{ y: headlineY, skewY }} className="relative">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-px bg-[#DFFF00]" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A]">
                Digital Banking Protocol
              </span>
            </motion.div>

            {/* ── Massive Headline — Text Scramble Decode ── */}
            <h1 className="mb-6">
              <span className="block text-[clamp(3rem,8vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-[#E5E4DF]">
                <TextScramble
                  text="THE FUTURE"
                  delay={300}
                  speed={35}
                  trigger={inView}
                  className="inline"
                />
              </span>
              <span className="block text-[clamp(3rem,8vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-[#E5E4DF]">
                <TextScramble
                  text="OF DIGITAL"
                  delay={600}
                  speed={35}
                  trigger={inView}
                  className="inline"
                />
              </span>
              <span className="block text-[clamp(3rem,8vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
                <TextScramble
                  text="WEALTH"
                  delay={900}
                  speed={35}
                  trigger={inView}
                  className="inline text-[#DFFF00]"
                />
                <span className="text-[#DFFF00]">.</span>
              </span>
            </h1>

            {/* ── Subheadline ── */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.4, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="text-[15px] md:text-[17px] leading-[1.7] text-[#6A6A6A] max-w-[480px] mb-10"
            >
              Enterprise-grade banking infrastructure rendered in a stunning
              simulator. Real-time transfers, virtual cards, AI insights —
              built on Next.js, NestJS & Prisma.
            </motion.p>

            {/* ── CTA Row ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.8, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="flex items-center gap-2 flex-wrap -ml-14"
            >
              <MagneticButton variant="accent" href="/signup">
                Launch App
              </MagneticButton>
              <MagneticButton variant="outline" href="/login">
                View Demo ↗
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* ── Right: Interactive Data Visualization ── */}
          <motion.div
            style={{ y: vizY }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 1.2 }}
            className="relative hidden lg:block"
          >
            <DataVisualization />
          </motion.div>
        </div>

        {/* ── Terminal Stats Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 2.2, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="mt-16 pt-8 border-t border-[#E5E4DF]/[0.06]"
        >
          <TerminalStats inView={inView} />
        </motion.div>
      </motion.div>

      {/* ── Bottom architectural fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E5E4DF]/[0.04]" />
    </section>
  );
}
