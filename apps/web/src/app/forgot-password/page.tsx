'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Landmark, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent if account exists');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 gradient-mesh px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FinanceHub</span>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">
                If an account exists with {email}, you'll receive a password reset link.
              </p>
              <Link href="/login">
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Forgot password?</h2>
                <p className="text-slate-400 text-sm">Enter your email to receive a reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    icon={<Mail className="w-4 h-4" />}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <Button type="submit" className="w-full h-12" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-400">
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                  <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
