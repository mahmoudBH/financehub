'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Bell, Globe, Shield, Laptop, MonitorSmartphone, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function SettingsPage() {
  const qc = useQueryClient();

  const { data: sessionsRes } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => usersApi.getActiveSessions().then(r => r.data),
  });

  const { data: logsRes } = useQuery({
    queryKey: ['security-logs'],
    queryFn: () => usersApi.getSecurityLogs().then(r => r.data),
  });

  const revokeM = useMutation({
    mutationFn: (id: string) => usersApi.revokeSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session revoked successfully');
    },
    onError: () => toast.error('Failed to revoke session'),
  });

  const sessions = sessionsRes || [];
  const logs = logsRes || [];

  return (
    <div className="space-y-6 animate-in max-w-4xl">
      <div><h1 className="text-2xl font-bold">Settings & Security</h1><p className="text-muted-foreground mt-1">Configure your preferences and manage devices</p></div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div><p className="font-medium">Theme</p><p className="text-sm text-muted-foreground">Choose your preferred theme</p></div>
            <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
              <option>Dark</option><option>Light</option><option>System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {['Email notifications', 'Push notifications', 'Transaction alerts', 'Security alerts', 'Marketing emails'].map((item) => (
            <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-sm font-medium">{item}</span>
              <button className="w-10 h-6 rounded-full bg-primary relative transition-colors"><div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform" /></button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Regional</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Language</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"><option>English</option><option>Français</option><option>العربية</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Timezone</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"><option>Europe/Paris</option><option>Europe/London</option><option>America/New_York</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Currency</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"><option>EUR</option><option>USD</option><option>GBP</option><option>MAD</option></select>
            </div>
          </div>
          <Button className="mt-4">Save Preferences</Button>
        </CardContent>
      </Card>

      <Card className="border-indigo-500/20">
        <CardHeader><CardTitle className="flex items-center gap-2 text-indigo-500"><MonitorSmartphone className="w-5 h-5" /> Active Sessions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? <p className="text-sm text-muted-foreground">No active sessions found.</p> : sessions.map((session: any) => (
            <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{session.userAgent || 'Unknown Device'}</p>
                  <p className="text-xs text-muted-foreground">IP: {session.ipAddress || 'Unknown'} • Active since {new Date(session.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => revokeM.mutate(session.id)} loading={revokeM.isPending}>Revoke</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Security Audit Logs</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {logs.length === 0 ? <p className="text-sm text-muted-foreground">No security logs available.</p> : logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><Shield className="w-5 h-5" /> Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5">
            <div><p className="font-medium">Delete Account</p><p className="text-sm text-muted-foreground">Permanently delete your account and all data</p></div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
