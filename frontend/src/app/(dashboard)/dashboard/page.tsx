'use client';

import type { ReactNode } from 'react';
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
  Gamepad2,
  Target,
  Trophy,
  ChevronRight,
  Zap,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth';
import { useDashboard } from '@/lib/hooks/use-dashboard';
import { useReviewQueue } from '@/lib/hooks/use-vocabulary';
import { Card, CardContent } from '@/components/ui/card';
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
      router.replace('/teacher/students');
    }
  }, [user, router]);

  if (user && (user.role === 'teacher' || user.role === 'admin')) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center text-sm text-[var(--color-muted-foreground)] animate-pulse-soft">
        Studentlar sahifasiga o&apos;tilmoqda...
      </div>
    );
  }

  const streak = data?.streak?.current_streak ?? 0;
  const totalXP = data?.xp?.total_xp ?? 0;
  const level = data?.xp?.level ?? 1;
  const lessonsCompleted = data?.lessons_completed ?? 0;
  const dailyEarned = data?.xp?.daily_xp ?? 0;
  const dailyTarget = data?.daily_goal_xp ?? 30;
  const dailyDone = data?.daily_goal_met ?? false;
  const dailyPct = Math.min(100, Math.round((dailyEarned / dailyTarget) * 100));
  const wordsToReview = (queue?.due_count ?? 0) + (queue?.new_count ?? 0);
  const displayName =
    user?.full_name?.trim().split(/\s+/)[0] || user?.username || 'do\'st';

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 lg:space-y-6 lg:p-8 animate-fadeIn">
      {/* Hero */}
      <section className="relative rounded-3xl border border-[var(--color-primary)]/15 bg-gradient-to-br from-[var(--color-primary)]/15 via-[var(--color-surface-elevated)] to-[var(--color-accent)]/10 p-5 lg:p-7">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-primary)]/10 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[var(--color-accent)]/15 blur-2xl" />
        </div>

        <div className="relative">
          <p className="section-label">{greeting}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">
            Salom, <span className="text-[var(--color-primary)]">{displayName}</span> 👋
          </h1>

          <div className="mt-4 rounded-2xl bg-[var(--color-background)]/60 backdrop-blur-sm border border-[var(--color-border)] p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Zap className={cn('h-4 w-4', dailyDone ? 'text-[var(--color-success)]' : 'text-[var(--color-accent)]')} />
                <span className="text-sm font-semibold">
                  {dailyDone ? 'Bugungi maqsad bajarildi!' : 'Kunlik maqsad'}
                </span>
              </div>
              <span className="text-sm font-bold tabular-nums text-[var(--color-primary)]">
                {dailyEarned}/{dailyTarget} XP
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--color-muted)]">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out',
                  dailyDone
                    ? 'bg-gradient-to-r from-[var(--color-success)] to-[var(--color-level)]'
                    : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]',
                )}
                style={{ width: `${dailyPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          <StatCard
            icon={<Flame className="h-[18px] w-[18px]" strokeWidth={2} />}
            value={streak}
            label="kun streak"
            accent="streak"
          />
          <StatCard
            icon={<Sparkles className="h-[18px] w-[18px]" strokeWidth={2} />}
            value={totalXP}
            label={`Lv ${level} · XP`}
            accent="primary"
          />
          <StatCard
            icon={<GraduationCap className="h-[18px] w-[18px]" strokeWidth={2} />}
            value={lessonsCompleted}
            label="dars tugadi"
            accent="success"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-3">
        <h2 className="section-label px-0.5">Davom eting</h2>

        <QuickAction
          href="/vocabulary/review"
          title="Lug'at takrorlash"
          subtitle={
            wordsToReview > 0
              ? `${wordsToReview} ta so'z kutmoqda`
              : "Hozircha takrorlash yo'q"
          }
          icon={<BookOpen className="h-5 w-5" strokeWidth={2} />}
          accent="amber"
          highlight={wordsToReview > 0}
          badge={wordsToReview > 0 ? wordsToReview : undefined}
        />

        <QuickAction
          href="/tracks"
          title="Darslar"
          subtitle="General, CEFR va IELTS"
          icon={<GraduationCap className="h-5 w-5" strokeWidth={2} />}
          accent="primary"
        />

        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            href="/games"
            title="O'yinlar"
            subtitle="XP yig'ing"
            icon={<Gamepad2 className="h-[18px] w-[18px]" strokeWidth={2} />}
            accent="pink"
            compact
          />
          <QuickAction
            href="/grammar"
            title="Grammar"
            subtitle="17 mavzu"
            icon={<Brain className="h-[18px] w-[18px]" strokeWidth={2} />}
            accent="purple"
            compact
          />
        </div>

        <QuickAction
          href="/my-progress"
          title="Natijalarim"
          subtitle="Progress va statistika"
          icon={<Target className="h-5 w-5" strokeWidth={2} />}
          accent="success"
        />
      </section>

      {/* Bottom grid */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeaderboardPreview />

        <Card className="overflow-hidden">
          <CardContent className="p-4 lg:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-soft)]">
                  <Trophy className="h-4 w-4 text-[var(--color-accent)]" />
                </span>
                Yutuqlar
              </h3>
              <Link
                href="/achievements"
                className="flex items-center gap-0.5 text-xs font-semibold text-[var(--color-primary)]"
              >
                Hammasi <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['🔥', '📖', '✅', '⚡', '🏅', '📚', '💯', '👑'].map((emoji, i) => (
                <div
                  key={i}
                  className={cn(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-transform',
                    i < 2
                      ? 'bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-primary-soft)] scale-105'
                      : 'bg-[var(--color-muted)] opacity-35 grayscale',
                  )}
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-[var(--color-muted-foreground)]">
              <span className="font-bold text-[var(--color-foreground)]">2</span> / 12 yutuq olindi
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

const ACCENT_MAP = {
  streak: {
    icon: 'text-[var(--color-streak)]',
    bg: 'bg-[var(--color-streak)]/12',
    value: 'text-[var(--color-streak)]',
    border: 'border-[var(--color-streak)]/20',
  },
  primary: {
    icon: 'text-[var(--color-primary)]',
    bg: 'bg-[var(--color-primary-soft)]',
    value: 'text-[var(--color-primary)]',
    border: 'border-[var(--color-primary)]/20',
  },
  success: {
    icon: 'text-[var(--color-success)]',
    bg: 'bg-[var(--color-success)]/12',
    value: 'text-[var(--color-success)]',
    border: 'border-[var(--color-success)]/20',
  },
  amber: {
    icon: 'text-amber-500',
    bg: 'bg-amber-500/15',
    value: 'text-amber-600',
    border: 'border-amber-500/25',
  },
  pink: {
    icon: 'text-pink-500',
    bg: 'bg-pink-500/15',
    value: 'text-pink-600',
    border: 'border-pink-500/20',
  },
  purple: {
    icon: 'text-purple-500',
    bg: 'bg-purple-500/15',
    value: 'text-purple-600',
    border: 'border-purple-500/20',
  },
} as const;

type Accent = keyof typeof ACCENT_MAP;

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  accent: Accent;
}) {
  const styles = ACCENT_MAP[accent];
  return (
    <Card className={cn('min-w-0 overflow-hidden border', styles.border)}>
      <CardContent className="p-4 text-center lg:p-5">
        <div
          className={cn(
            'mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl lg:h-11 lg:w-11',
            styles.bg,
            styles.icon,
          )}
        >
          {icon}
        </div>
        <p className={cn('text-xl font-bold tabular-nums lg:text-2xl', styles.value)}>{value}</p>
        <p className="mt-1 break-words text-xs leading-tight text-[var(--color-muted-foreground)]">{label}</p>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  href,
  title,
  subtitle,
  icon,
  accent,
  highlight,
  badge,
  compact,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent: Accent;
  highlight?: boolean;
  badge?: number;
  compact?: boolean;
}) {
  const styles = ACCENT_MAP[accent];
  return (
    <Link href={href} className="block min-w-0 active:scale-[0.98] transition-transform">
      <Card
        className={cn(
          'h-full overflow-hidden transition-all hover:shadow-md',
          highlight && 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent',
        )}
      >
        <CardContent
          className={cn(
            'flex items-center gap-3 p-4',
            compact && 'max-sm:flex-col max-sm:items-start max-sm:gap-2.5 max-sm:p-3',
          )}
        >
          <div
            className={cn(
              'grid shrink-0 place-items-center rounded-xl',
              styles.bg,
              styles.icon,
              compact ? 'h-10 w-10' : 'h-11 w-11',
            )}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className={cn('truncate font-bold', compact ? 'text-sm lg:text-base' : 'text-base')}>{title}</p>
            <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">{subtitle}</p>
          </div>
          {badge !== undefined ? (
            <div className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
              {badge}
            </div>
          ) : (
            !compact && (
              <ArrowRight className="h-5 w-5 shrink-0 text-[var(--color-muted-foreground)]/60" />
            )
          )}
        </CardContent>
      </Card>
    </Link>
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
