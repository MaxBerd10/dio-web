'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Lock, CheckCircle2 } from 'lucide-react';

import { api } from '@/lib/api';
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

  // Kategoriya bo'yicha guruhlash
  const CATEGORY_LABELS: Record<string, string> = {
    streak: '🔥 Streak',
    vocabulary: '📖 Lug\'at',
    lesson: '📚 Darslar',
    quiz: '✅ Testlar',
    xp: '⚡ XP',
  };

  const grouped: Record<string, Achievement[]> = {};
  allAchievements?.forEach((a) => {
    const cat = a.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(a);
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Award className="h-7 w-7 text-[var(--color-accent)]" />
          Yutuqlar
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm">
          O'rganish davomida yutuqlarga ega bo'ling.
        </p>
      </div>

      {/* Progress summary */}
      {!isLoading && (
        <Card className="mb-6 border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent">
          <CardContent className="p-5 flex items-center gap-5 flex-wrap">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <p className="font-bold text-lg">
                {earnedCount} / {totalCount} yutuq
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {totalCount - earnedCount} ta qoldi
              </p>
              <div className="mt-2 h-2 bg-[var(--color-muted)] rounded-full overflow-hidden max-w-xs">
                <div
                  className="h-full bg-[var(--color-accent)] rounded-full transition-all"
                  style={{ width: totalCount > 0 ? `${(earnedCount / totalCount) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--color-accent)]">
                {Math.round(totalCount > 0 ? (earnedCount / totalCount) * 100 : 0)}%
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">bajarilgan</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements by category */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, achievements]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.map((achievement) => {
                  const earned = earnedIds.has(achievement.id);
                  const userAch = userAchievements?.find(
                    (ua) => ua.achievement.id === achievement.id,
                  );
                  return (
                    <Card
                      key={achievement.id}
                      className={cn(
                        'transition-all',
                        earned
                          ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5'
                          : 'opacity-60',
                      )}
                    >
                      <CardContent className="p-4 flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            'h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0',
                            earned
                              ? 'bg-[var(--color-accent)]/15'
                              : 'bg-[var(--color-muted)] grayscale',
                          )}
                        >
                          {earned ? achievement.icon : <Lock className="h-5 w-5 text-[var(--color-muted-foreground)]" />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              'font-semibold text-sm',
                              !earned && 'text-[var(--color-muted-foreground)]',
                            )}>
                              {achievement.title}
                            </p>
                            {earned && (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs text-[var(--color-accent)] font-medium">
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