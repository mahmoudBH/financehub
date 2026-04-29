'use client';

// ============================================
// MagneticButton — Physics-Driven CTA
// The button physically distorts toward the
// cursor within a capture radius. Spring-based,
// no CSS transitions. Accent variant uses the
// Electric Chartreuse (#DFFF00) for critical
// interactions only.
// ============================================

import { useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  /** Pixel radius within which the magnet activates */
  captureRadius?: number;
  /** How aggressively it pulls (0–1) */
  strength?: number;
  /** 'accent' uses Electric Chartreuse; 'bone' uses Matte Bone */
  variant?: 'accent' | 'bone' | 'outline';
}

export function MagneticButton({
  children,
  className,
  href,
  onClick,
  captureRadius = 140,
  strength = 0.3,
  variant = 'accent',
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Physics-driven spring values
  const springConfig = { stiffness: 200, damping: 18, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  // Inner content moves at half the rate for parallax depth
  const innerX = useTransform(x, (v) => v * 0.4);
  const innerY = useTransform(y, (v) => v * 0.4);

  // Subtle rotation based on cursor position
  const rotateX = useTransform(y, [-30, 30], [3, -3]);
  const rotateY = useTransform(x, [-30, 30], [-3, 3]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < captureRadius) {
        const pull = 1 - distance / captureRadius; // stronger when closer
        x.set(distX * strength * pull * 1.5);
        y.set(distY * strength * pull * 1.5);
        if (!isHovered) setIsHovered(true);
      } else {
        x.set(0);
        y.set(0);
        if (isHovered) setIsHovered(false);
      }
    },
    [captureRadius, strength, isHovered, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }, [x, y]);

  const variantStyles = {
    accent:
      'bg-[#DFFF00] text-[#0A0A0A] border border-[#DFFF00]/20 hover:shadow-[0_0_60px_-12px_rgba(223,255,0,0.35)]',
    bone:
      'bg-[#E5E4DF] text-[#0A0A0A] border border-[#E5E4DF]/20 hover:shadow-[0_0_40px_-8px_rgba(229,228,223,0.15)]',
    outline:
      'bg-transparent text-[#E5E4DF] border border-[#E5E4DF]/20 hover:border-[#E5E4DF]/40',
  };

  const Tag = href ? 'a' : 'button';
  const linkProps = href ? { href } : {};

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
      style={{ padding: captureRadius / 2.5 }}
    >
      <motion.div
        style={{ x, y, rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        <Tag
          {...linkProps}
          onClick={onClick}
          className={cn(
            'relative inline-flex items-center gap-3 px-10 py-4 text-[13px] font-semibold tracking-[0.15em] uppercase transition-all duration-300',
            variantStyles[variant],
            className
          )}
          style={{ willChange: 'transform' }}
        >
          <motion.span
            style={{ x: innerX, y: innerY }}
            className="relative z-10 flex items-center gap-3"
          >
            {children}
          </motion.span>

          {/* Live pulse indicator — accent only */}
          {variant === 'accent' && (
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A0A0A] opacity-30" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0A0A0A]" />
            </span>
          )}
        </Tag>
      </motion.div>
    </div>
  );
}
