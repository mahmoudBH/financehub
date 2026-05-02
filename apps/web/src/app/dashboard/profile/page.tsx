'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Key, Globe, Crown, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const qc = useQueryClient();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => usersApi.getProfile().then(r => r.data) });

  const updateM = useMutation({
    mutationFn: (d: any) => usersApi.updateProfile(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile updated'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const pwM = useMutation({
    mutationFn: (d: any) => usersApi.changePassword(d),
    onSuccess: () => { toast.success('Password changed'); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const [form, setForm] = useState<any>({});
  const p = { ...profile, ...form };

  return (
    <div className="space-y-6 animate-in pb-12 max-w-3xl">
      <div><h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile & Security</h1><p className="text-muted-foreground mt-1">Manage your personal information</p></div>

      {/* Profile Info */}
      <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><User className="w-5 h-5 text-indigo-500" /> Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-3xl font-bold text-white">{authUser?.firstName?.charAt(0)}{authUser?.lastName?.charAt(0)}</div>
            <div><p className="text-xl font-bold text-foreground">{profile?.firstName} {profile?.lastName}</p><p className="text-sm text-muted-foreground mt-0.5">{profile?.email}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant={profile?.kycStatus === 'VERIFIED' ? 'success' : 'warning'} className="rounded-lg">{profile?.kycStatus || 'PENDING'}</Badge>
                <Badge variant="outline" className="rounded-lg">{profile?.role}</Badge>
                <Badge variant="default" className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0"><Crown className="w-3 h-3 mr-1"/> {profile?.tier || 'STANDARD'}</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-medium mb-1.5 text-foreground">First Name</label><Input defaultValue={profile?.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="h-12 rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-1.5 text-foreground">Last Name</label><Input defaultValue={profile?.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="h-12 rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-1.5 text-foreground">Phone</label><Input defaultValue={profile?.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="h-12 rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-1.5 text-foreground">Country</label><Input defaultValue={profile?.country} onChange={(e) => setForm({...form, country: e.target.value})} className="h-12 rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-1.5 text-foreground">City</label><Input defaultValue={profile?.city} onChange={(e) => setForm({...form, city: e.target.value})} className="h-12 rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-1.5 text-foreground">Postal Code</label><Input defaultValue={profile?.postalCode} onChange={(e) => setForm({...form, postalCode: e.target.value})} className="h-12 rounded-xl" /></div>
          </div>
          <Button onClick={() => updateM.mutate(form)} loading={updateM.isPending} className="mt-4 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white px-8">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Rewards & Tiers */}
      <Card className="border border-amber-500/20 bg-amber-500/5 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-amber-500"><Star className="w-5 h-5" /> Rewards & Benefits</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-500/80">Current Tier</p>
              <p className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 tracking-tight">{profile?.tier || 'STANDARD'} MEMBER</p>
              <p className="text-sm text-muted-foreground mt-2">Unlock more benefits by upgrading your tier.</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-500/80">Cashback Points</p>
              <p className="text-4xl font-extrabold text-amber-500 tracking-tight">{profile?.cashbackPoints || 0}</p>
              <Button variant="outline" size="sm" className="mt-3 rounded-xl border-amber-500/50 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 font-bold">Redeem Points</Button>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-amber-500/10">
            <div className="flex justify-between text-xs font-bold mb-3">
              <span className="text-muted-foreground">Standard</span>
              <span className="text-amber-500">Premium</span>
              <span className="text-muted-foreground">Metal</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 w-1/2 shadow-sm"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><Key className="w-5 h-5 text-emerald-500" /> Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} className="h-12 rounded-xl" />
          <Input type="password" placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} className="h-12 rounded-xl" />
          <Input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={(e) => setPwForm({...pwForm, confirm: e.target.value})} className="h-12 rounded-xl" />
          <Button onClick={() => { if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; } pwM.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }); }} loading={pwM.isPending} className="mt-2 h-12 rounded-xl px-8 bg-emerald-500 hover:bg-emerald-600 text-white">Update Password</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card border border-border/50 hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><Shield className="w-5 h-5 text-red-500" /> Security</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-muted/40 border border-border/40 gap-4">
            <div><p className="font-bold text-[15px] text-foreground">Two-Factor Authentication</p><p className="text-sm text-muted-foreground mt-0.5">Add an extra layer of security</p></div>
            <Badge variant={profile?.twoFactorEnabled ? 'success' : 'secondary'} className="rounded-lg w-fit">{profile?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-muted/40 border border-border/40 mt-4 gap-4">
            <div><p className="font-bold text-[15px] text-foreground">Email Verification</p><p className="text-sm text-muted-foreground mt-0.5">{profile?.email}</p></div>
            <Badge variant={profile?.emailVerified ? 'success' : 'warning'} className="rounded-lg w-fit">{profile?.emailVerified ? 'Verified' : 'Not Verified'}</Badge>
          </div>
          {profile?.lastLoginAt && <p className="text-xs text-muted-foreground font-mono mt-6">Last login: {new Date(profile.lastLoginAt).toLocaleString()}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
