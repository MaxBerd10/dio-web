'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isHydrated, fetchMe, logout } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    fetchMe();
  }, [isHydrated, fetchMe]);

  useEffect(() => {
    // Hydration tugagandan keyin user yo'q bo'lsa — login'ga
    if (isHydrated && user === null) {
      // fetchMe tugashi uchun ozgina kutamiz
      const timer = setTimeout(() => {
        if (useAuthStore.getState().user === null) {
          router.push('/login');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-[var(--color-muted-foreground)]">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dio <span className="text-[var(--color-primary)]">English Tutor</span>
        </h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Chiqish
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salom, {user.full_name || user.username}!</CardTitle>
          <CardDescription>
            Auth ishlayapti ✓ — keyin bu yer to'liq dashboard bo'ladi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-[var(--color-muted-foreground)]">Email:</dt>
            <dd>{user.email}</dd>

            <dt className="text-[var(--color-muted-foreground)]">Username:</dt>
            <dd>@{user.username}</dd>

            <dt className="text-[var(--color-muted-foreground)]">Role:</dt>
            <dd>
              <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-semibold">
                {user.role}
              </span>
            </dd>

            {user.cefr_level && (
              <>
                <dt className="text-[var(--color-muted-foreground)]">CEFR:</dt>
                <dd>{user.cefr_level}</dd>
              </>
            )}

            {user.learning_goal && (
              <>
                <dt className="text-[var(--color-muted-foreground)]">Goal:</dt>
                <dd>{user.learning_goal}</dd>
              </>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}