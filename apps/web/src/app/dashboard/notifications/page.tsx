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
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsApi.getAll({ limit: 50 }).then(r => r.data) });
  const markReadM = useMutation({ mutationFn: (id: string) => notificationsApi.markAsRead(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
  const markAllM = useMutation({ mutationFn: () => notificationsApi.markAllAsRead(), onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All read'); } });

  // Use mock data if there are no notifications to show a realistic preview
  const mockNotifications = [
    { id: 'mock-1', type: 'SECURITY', title: 'New device sign-in', message: 'We noticed a new login from Mac OS in Paris, France.', isRead: false, createdAt: new Date().toISOString() },
    { id: 'mock-2', type: 'TRANSFER', title: 'Transfer successful', message: 'Your transfer of €250.00 to Sophie has been completed.', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'mock-3', type: 'PROMOTION', title: 'Upgrade to Metal', message: 'Get 2% cashback on all purchases with our new Metal tier.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'mock-4', type: 'TRANSACTION', title: 'Direct debit processed', message: 'Your Netflix subscription (€15.99) was successfully paid.', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];

  const dbNotifications = data?.data || [];
  const notifications = dbNotifications.length > 0 ? dbNotifications : mockNotifications;
  const unreadCount = dbNotifications.length > 0 ? (data?.unreadCount || 0) : mockNotifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-in pb-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You are all caught up.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllM.mutate()} className="bg-background hover:bg-muted text-foreground border-border rounded-xl shadow-sm">
            <CheckCheck className="w-4 h-4 mr-2 text-indigo-500" /> Mark all read
          </Button>
        )}
      </div>

      <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
             <div className="p-12 text-center text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">All caught up!</h3>
              <p className="text-muted-foreground">You don't have any new notifications at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n: any) => {
                const ti = typeIcons[n.type] || typeIcons.SYSTEM;
                const Icon = ti.icon;
                return (
                  <div 
                    key={n.id} 
                    className={`flex items-start gap-4 p-5 hover:bg-muted/50 transition-all cursor-pointer ${!n.isRead ? 'bg-indigo-500/5' : ''}`} 
                    onClick={() => !n.isRead && !n.id.startsWith('mock') && markReadM.mutate(n.id)}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${ti.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-[15px] font-bold ${!n.isRead ? 'text-foreground' : 'text-foreground/80'}`}>{n.title}</p>
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatRelativeTime(n.createdAt)}</span>
                      </div>
                      <p className={`text-sm line-clamp-2 ${!n.isRead ? 'text-foreground/90 font-medium' : 'text-muted-foreground'}`}>{n.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
