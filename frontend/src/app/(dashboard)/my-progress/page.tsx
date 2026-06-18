'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  Sparkles,
  BookOpen,
  CircleCheck,
  Brain,
  Trophy,
  Target,
  TrendingUp,
} from 'lucide-react';

import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DashboardData {
  streak: { current_streak: number; longest_streak: number; last_activity: string | null };
  xp: { total_xp: number; level: number; xp_to_next_level: number; xp_for_current_level: number };
  stats: {
    lessons_completed: number;
    lessons_in_progress: number;
    quizzes_passed: number;
    words_mastered: number;
    words_total: number;
    words_due_now: number;
    assignments_submitted: number;
  };
  daily_goal: { target_xp: number; earned_today: number; completed: boolean };
}

export default function MyProgressPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const { data } = await api.get('/progress/dashboard/');
      return data;
    },
    enabled: user?.role === 'student',
  });

  const { data: xpData } = useQuery({
    queryKey: ['xp-history'],
    queryFn: async () => {
      const { data } = await api.get('/progress/xp/');
      return data;
    },
    enabled: user?.role === 'student',
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const xp = data?.xp;
  const streak = data?.streak;
  const stats = data?.stats;
  const daily = data?.daily_goal;

  const xpPercent = xp
    ? Math.round(((xp.total_xp - xp.xp_for_current_level) / (xp.xp_to_next_level - xp.xp_for_current_level)) * 100)
    : 0;

  const wordPercent = stats?.words_total
    ? Math.round((stats.words_mastered / stats.words_total) * 100)
    : 0;

  const dailyPercent = daily
    ? Math.min(100, Math.round((daily.earned_today / daily.target_xp) * 100))
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-[var(--color-primary)]" />
          Mening natijalarim
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm">
          {user?.full_name || user?.username} — o'quv jarayoni statistikasi
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={Flame}
          label="Joriy streak"
          value={streak?.current_streak ?? 0}
          unit="kun"
          color="#f97316"
          sublabel={`Rekord: ${streak?.longest_streak ?? 0} kun`}
        />
        <StatCard
          icon={Sparkles}
          label="Jami XP"
          value={xp?.total_xp ?? 0}
          color="#8b5cf6"
          sublabel={`Daraja ${xp?.level ?? 1}`}
        />
        <StatCard
          icon={CircleCheck}
          label="Tugatilgan darslar"
          value={stats?.lessons_completed ?? 0}
          color="#10b981"
          sublabel={`${stats?.lessons_in_progress ?? 0} ta jarayonda`}
        />
        <StatCard
          icon={BookOpen}
          label="O'zlashtirilgan so'zlar"
          value={stats?.words_mastered ?? 0}
          color="#3b82f6"
          sublabel={`Jami ${stats?.words_total ?? 0} ta`}
        />
      </div>

      {/* XP Level progress */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)]/15 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="font-semibold text-sm">Daraja {xp?.level ?? 1}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">XP jarayoni</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[var(--color-primary)]">{xp?.total_xp ?? 0} XP</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Keyingi daraja: {xp?.xp_to_next_level ?? 0} XP
              </p>
            </div>
          </div>
          <div className="h-3 bg-[var(--color-muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1.5 text-right">
            {xpPercent}%
          </p>
        </CardContent>
      </Card>

      {/* Daily goal */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center',
                daily?.completed
                  ? 'bg-green-500/15 text-green-500'
                  : 'bg-amber-500/15 text-amber-500',
              )}>
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Kunlik maqsad</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {daily?.completed ? "✅ Bajarildi!" : "Davom eting!"}
                </p>
              </div>
            </div>
            <p className="font-bold">
              {daily?.earned_today ?? 0} / {daily?.target_xp ?? 30} XP
            </p>
          </div>
          <div className="h-3 bg-[var(--color-muted)] rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                daily?.completed ? 'bg-green-500' : 'bg-amber-500',
              )}
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vocabulary progress */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Lug'at holati
            </h3>
            <div className="space-y-3">
              <ProgressRow label="Yangi" value={stats?.words_total ? stats.words_total - stats.words_mastered - 0 : 0} total={stats?.words_total ?? 0} color="#8b5cf6" />
              <ProgressRow label="O'rganilmoqda" value={0} total={stats?.words_total ?? 0} color="#f59e0b" />
              <ProgressRow label="O'zlashtirilgan" value={stats?.words_mastered ?? 0} total={stats?.words_total ?? 0} color="#10b981" />
            </div>
            <div className="mt-4 h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${wordPercent}%` }}
              />
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {wordPercent}% o'zlashtirilgan
            </p>
          </CardContent>
        </Card>

        {/* Activity stats */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Faollik statistikasi
            </h3>
            <div className="space-y-3">
              <ActivityRow
                icon={CircleCheck}
                label="O'tilgan testlar"
                value={stats?.quizzes_passed ?? 0}
                color="text-green-500"
              />
              <ActivityRow
                icon={Brain}
                label="Topshirilgan vazifalar"
                value={stats?.assignments_submitted ?? 0}
                color="text-purple-500"
              />
              <ActivityRow
                icon={Flame}
                label="Eng uzun streak"
                value={streak?.longest_streak ?? 0}
                unit="kun"
                color="text-orange-500"
              />
              <ActivityRow
                icon={BookOpen}
                label="Takrorlash uchun so'zlar"
                value={stats?.words_due_now ?? 0}
                color="text-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  sublabel,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit?: string;
  color: string;
  sublabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center mb-3"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold" style={{ color }}>
            {value.toLocaleString()}
          </p>
          {unit && <p className="text-xs text-[var(--color-muted-foreground)]">{unit}</p>}
        </div>
        <p className="text-xs font-medium mt-0.5">{label}</p>
        {sublabel && (
          <p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm flex-1">{label}</span>
      <span className="text-sm font-medium">{value}</span>
      <span className="text-xs text-[var(--color-muted-foreground)] w-8 text-right">{pct}%</span>
    </div>
  );
}

function ActivityRow({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className={cn('h-4 w-4 shrink-0', color)} />
      <span className="text-sm flex-1">{label}</span>
      <span className="font-semibold text-sm">
        {value.toLocaleString()}{unit ? ` ${unit}` : ''}
      </span>
    </div>
  );
}