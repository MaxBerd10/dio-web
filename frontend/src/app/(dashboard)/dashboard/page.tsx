'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight } from 'lucide-react';

import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { StreakCard } from '@/components/dashboard/streak-card';
import { XPCard } from '@/components/dashboard/xp-card';
import { DailyGoalCard } from '@/components/dashboard/daily-goal-card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { VocabularyCTA } from '@/components/dashboard/vocabulary-cta';
import { LeaderboardPreview } from '@/components/dashboard/leaderboard-preview';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const greeting = getGreeting();

  // Teacher/admin /dashboard ga kelsa, darrov /teacher/submissions ga yo'naltir
  useEffect(() => {
    if (user && (user.role === 'teacher' || user.role === 'admin')) {
      router.replace('/teacher/submissions');
    }
  }, [user, router]);

  // Teacher redirect bo'lguncha bo'sh ekran ko'rsatmaslik uchun
  if (user && (user.role === 'teacher' || user.role === 'admin')) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center text-sm text-[var(--color-muted-foreground)]">
        Vazifalar sahifasiga o'tilmoqda...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Salomlashish */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {user?.full_name?.split(' ')[0] || user?.username}!
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1 text-sm md:text-base">
          Bugun yangi narsa o'rganaylik.
        </p>
      </div>

      {/* Faqat student uchun progress widget'lari */}
      {user?.role === 'student' && (
        <>
          {/* Top 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StreakCard />
            <XPCard />
            <DailyGoalCard />
          </div>

          {/* Vocabulary CTA — agar takrorlash bor bo'lsa */}
          <VocabularyCTA />

          {/* Quick stats */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Statistika</h2>
            <QuickStats />
          </div>

          {/* Continue learning + leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ContinueLearningCard />
            </div>
            <div>
              <LeaderboardPreview />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Continue learning placeholder — keyin real data bilan to'ldiramiz
function ContinueLearningCard() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[var(--color-primary)]" />
          O'rganishni davom etish
        </h2>
      </div>
      <div className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Hali biron darsni boshlamadingiz. Track tanlab boshlang!
        </p>
        <Link href="/tracks">
          <Button>
            Darslarni ko'rish <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Hayrli tun';
  if (hour < 12) return 'Hayrli tong';
  if (hour < 17) return 'Hayrli kun';
  if (hour < 22) return 'Hayrli kech';
  return 'Hayrli tun';
}