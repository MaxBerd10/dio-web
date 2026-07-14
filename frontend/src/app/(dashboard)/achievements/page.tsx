'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Lock, CheckCircle2 } from 'lucide-react';

import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  target_value: number;
  xp_reward: number;
  order: number;
}

interface UserAchievement {
  id: number;
  achievement: Achievement;
  earned_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  streak: '🔥 Streak',
  vocabulary: "📖 Lug'at",
  lesson: '📚 Darslar',
  quiz: '✅ Testlar',
  xp: '⚡ XP',
};

export default function AchievementsPage() {
  const { data: allAchievements, isLoading: loadingAll } = useQuery({
    queryKey: ['achievements'],
    queryFn: async (): Promise<Achievement[]> => {
      const { data } = await api.get('/progress/achievements/');
      if (Array.isArray(data)) return data;
      if (data?.results) return data.results;
      return [];
    },
  });

  const { data: userAchievements, isLoading: loadingUser } = useQuery({
    queryKey: ['my-achievements'],
    queryFn: async (): Promise<UserAchievement[]> => {
      const { data } = await api.get('/progress/my-achievements/');
      if (Array.isArray(data)) return data;
      if (data?.results) return data.results;
      return [];
    },
  });

  const isLoading = loadingAll || loadingUser;
  const earnedIds = new Set(userAchievements?.map((ua) => ua.achievement.id) ?? []);
  const earnedCount = earnedIds.size;
  const totalCount = allAchievements?.length ?? 0;
  const pct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const grouped: Record<string, Achievement[]> = {};
  allAchievements?.forEach((a) => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-8 animate-fadeIn">
      <PageHeader
        icon={<Award className="h-6 w-6 text-[var(--color-accent)]" />}
        title="Yutuqlar"
        description="O'rganish davomida yutuqlarga ega bo'ling."
        badge={!isLoading ? `${earnedCount}/${totalCount}` : undefined}
      />

      {!isLoading && (
        <Card className="mb-6 overflow-hidden border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent-soft)] to-transparent">
          <CardContent className="flex flex-wrap items-center gap-5 p-5">
            <div className="text-5xl">🏆</div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-lg font-bold">
                {earnedCount} / {totalCount} yutuq
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {totalCount - earnedCount} ta qoldi
              </p>
              <div className="mt-3 h-2.5 max-w-xs overflow-hidden rounded-full bg-[var(--color-muted)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[var(--color-accent)]">{pct}%</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">bajarilgan</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, achievements]) => (
            <div key={category}>
              <h2 className="section-label mb-3">{CATEGORY_LABELS[category] || category}</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {achievements.map((achievement) => {
                  const earned = earnedIds.has(achievement.id);
                  const userAch = userAchievements?.find((ua) => ua.achievement.id === achievement.id);
                  return (
                    <Card
                      key={achievement.id}
                      className={cn(
                        'transition-all',
                        earned
                          ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)]/30'
                          : 'opacity-55',
                      )}
                    >
                      <CardContent className="flex items-start gap-4 p-4">
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl',
                            earned ? 'bg-[var(--color-accent-soft)]' : 'bg-[var(--color-muted)] grayscale',
                          )}
                        >
                          {earned ? achievement.icon : <Lock className="h-5 w-5 text-[var(--color-muted-foreground)]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn('font-bold text-sm', !earned && 'text-[var(--color-muted-foreground)]')}>
                              {achievement.title}
                            </p>
                            {earned && <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-success)]" />}
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
                            {achievement.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="text-xs font-semibold text-[var(--color-accent)]">
                              +{achievement.xp_reward} XP
                            </span>
                            {earned && userAch && (
                              <span className="text-[10px] text-[var(--color-muted-foreground)]">
                                {new Date(userAch.earned_at).toLocaleDateString('uz-UZ')}
                              </span>
                            )}
                            {!earned && (
                              <span className="text-[10px] text-[var(--color-muted-foreground)]">
                                Maqsad: {achievement.target_value}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
