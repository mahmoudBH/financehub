'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Bell, Globe, Shield, Laptop, MonitorSmartphone, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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

  const [showAllSessions, setShowAllSessions] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const displayedSessions = showAllSessions ? sessions : sessions.slice(0, 3);
  const displayedLogs = showAllLogs ? logs : logs.slice(0, 3);

  return (
    <div className="space-y-6 animate-in pb-12 max-w-4xl">
      <div><h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings & Security</h1><p className="text-muted-foreground mt-1">Configure your preferences and manage devices</p></div>

      <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><Palette className="w-5 h-5 text-indigo-500" /> Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-muted/40 border border-border/40 gap-4">
            <div><p className="font-bold text-[15px] text-foreground">Theme</p><p className="text-sm text-muted-foreground mt-0.5">Choose your preferred theme</p></div>
            <select className="h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20 w-full sm:w-auto">
              <option>Dark</option><option>Light</option><option>System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><Bell className="w-5 h-5 text-emerald-500" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {['Email notifications', 'Push notifications', 'Transaction alerts', 'Security alerts', 'Marketing emails'].map((item, i) => (
            <div key={item} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/40">
              <span className="text-[15px] font-bold text-foreground/90">{item}</span>
              <button className={`w-12 h-6 rounded-full relative transition-colors shadow-inner ${i < 3 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${i < 3 ? 'left-1 translate-x-6' : 'left-1'}`} /></button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><Globe className="w-5 h-5 text-amber-500" /> Regional</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Language</label>
              <select className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20"><option>English</option><option>Français</option><option>العربية</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Timezone</label>
              <select className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20"><option>Europe/Paris</option><option>Europe/London</option><option>America/New_York</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Currency</label>
              <select className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20"><option>EUR</option><option>USD</option><option>GBP</option><option>MAD</option></select>
            </div>
          </div>
          <Button className="mt-6 h-12 rounded-xl px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold">Save Preferences</Button>
        </CardContent>
      </Card>

      <Card className="border border-indigo-500/20 bg-indigo-500/5 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-indigo-500"><MonitorSmartphone className="w-5 h-5" /> Active Sessions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? <p className="text-sm text-muted-foreground p-4">No active sessions found.</p> : (
            <>
              {displayedSessions.map((session: any) => (
                <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-card border border-border/50 gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <Laptop className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-foreground">{session.userAgent || 'Unknown Device'}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">IP: {session.ipAddress || 'Unknown'} • Active since {new Date(session.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => revokeM.mutate(session.id)} loading={revokeM.isPending} className="rounded-lg hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors">Revoke</Button>
                </div>
              ))}
              {sessions.length > 3 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10" 
                  onClick={() => setShowAllSessions(!showAllSessions)}
                >
                  {showAllSessions ? 'Afficher moins' : `Afficher plus (${sessions.length - 3})`}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><Clock className="w-5 h-5 text-slate-500" /> Security Audit Logs</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {logs.length === 0 ? <p className="text-sm text-muted-foreground p-4">No security logs available.</p> : (
              <>
                {displayedLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 rounded-xl transition-colors cursor-default">
                    <div>
                      <p className="text-[15px] font-bold text-foreground">{log.action}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{log.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-mono">{formatRelativeTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {logs.length > 3 && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-2 text-slate-500 hover:text-slate-600 hover:bg-slate-500/10" 
                    onClick={() => setShowAllLogs(!showAllLogs)}
                  >
                    {showAllLogs ? 'Afficher moins' : `Afficher plus (${logs.length - 3})`}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-destructive/20 bg-destructive/5 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><Shield className="w-5 h-5" /> Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-card border border-destructive/20 gap-4 shadow-sm">
            <div><p className="font-bold text-[15px] text-foreground">Delete Account</p><p className="text-sm text-muted-foreground mt-0.5">Permanently delete your account and all data</p></div>
            <Button variant="destructive" size="sm" className="rounded-xl h-11 px-6 shadow-sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
