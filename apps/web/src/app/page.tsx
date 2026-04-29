'use client';

// ============================================
// FinanceHub — Editorial Brutalist Luxury
// Landing page. Obsidian + Matte Bone palette.
// Electric Chartreuse (#DFFF00) accent.
// Zero glassmorphism. Zero purple gradients.
// ============================================

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

import { NoiseOverlay } from '@/components/landing/NoiseOverlay';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { LedgerFeatures } from '@/components/landing/BentoFeatures';
import { TechStack } from '@/components/landing/TechStack';
import { GrandCTA, Footer } from '@/components/landing/CTA';

export default function HomePage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      setShowLanding(true);
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Loading state — no spinner, just obsidian void
  if (!showLanding) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]" />
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#E5E4DF] overflow-x-hidden selection:bg-[#DFFF00] selection:text-[#0A0A0A]">
      {/* ── Film Grain Overlay — always on top ── */}
      <NoiseOverlay />

      {/* ── Architectural Navbar ── */}
      <Navbar />

      {/* ── The Terminal Hero ── */}
      <Hero />

      {/* ── The Ledger — Features ── */}
      <LedgerFeatures />

      {/* ── Tech Stack & Security Protocol ── */}
      <TechStack />

      {/* ── The Close — Grand CTA ── */}
      <GrandCTA />

      {/* ── Architectural Footer ── */}
      <Footer />
    </main>
  );
}
