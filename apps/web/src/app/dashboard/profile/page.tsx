'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Key, Globe } from 'lucide-react';
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
    <div className="space-y-6 animate-in max-w-3xl">
      <div><h1 className="text-2xl font-bold">Profile & Security</h1><p className="text-muted-foreground mt-1">Manage your personal information</p></div>

      {/* Profile Info */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white">{authUser?.firstName?.charAt(0)}{authUser?.lastName?.charAt(0)}</div>
            <div><p className="text-lg font-semibold">{profile?.firstName} {profile?.lastName}</p><p className="text-sm text-muted-foreground">{profile?.email}</p>
              <div className="flex gap-2 mt-1"><Badge variant={profile?.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>{profile?.kycStatus || 'PENDING'}</Badge><Badge variant="outline">{profile?.role}</Badge></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">First Name</label><Input defaultValue={profile?.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Last Name</label><Input defaultValue={profile?.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><Input defaultValue={profile?.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Country</label><Input defaultValue={profile?.country} onChange={(e) => setForm({...form, country: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">City</label><Input defaultValue={profile?.city} onChange={(e) => setForm({...form, city: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Postal Code</label><Input defaultValue={profile?.postalCode} onChange={(e) => setForm({...form, postalCode: e.target.value})} /></div>
          </div>
          <Button onClick={() => updateM.mutate(form)} loading={updateM.isPending}>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" /> Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} />
          <Input type="password" placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} />
          <Input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={(e) => setPwForm({...pwForm, confirm: e.target.value})} />
          <Button onClick={() => { if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; } pwM.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }); }} loading={pwM.isPending}>Update Password</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Security</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div><p className="font-medium">Two-Factor Authentication</p><p className="text-sm text-muted-foreground">Add an extra layer of security</p></div>
            <Badge variant={profile?.twoFactorEnabled ? 'success' : 'secondary'}>{profile?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</Badge>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 mt-3">
            <div><p className="font-medium">Email Verification</p><p className="text-sm text-muted-foreground">{profile?.email}</p></div>
            <Badge variant={profile?.emailVerified ? 'success' : 'warning'}>{profile?.emailVerified ? 'Verified' : 'Not Verified'}</Badge>
          </div>
          {profile?.lastLoginAt && <p className="text-xs text-muted-foreground mt-4">Last login: {new Date(profile.lastLoginAt).toLocaleString()}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
