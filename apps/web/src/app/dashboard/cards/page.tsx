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
import { motion, AnimatePresence } from 'framer-motion';

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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

function VirtualCard({ card, onFlip, isFlipped }: { card: any; onFlip: () => void; isFlipped: boolean }) {
  return (
    <div className="perspective-1000 cursor-pointer" onClick={onFlip} style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full aspect-[1.586/1]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl p-5 md:p-6 text-white overflow-hidden bg-gradient-to-br',
            'shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
            brandColors[card.brand] || brandColors.VISA,
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }} />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <Wifi className="w-5 h-5 md:w-6 md:h-6 rotate-90 opacity-80" />
              <span className="text-[10px] md:text-xs font-medium opacity-70 uppercase tracking-wider">{card.type}</span>
            </div>
            <div>
              <p className="text-base md:text-lg font-mono tracking-[0.15em] mb-3 md:mb-4">{maskCardNumber(card.last4)}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase opacity-50 tracking-wider">Cardholder</p>
                  <p className="text-xs md:text-sm font-medium">{card.cardholderName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] md:text-[10px] uppercase opacity-50 tracking-wider">Expires</p>
                  <p className="text-xs md:text-sm font-medium">{String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}</p>
                </div>
                <p className="text-lg md:text-xl font-bold opacity-90">{brandLogos[card.brand] || card.brand}</p>
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
            <div className="w-full h-10 md:h-12 bg-black/40 mt-5 md:mt-6" />
            {/* CVV */}
            <div className="px-5 md:px-6 mt-4 md:mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] uppercase text-white/60 tracking-wider">CVV</span>
                <span className="text-sm font-mono text-white font-bold tracking-widest">•••</span>
              </div>
            </div>
            <div className="px-5 md:px-6 mt-3 md:mt-4 flex-1">
              <p className="text-[9px] md:text-[10px] text-white/40 leading-relaxed">
                This card is issued by FinanceHub for simulation purposes only. Not valid for real transactions.
              </p>
            </div>
            <div className="px-5 md:px-6 pb-4 md:pb-5 flex justify-between items-center">
              <span className="text-[10px] text-white/50">Tap to flip</span>
              <span className="text-sm font-bold text-white/80">{brandLogos[card.brand] || card.brand}</span>
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
