'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Sparkles } from 'lucide-react';

import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LessonProgress {
  id: number;
  lesson: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  xp_earned: number;
}

interface LessonCompleteButtonProps {
  lessonId: number;
  xpReward: number;
}

export function LessonCompleteButton({
  lessonId,
  xpReward,
}: LessonCompleteButtonProps) {
  const queryClient = useQueryClient();
  const [justCompleted, setJustCompleted] = useState<{
    xpEarned: number;
  } | null>(null);

  // Joriy progress holatini olamiz
  const { data: progressList } = useQuery({
    queryKey: ['my-lesson-progress'],
    queryFn: async () => {
      const { data } = await api.get<{
        results?: LessonProgress[];
      }>('/progress/lessons/?status=completed');
      return data.results ?? [];
    },
  });

  const isCompleted = progressList?.some((p) => p.lesson === lessonId);

  const completeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{
        progress: LessonProgress;
        xp_earned: number;
      }>(`/progress/lessons/${lessonId}/`, {
        action: 'complete',
      });
      return data;
    },
    onSuccess: (data) => {
      setJustCompleted({ xpEarned: data.xp_earned });
      // Hamma joydagi cache'ni yangilaymiz
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-lesson-progress'] });
    },
  });

  // Endi tugatildi — celebration
  if (justCompleted) {
    return (
      <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/0">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold mb-1">Tabriklaymiz!</h3>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
            Darsni muvaffaqiyatli tugatdingiz.
          </p>
          {justCompleted.xpEarned > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-bold">
              <Sparkles className="h-4 w-4" />+{justCompleted.xpEarned} XP olindi
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Allaqachon tugatilgan
  if (isCompleted) {
    return (
      <Card className="border-green-500/20">
        <CardContent className="p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500/15 text-green-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Bu dars tugatilgan</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Yana darsni qayta o'qish va testlarni yechib ko'rishingiz mumkin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tugatish tugmasi
  return (
    <Card className="border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Darsni tugatdingizmi?</p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              So'zlar, grammar va testlarni o'qib bo'lganingizdan keyin
              tugatishingiz mumkin. <span className="font-semibold">+{xpReward} XP</span> olasiz.
            </p>
          </div>
        </div>
        <Button
          fullWidth
          onClick={() => completeMutation.mutate()}
          loading={completeMutation.isPending}
        >
          {completeMutation.isPending ? 'Tugatilmoqda...' : 'Darsni tugatish'}
        </Button>
      </CardContent>
    </Card>
  );
}