'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-8xl font-bold text-gradient bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-4">404</div>
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/dashboard"><Button><Home className="w-4 h-4 mr-2" /> Back to Dashboard</Button></Link>
      </div>
    </div>
  );
}
