'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Shield, CreditCard, ArrowLeftRight, Wallet, Megaphone, Receipt, Info } from 'lucide-react';
import { toast } from 'sonner';

const typeIcons: Record<string, any> = {
  TRANSACTION: { icon: Receipt, color: 'bg-blue-500/10 text-blue-500' },
  TRANSFER: { icon: ArrowLeftRight, color: 'bg-indigo-500/10 text-indigo-500' },
  SECURITY: { icon: Shield, color: 'bg-red-500/10 text-red-500' },
  ACCOUNT: { icon: Wallet, color: 'bg-emerald-500/10 text-emerald-500' },
  CARD: { icon: CreditCard, color: 'bg-purple-500/10 text-purple-500' },
  SYSTEM: { icon: Info, color: 'bg-slate-500/10 text-slate-500' },
  PROMOTION: { icon: Megaphone, color: 'bg-amber-500/10 text-amber-500' },
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsApi.getAll({ limit: 50 }).then(r => r.data) });
  const markReadM = useMutation({ mutationFn: (id: string) => notificationsApi.markAsRead(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
  const markAllM = useMutation({ mutationFn: () => notificationsApi.markAllAsRead(), onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All read'); } });

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground mt-1">{unreadCount} unread</p></div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={() => markAllM.mutate()}><CheckCheck className="w-4 h-4 mr-2" /> Mark all read</Button>}
      </div>
      <Card><CardContent className="p-0 divide-y divide-border/50">
        {notifications.length === 0 ? (
          <div className="p-12 text-center"><Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold">All caught up!</h3></div>
        ) : notifications.map((n: any) => {
          const ti = typeIcons[n.type] || typeIcons.SYSTEM;
          const Icon = ti.icon;
          return (
            <div key={n.id} className={`flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/[0.02]' : ''}`} onClick={() => !n.isRead && markReadM.mutate(n.id)}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ti.color}`}><Icon className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm font-medium ${!n.isRead ? '' : 'text-muted-foreground'}`}>{n.title}</p>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                <span className="text-xs text-muted-foreground mt-1 block">{formatRelativeTime(n.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </CardContent></Card>
    </div>
  );
}
