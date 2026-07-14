'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MobileMoreMenu } from '@/components/layout/mobile-more-menu';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return (
    <AuthGuard>
      <div className="app-shell min-h-dvh">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-h-dvh flex-col">
          <Header
            onMenuClick={() => setSidebarOpen((v) => !v)}
            menuOpen={sidebarOpen}
          />
          <main className="flex-1 pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom)+1.5rem)] lg:pb-8">
            {children}
          </main>
        </div>
        <MobileNav
          moreOpen={moreOpen}
          onOpenMore={() => setMoreOpen(true)}
        />
        <MobileMoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
      </div>
    </AuthGuard>
  );
}
