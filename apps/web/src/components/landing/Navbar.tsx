'use client';

// ============================================
// Navbar — Editorial Brutalist
// Thin, architectural, zero blur. A single
// horizontal rule separating brand from void.
// No glassmorphism. No rounded corners.
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

const links = [
  { label: 'Index', href: '#hero' },
  { label: 'Ledger', href: '#features' },
  { label: 'Architecture', href: '#stack' },
  { label: 'Protocol', href: '#security' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-700 ${
        scrolled ? 'bg-[#0A0A0A]/98' : 'bg-transparent'
      }`}
    >
      {/* Top architectural line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E5E4DF]/8 to-transparent" />

      <nav className="max-w-[1600px] mx-auto px-6 md:px-16 h-14 flex items-center justify-between">
        {/* ── Mark ── */}
        <Link href="/" className="flex items-center gap-0 group" id="navbar-brand">
          <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#E5E4DF]">
            Finance
          </span>
          <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#DFFF00]">
            Hub
          </span>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-[#DFFF00] text-lg leading-none ml-0.5"
          >
            .
          </motion.span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-12">
          {links.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              id={`nav-link-${link.label.toLowerCase()}`}
              className="group relative text-[10px] font-medium tracking-[0.25em] uppercase text-[#6A6A6A] hover:text-[#E5E4DF] transition-colors duration-300"
            >
              <span className="relative">
                {/* Index number */}
                <span className="text-[#3A3A3A] mr-2 font-mono">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {link.label}
              </span>
              {/* Underline reveal */}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#DFFF00] group-hover:w-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]" />
            </a>
          ))}

          {/* Vertical divider */}
          <div className="w-px h-3 bg-[#E5E4DF]/8" />

          <Link
            href="/login"
            id="nav-enter"
            className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#6A6A6A] hover:text-[#DFFF00] transition-colors duration-300"
          >
            Enter ↗
          </Link>
        </div>

        {/* ── Mobile Toggle ── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#E5E4DF] p-1"
          aria-label="Toggle navigation"
          id="nav-mobile-toggle"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </nav>

      {/* Bottom architectural rule */}
      <div className="h-px w-full bg-[#E5E4DF]/[0.04]" />

      {/* ── Mobile Panel — clip-path reveal ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#0A0A0A] border-b border-[#E5E4DF]/[0.04]"
          >
            <div className="px-6 py-10 space-y-8">
              {links.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-4 text-[11px] font-medium tracking-[0.2em] uppercase text-[#6A6A6A] hover:text-[#E5E4DF] transition-colors"
                >
                  <span className="text-[#3A3A3A] font-mono text-[10px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-[#E5E4DF]/[0.04]" />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-[11px] font-medium tracking-[0.2em] uppercase text-[#DFFF00]"
              >
                Enter Dashboard ↗
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
