'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/auth';
import { tokenStorage } from '@/lib/tokens';

export function LandingAuthRedirect() {
  const router = useRouter();
  const { user, isHydrated, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (tokenStorage.getAccess()) {
      fetchMe().then(() => {
        if (useAuthStore.getState().user) {
          router.replace('/dashboard');
        }
      });
    }
  }, [isHydrated, fetchMe, router]);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  return null;
}
