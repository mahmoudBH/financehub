'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { CreditCard, Wifi, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CreditCard3DProps {
  card: {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    type: string;
    status: string;
    network?: string;
  };
  className?: string;
  gradient?: string;
}

export function CreditCard3D({ card, className, gradient = 'from-indigo-500 via-purple-500 to-pink-500' }: CreditCard3DProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
  const glareX = useTransform(x, [-100, 100], [-50, 50]);
  const glareY = useTransform(y, [-100, 100], [-50, 50]);

  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }

  const formatCardNumber = (num: string) => {
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  return (
    <div className={cn("perspective-[1000px] w-full max-w-[380px] cursor-pointer", className)}>
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{
          scale: isHovered ? 1.05 : 1,
          boxShadow: isHovered 
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.4)" 
            : "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
        className={cn(
          "relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden text-white shadow-2xl transition-all duration-200 ease-linear",
          `bg-gradient-to-br ${gradient}`
        )}
      >
        {/* Glassmorphism overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/0 opacity-50 z-0 mix-blend-overlay" />
        
        {/* Dynamic glare effect following mouse */}
        {isHovered && (
          <motion.div 
            className="absolute inset-0 bg-gradient-radial from-white/30 to-transparent opacity-40 z-10 pointer-events-none"
            style={{ x: glareX, y: glareY }}
          />
        )}

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 blur-2xl rounded-full translate-y-1/4 -translate-x-1/4" />

        <div className="relative z-20 h-full p-6 flex flex-col justify-between" style={{ transform: "translateZ(30px)" }}>
          {/* Top row */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wider text-white/90 drop-shadow-md">
                FINANCE HUB
              </span>
              <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest mt-0.5">
                {card.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-6 h-6 rotate-90 text-white/80" />
              {card.network === 'VISA' ? (
                <div className="text-xl font-bold italic tracking-tighter drop-shadow-md">VISA</div>
              ) : card.network === 'MASTERCARD' ? (
                <div className="w-10 h-6 relative flex items-center drop-shadow-md">
                  <div className="w-6 h-6 rounded-full bg-red-500 opacity-90 absolute left-0 mix-blend-screen" />
                  <div className="w-6 h-6 rounded-full bg-orange-500 opacity-90 absolute left-4 mix-blend-screen" />
                </div>
              ) : (
                <CreditCard className="w-6 h-6" />
              )}
            </div>
          </div>

          {/* Chip */}
          <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-inner flex items-center justify-center overflow-hidden border border-yellow-600/30">
            <div className="w-full h-full border border-yellow-600/20 rounded-sm m-1 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-50">
              {[...Array(9)].map((_, i) => <div key={i} className="border border-yellow-800/20 rounded-[1px]" />)}
            </div>
          </div>

          {/* Bottom section */}
          <div>
            <div className="font-mono text-xl md:text-2xl tracking-widest text-white/90 drop-shadow-md mb-2">
              {formatCardNumber(card.cardNumber)}
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col uppercase">
                <span className="text-[8px] text-white/60 font-semibold mb-0.5 tracking-wider">Card Holder</span>
                <span className="text-sm font-medium tracking-widest drop-shadow-md">{card.cardholderName}</span>
              </div>
              <div className="flex flex-col uppercase items-center">
                <span className="text-[8px] text-white/60 font-semibold mb-0.5 tracking-wider">Valid Thru</span>
                <span className="text-sm font-medium tracking-widest font-mono drop-shadow-md">{card.expiryDate}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
