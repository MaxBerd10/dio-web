'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { quizApi, type QuizStartResponse } from '@/lib/api/quiz';
import { useLessonQuizzes } from '@/lib/hooks/use-lesson-content';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizCard } from './quiz-card';
import { QuizPlayer } from './quiz-player';

interface LessonQuizProps {
  lessonId: number;
}

export function LessonQuiz({ lessonId }: LessonQuizProps) {
  const queryClient = useQueryClient();
  const { data: quizzes, isLoading } = useLessonQuizzes(lessonId);
  const [startData, setStartData] = useState<QuizStartResponse | null>(null);

  const startMutation = useMutation({
    mutationFn: (quizId: number) => quizApi.startQuiz(quizId),
    onSuccess: (data) => setStartData(data),
  });

  const handleClose = () => {
    setStartData(null);
    // Quiz tugagandan keyin yangi best score'ni tortib olamiz
    queryClient.invalidateQueries({ queryKey: ['lesson-quizzes', lessonId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  if (startData) {
    return (
      <QuizPlayer
        startData={startData}
        onClose={handleClose}
        onComplete={() => {
          // Dashboard data ni yangilaymiz (XP, streak)
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Bu darsda testlar yo'q.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onStart={(id) => startMutation.mutate(id)}
        />
      ))}
    </div>
  );
}