'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi, accountsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeleton';
import { CreditCard, Plus, Lock, Unlock, Trash2, Wifi, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn, maskCardNumber } from '@/lib/utils';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const brandColors: Record<string, string> = {
  VISA: 'from-indigo-600 via-blue-500 to-cyan-400',
  MASTERCARD: 'from-orange-500 via-red-500 to-pink-600',
  AMEX: 'from-slate-600 via-slate-500 to-slate-400',
};

const brandLogos: Record<string, string> = {
  VISA: 'VISA',
  MASTERCARD: 'MC',
  AMEX: 'AMEX',
};

const getStableCVV = (id: string) => {
  if (!id) return '123';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash)).padStart(3, '0').substring(0, 3);
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

function VirtualCard({ card, onFlip, isFlipped }: { card: any; onFlip: () => void; isFlipped: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
  const glareX = useTransform(x, [-100, 100], [-50, 50]);
  const glareY = useTransform(y, [-100, 100], [-50, 50]);

  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (isFlipped) return; // Disable tilt when flipped
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

  return (
    <div 
      className="perspective-1000 cursor-pointer w-full relative group" 
      onClick={onFlip} 
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full aspect-[1.586/1]"
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          scale: isHovered && !isFlipped ? 1.05 : 1,
        }}
        style={{ 
          rotateX: isFlipped ? 0 : rotateX,
          rotateY: isFlipped ? 180 : rotateY,
          transformStyle: 'preserve-3d' 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }}
      >
        {/* Front */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl p-5 md:p-6 text-white overflow-hidden bg-gradient-to-br transition-shadow duration-300',
            isHovered && !isFlipped ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_40px_rgba(99,102,241,0.4)]' : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]',
            brandColors[card.brand] || brandColors.VISA,
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Glassmorphism Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/0 opacity-50 z-0 mix-blend-overlay pointer-events-none" />
          
          {/* Dynamic Glare */}
          {isHovered && !isFlipped && (
            <motion.div 
              className="absolute inset-0 bg-gradient-radial from-white/30 to-transparent opacity-40 z-10 pointer-events-none"
              style={{ x: glareX, y: glareY }}
            />
          )}

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 blur-2xl rounded-full translate-y-1/4 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-20 flex flex-col h-full justify-between" style={{ transform: "translateZ(30px)" }}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-wider text-white/90 drop-shadow-md">FINANCE HUB</span>
                <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest mt-0.5">{card.type}</span>
              </div>
              <Wifi className="w-5 h-5 md:w-6 md:h-6 rotate-90 text-white/80 drop-shadow-md" />
            </div>

            {/* Smart Chip */}
            <div className="w-10 h-7 md:w-12 md:h-9 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-inner flex items-center justify-center overflow-hidden border border-yellow-600/30">
              <div className="w-full h-full border border-yellow-600/20 rounded-sm m-0.5 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-50">
                {[...Array(9)].map((_, i) => <div key={i} className="border border-yellow-800/20 rounded-[1px]" />)}
              </div>
            </div>

            <div>
              <p className="text-base md:text-xl font-mono tracking-[0.15em] mb-2 md:mb-4 drop-shadow-md">{maskCardNumber(card.last4)}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[8px] md:text-[10px] uppercase text-white/60 font-semibold tracking-wider mb-0.5">Cardholder</p>
                  <p className="text-xs md:text-sm font-medium tracking-widest drop-shadow-md">{card.cardholderName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] md:text-[10px] uppercase text-white/60 font-semibold tracking-wider mb-0.5">Expires</p>
                  <p className="text-xs md:text-sm font-medium font-mono drop-shadow-md">{String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}</p>
                </div>
                <p className="text-lg md:text-xl font-bold opacity-90 drop-shadow-lg italic">{brandLogos[card.brand] || card.brand}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-br',
            'shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
            brandColors[card.brand] || brandColors.VISA,
          )}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="relative z-10 flex flex-col h-full">
            {/* Mag stripe */}
            <div className="w-full h-10 md:h-12 bg-black/60 mt-5 md:mt-6 shadow-inner" />
            {/* CVV */}
            <div className="px-5 md:px-6 mt-4 md:mt-6">
              <div className="bg-white/20 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] uppercase text-white/80 font-semibold tracking-wider">CVV</span>
                <span className="text-sm font-mono text-white font-bold tracking-widest">{card.cvv || getStableCVV(card.id)}</span>
              </div>
            </div>
            <div className="px-5 md:px-6 mt-3 md:mt-4 flex-1">
              <p className="text-[9px] md:text-[10px] text-white/50 leading-relaxed font-medium">
                This card is issued by FinanceHub. If found, please return to the nearest branch. Not valid for unauthorized transactions.
              </p>
            </div>
            <div className="px-5 md:px-6 pb-4 md:pb-5 flex justify-between items-center">
              <span className="text-[10px] text-white/60 font-semibold tracking-wider">TAP TO FLIP</span>
              <span className="text-sm font-bold text-white/90 drop-shadow-md italic">{brandLogos[card.brand] || card.brand}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CardsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ accountId: '', brand: 'VISA' });
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards'], queryFn: () => cardsApi.getAll().then(r => r.data),
  });
  const { data: accs } = useQuery({
    queryKey: ['accounts'], queryFn: () => accountsApi.getAll().then(r => r.data),
  });

  const createM = useMutation({
    mutationFn: (d: any) => cardsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cards'] }); toast.success('Card created!'); setShowCreate(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const statusM = useMutation({
    mutationFn: ({ id, status }: any) => cardsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cards'] }); toast.success('Card updated'); },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => cardsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cards'] }); toast.success('Card deleted'); },
  });

  const accounts = accs?.accounts || [];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Cards</h1>
          <p className="text-muted-foreground mt-1">Manage your virtual cards</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="btn-press gap-2">
          <Plus className="w-4 h-4" /> New Card
        </Button>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Card className="border-primary/20">
              <CardContent className="p-5 md:p-6">
                <h3 className="font-semibold mb-4">Create Virtual Card</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select account...</option>
                    {accounts.filter((a: any) => a.status === 'ACTIVE').map((a: any) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                    ))}
                  </select>
                  <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                    <option value="AMEX">Amex</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => createM.mutate(form)} loading={createM.isPending} disabled={!form.accountId}>Create Card</Button>
                  <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !cards?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
              <p className="text-muted-foreground mb-4">Create your first virtual card</p>
              <Button onClick={() => setShowCreate(true)} className="btn-press gap-2">
                <Plus className="w-4 h-4" /> Create Card
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card: any, i: number) => (
            <motion.div key={card.id} variants={fadeUp} custom={i} className="space-y-3">
              {/* Virtual Card */}
              <VirtualCard
                card={card}
                isFlipped={!!flippedCards[card.id]}
                onFlip={() => setFlippedCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
              />

              {/* Card Meta */}
              <div className="flex items-center gap-2 px-1">
                <Badge variant={card.status === 'ACTIVE' ? 'success' : card.status === 'BLOCKED' ? 'destructive' : 'warning'}>
                  {card.status}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">{card.account?.name}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {card.status === 'ACTIVE' && (
                  <Button variant="outline" size="sm" className="flex-1 btn-press"
                    onClick={() => statusM.mutate({ id: card.id, status: 'BLOCKED' })}>
                    <Lock className="w-3 h-3 mr-1.5" /> Block
                  </Button>
                )}
                {card.status === 'BLOCKED' && (
                  <Button variant="outline" size="sm" className="flex-1 btn-press"
                    onClick={() => statusM.mutate({ id: card.id, status: 'ACTIVE' })}>
                    <Unlock className="w-3 h-3 mr-1.5" /> Activate
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => deleteM.mutate(card.id)}
                  className="text-destructive hover:text-destructive btn-press">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
