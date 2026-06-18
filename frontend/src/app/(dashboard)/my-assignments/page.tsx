'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ArrowRight,
  Flame,
  Sparkles,
  BookOpen,
  Brain,
  ChevronRight,
  Trophy,
  Target,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth';
import { useDashboard } from '@/lib/hooks/use-dashboard';
import { useReviewQueue } from '@/lib/hooks/use-vocabulary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeaderboardPreview } from '@/components/dashboard/leaderboard-preview';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const greeting = getGreeting();
  const { data } = useDashboard();
  const { data: queue } = useReviewQueue(5);

  useEffect(() => {
    if (user && (user.role === 'teacher' || user.role === 'admin')) {
      router.replace('/teacher/submissions');
    }
  }, [user, router]);

  if (user && (user.role === 'teacher' || user.role === 'admin')) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center text-sm text-[var(--color-muted-foreground)]">
        Vazifalar sahifasiga o'tilmoqda...
      </div>
    );
  }

  const streak = data?.streak?.current_streak ?? 0;
  const totalXP = data?.xp?.total_xp ?? 0;
  const level = data?.xp?.level ?? 1;
  const lessonsCompleted = data?.stats?.lessons_completed ?? 0;
  const dailyEarned = data?.daily_goal?.earned_today ?? 0;
  const dailyTarget = data?.daily_goal?.target_xp ?? 30;
  const dailyDone = data?.daily_goal?.completed ?? false;
  const dailyPct = Math.min(100, Math.round((dailyEarned / dailyTarget) * 100));
  const wordsToReview = (queue?.due_count ?? 0) + (queue?.new_count ?? 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5">

      {/* Salomlashish */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {user?.full_name?.split(' ')[0] || user?.username}! 👋
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1 text-sm md:text-base">
          {dailyDone
            ? '✅ Bugungi maqsad bajarildi! Davom eting.'
            : `Bugungi maqsad: ${dailyEarned}/${dailyTarget} XP`}
        </p>
      </div>

      {/* Kunlik progress bar */}
      <div className="h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            dailyDone ? 'bg-green-500' : 'bg-[var(--color-primary)]',
          )}
          style={{ width: `${dailyPct}%` }}
        />
      </div>

      {/* 3 ta tezkor stat */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xl md:text-2xl font-bold text-orange-500">{streak}</p>
            <p className="text-[10px] md:text-xs text-[var(--color-muted-foreground)]">kun streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Sparkles className="h-5 w-5 text-[var(--color-primary)] mx-auto mb-1" />
            <p className="text-xl md:text-2xl font-bold text-[var(--color-primary)]">{totalXP}</p>
            <p className="text-[10px] md:text-xs text-[var(--color-muted-foreground)]">Lv {level} XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <GraduationCap className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl md:text-2xl font-bold text-green-500">{lessonsCompleted}</p>
            <p className="text-[10px] md:text-xs text-[var(--color-muted-foreground)]">dars tugadi</p>
          </CardContent>
        </Card>
      </div>

      {/* Asosiy CTAlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Darslarni davom ettirish */}
        <Link href="/tracks" className="block">
          <Card className="h-full border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/8 to-transparent hover:border-[var(--color-primary)]/40 transition-all hover:shadow-md active:scale-[0.99]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base">Darslar</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  General, CEFR va IELTS kurslari
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-[var(--color-primary)] shrink-0" />
            </CardContent>
          </Card>
        </Link>

        {/* Lug'at takrorlash */}
        <Link href="/vocabulary/review" className="block">
          <Card className={cn(
            'h-full transition-all hover:shadow-md active:scale-[0.99]',
            wordsToReview > 0
              ? 'border-amber-500/20 bg-gradient-to-br from-amber-500/8 to-transparent hover:border-amber-500/40'
              : 'opacity-70',
          )}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base">Lug'at takrorlash</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  {wordsToReview > 0
                    ? `${wordsToReview} ta so'z tayyor`
                    : 'Hozircha takrorlash yo\'q'}
                </p>
              </div>
              {wordsToReview > 0 && (
                <div className="h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {wordsToReview}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Grammar */}
        <Link href="/grammar" className="block">
          <Card className="h-full border-purple-500/20 bg-gradient-to-br from-purple-500/8 to-transparent hover:border-purple-500/40 transition-all hover:shadow-md active:scale-[0.99]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base">Grammar</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  17 ta mavzu — qoidalar va misollar
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-purple-500 shrink-0" />
            </CardContent>
          </Card>
        </Link>

        {/* Natijalarim */}
        <Link href="/my-progress" className="block">
          <Card className="h-full border-green-500/20 bg-gradient-to-br from-green-500/8 to-transparent hover:border-green-500/40 transition-all hover:shadow-md active:scale-[0.99]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base">Natijalarim</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  Progress, XP tarixi va statistika
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-green-500 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Leaderboard + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeaderboardPreview />

        {/* Achievements mini */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[var(--color-accent)]" />
                Yutuqlar
              </h3>
              <Link
                href="/achievements"
                className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-0.5"
              >
                Hammasi <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['🔥', '📖', '✅', '⚡', '🏅', '📚', '💯', '👑'].map((emoji, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-12 w-12 mx-auto rounded-xl flex items-center justify-center text-xl',
                    i < 2
                      ? 'bg-[var(--color-accent)]/15'
                      : 'bg-[var(--color-muted)] grayscale opacity-40',
                  )}
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)] text-center mt-3">
              2 / 12 yutuq olindi
            </p>
          </CardContent>
        </Card>
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