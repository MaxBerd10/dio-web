'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { tokenStorage } from '@/lib/tokens';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'student' | 'teacher' | 'admin';
}

export function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const router = useRouter();
  const { user, isHydrated, fetchMe } = useAuthStore();

  // Boshlang'ich /me/ chaqiruv
  useEffect(() => {
    if (!isHydrated) return;
    if (tokenStorage.getAccess() && !user) {
      fetchMe();
    }
  }, [isHydrated, user, fetchMe]);

  // Auth tekshiruvi
  useEffect(() => {
    if (!isHydrated) return;

    const hasToken = !!tokenStorage.getAccess();
    if (!hasToken) {
      router.replace('/login');
      return;
    }

    // Role tekshiruvi (agar talab qilingan bo'lsa)
    if (user && requireRole && user.role !== requireRole) {
      router.replace('/dashboard');
    }
  }, [isHydrated, user, requireRole, router]);

  // Loading
  if (!isHydrated || (!user && tokenStorage.getAccess())) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-[var(--color-primary)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
            />
          </svg>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}