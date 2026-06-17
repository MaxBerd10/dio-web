'use client';

import { CircleCheck, Clock, Sparkles, RotateCcw, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QuizSummary } from '@/lib/api/quiz';

interface QuizCardProps {
  quiz: QuizSummary;
  onStart: (quizId: number) => void;
}

export function QuizCard({ quiz, onStart }: QuizCardProps) {
  const hasAttempts = quiz.user_attempts > 0;
  const hasBest = quiz.best_score !== null;
  const passed = hasBest && quiz.best_score! >= quiz.passing_score;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
              passed
                ? 'bg-green-500/15 text-green-500'
                : 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
            )}
          >
            <CircleCheck className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg leading-tight">
              {quiz.title}
            </h3>
            {quiz.description && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {quiz.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-muted-foreground)] flex-wrap">
              <span>{quiz.question_count} ta savol</span>
              {quiz.time_limit_seconds && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{Math.floor(quiz.time_limit_seconds / 60)} daq</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[var(--color-accent)]" />
                <span>+{quiz.xp_reward} XP</span>
              </div>
              <span>O'tish: {quiz.passing_score}%</span>
            </div>

            {/* Best score */}
            {hasBest && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  Eng yaxshi natija:
                </span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    passed
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                      : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]',
                  )}
                >
                  {quiz.best_score!.toFixed(0)}%{' '}
                  {passed ? "(O'tdi)" : "(O'tmadi)"}
                </span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  · {quiz.user_attempts} urinish
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Button fullWidth onClick={() => onStart(quiz.id)}>
            {hasAttempts ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Qaytadan urinish
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Testni boshlash
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}