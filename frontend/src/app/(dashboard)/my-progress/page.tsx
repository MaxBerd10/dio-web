'use client';

import {
  Flame,
  Sparkles,
  BookOpen,
  CircleCheck,
  Trophy,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { useDashboard } from '@/lib/hooks/use-dashboard';
import { useVocabularyStats } from '@/lib/hooks/use-vocabulary';
import { useAuthStore } from '@/store/auth';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function MyProgressPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useDashboard();
  const { data: vocabStats } = useVocabularyStats();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4 lg:p-8 animate-fadeIn">
        <Skeleton className="h-16 w-2/3 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const xp = data?.xp;
  const streak = data?.streak;
  const dailyEarned = xp?.daily_xp ?? 0;
  const dailyTarget = data?.daily_goal_xp ?? 30;
  const dailyDone = data?.daily_goal_met ?? false;
  const xpPercent = xp?.progress_to_next_level ?? 0;
  const dailyPercent = Math.min(100, Math.round((dailyEarned / dailyTarget) * 100));

  const wordsTotal = vocabStats?.total ?? data?.words_total ?? 0;
  const wordsMastered = vocabStats?.mastered ?? data?.words_mastered ?? 0;
  const wordsLearning = vocabStats?.learning ?? 0;
  const wordsNew = vocabStats?.new ?? 0;
  const wordPercent = wordsTotal > 0 ? Math.round((wordsMastered / wordsTotal) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-8 animate-fadeIn">
      <PageHeader
        icon={<TrendingUp className="h-6 w-6" />}
        title="Mening natijalarim"
        description={`${user?.full_name || user?.username} — o'quv jarayoni statistikasi`}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Joriy streak"
          value={streak?.current_streak ?? 0}
          unit="kun"
          accent="streak"
          sublabel={`Rekord: ${streak?.longest_streak ?? 0} kun`}
        />
        <StatCard
          icon={Sparkles}
          label="Jami XP"
          value={xp?.total_xp ?? 0}
          accent="primary"
          sublabel={`Daraja ${xp?.level ?? 1}`}
        />
        <StatCard
          icon={CircleCheck}
          label="Tugatilgan darslar"
          value={data?.lessons_completed ?? 0}
          accent="success"
          sublabel={`${data?.lessons_in_progress ?? 0} ta jarayonda`}
        />
        <StatCard
          icon={BookOpen}
          label="O'zlashtirilgan so'zlar"
          value={wordsMastered}
          accent="blue"
          sublabel={`Jami ${wordsTotal} ta`}
        />
      </div>

      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-soft)]">
                <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
              </span>
              <div>
                <p className="font-bold">Daraja {xp?.level ?? 1}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">XP jarayoni</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold tabular-nums text-[var(--color-primary)]">{xp?.total_xp ?? 0} XP</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Keyingi: {xp?.next_level_xp ?? 0} XP
              </p>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--color-muted)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-xs text-[var(--color-muted-foreground)]">{xpPercent}%</p>
        </CardContent>
      </Card>

      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  dailyDone ? 'bg-[var(--color-success)]/12' : 'bg-[var(--color-accent-soft)]',
                )}
              >
                {dailyDone ? (
                  <Zap className="h-5 w-5 text-[var(--color-success)]" />
                ) : (
                  <Target className="h-5 w-5 text-[var(--color-accent)]" />
                )}
              </span>
              <div>
                <p className="font-bold">Kunlik maqsad</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {dailyDone ? 'Bajarildi!' : 'Davom eting!'}
                </p>
              </div>
            </div>
            <p className="font-bold tabular-nums">
              {dailyEarned} / {dailyTarget} XP
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--color-muted)]">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                dailyDone
                  ? 'bg-gradient-to-r from-[var(--color-success)] to-[var(--color-level)]'
                  : 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)]',
              )}
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/12">
                <BookOpen className="h-4 w-4 text-blue-500" />
              </span>
              Lug&apos;at holati
            </h3>
            <div className="space-y-3">
              <ProgressRow label="Yangi" value={wordsNew} total={wordsTotal} color="#8b5cf6" />
              <ProgressRow label="O'rganilmoqda" value={wordsLearning} total={wordsTotal} color="#f59e0b" />
              <ProgressRow label="O'zlashtirilgan" value={wordsMastered} total={wordsTotal} color="#10b981" />
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--color-muted)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-[var(--color-primary)]"
                style={{ width: `${wordPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-[var(--color-muted-foreground)]">
              {wordPercent}% o&apos;zlashtirilgan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-soft)]">
                <Trophy className="h-4 w-4 text-[var(--color-accent)]" />
              </span>
              Faollik statistikasi
            </h3>
            <div className="space-y-3">
              <ActivityRow icon={CircleCheck} label="O'tilgan testlar" value={data?.quizzes_passed ?? 0} color="text-[var(--color-success)]" />
              <ActivityRow icon={Trophy} label="Yutuqlar" value={data?.achievements_earned ?? 0} suffix={`/ ${data?.achievements_total ?? 0}`} color="text-[var(--color-accent)]" />
              <ActivityRow icon={Flame} label="Eng uzun streak" value={streak?.longest_streak ?? 0} unit="kun" color="text-[var(--color-streak)]" />
              <ActivityRow icon={BookOpen} label="Takrorlash uchun so'zlar" value={data?.words_due_now ?? 0} color="text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ACCENTS = {
  streak: { bg: 'bg-[var(--color-streak)]/12', text: 'text-[var(--color-streak)]', border: 'border-[var(--color-streak)]/20' },
  primary: { bg: 'bg-[var(--color-primary-soft)]', text: 'text-[var(--color-primary)]', border: 'border-[var(--color-primary)]/20' },
  success: { bg: 'bg-[var(--color-success)]/12', text: 'text-[var(--color-success)]', border: 'border-[var(--color-success)]/20' },
  blue: { bg: 'bg-blue-500/12', text: 'text-blue-500', border: 'border-blue-500/20' },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  accent,
  sublabel,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit?: string;
  accent: keyof typeof ACCENTS;
  sublabel?: string;
}) {
  const styles = ACCENTS[accent];
  return (
    <Card className={cn('border', styles.border)}>
      <CardContent className="p-4">
        <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', styles.bg, styles.text)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-baseline gap-1">
          <p className={cn('text-2xl font-bold tabular-nums', styles.text)}>{value.toLocaleString()}</p>
          {unit && <p className="text-xs text-[var(--color-muted-foreground)]">{unit}</p>}
        </div>
        <p className="mt-0.5 text-xs font-semibold">{label}</p>
        {sublabel && (
          <p className="mt-0.5 text-[10px] text-[var(--color-muted-foreground)]">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="flex-1 text-sm">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="w-8 text-right text-xs text-[var(--color-muted-foreground)]">{pct}%</span>
    </div>
  );
}

function ActivityRow({
  icon: Icon,
  label,
  value,
  unit,
  suffix,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit?: string;
  suffix?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-[var(--color-muted)]/40 transition-colors">
      <Icon className={cn('h-4 w-4 shrink-0', color)} />
      <span className="flex-1 text-sm">{label}</span>
      <span className="text-sm font-bold tabular-nums">
        {value.toLocaleString()}
        {unit ? ` ${unit}` : ''}
        {suffix ?? ''}
      </span>
    </div>
  );
}
