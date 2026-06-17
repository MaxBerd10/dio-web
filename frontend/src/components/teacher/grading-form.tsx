'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  ThumbsUp,
  Lightbulb,
  Send,
  Save,
} from 'lucide-react';

import {
  teacherSubmissionApi,
  type GradePayload,
} from '@/lib/api/teacher';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SubmissionDetail } from '@/lib/api/assignments';

interface GradingFormProps {
  submission: SubmissionDetail;
  isIELTS: boolean; // IELTS bo'lsa 0-9 band, aks holda 0-100
  onSuccess: () => void;
}

export function GradingForm({
  submission,
  isIELTS,
  onSuccess,
}: GradingFormProps) {
  const queryClient = useQueryClient();
  const [score, setScore] = useState<string>(
    submission.score !== null ? String(submission.score) : '',
  );
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [strengths, setStrengths] = useState(submission.strengths || '');
  const [improvements, setImprovements] = useState(
    submission.improvements || '',
  );

  // Submission o'zgarsa form qiymatlarini yangilash (claim qilingach)
  useEffect(() => {
    setScore(submission.score !== null ? String(submission.score) : '');
    setFeedback(submission.feedback || '');
    setStrengths(submission.strengths || '');
    setImprovements(submission.improvements || '');
  }, [submission.id]);

  const gradeMutation = useMutation({
    mutationFn: (payload: GradePayload) =>
      teacherSubmissionApi.grade(submission.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teacher-submission', submission.id],
      });
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] });
      onSuccess();
    },
  });

  const scoreNum = parseFloat(score);
  const maxScore = isIELTS ? 9 : 100;
  const scoreValid =
    !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= maxScore;

  const canSubmit = scoreValid && feedback.trim().length > 0;

  const handleSubmit = (status: 'graded' | 'returned') => {
    if (!canSubmit) return;
    gradeMutation.mutate({
      score: scoreNum,
      feedback: feedback.trim(),
      strengths: strengths.trim(),
      improvements: improvements.trim(),
      status,
    });
  };

  return (
    <Card>
      <CardContent className="p-5 md:p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-lg">Baholash</h3>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
            {isIELTS
              ? '0 dan 9 gacha band ball qo\'ying'
              : '0 dan 100 gacha ball qo\'ying'}
          </p>
        </div>

        {/* Score */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-1.5">
            <Star className="h-4 w-4 text-[var(--color-accent)]" />
            Ball
            <span className="text-[var(--color-danger)]">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min={0}
              max={maxScore}
              step={isIELTS ? 0.5 : 1}
              placeholder={isIELTS ? '7.5' : '85'}
              className={cn(
                'w-32 h-11 rounded-lg border-2 px-3 text-lg font-bold',
                'bg-[var(--color-surface-elevated)] border-[var(--color-border)]',
                'focus-visible:outline-none focus-visible:border-[var(--color-primary)]',
                !scoreValid && score && 'border-[var(--color-danger)]',
              )}
            />
            <span className="text-sm text-[var(--color-muted-foreground)]">
              / {maxScore}
            </span>
          </div>
          {!scoreValid && score && (
            <p className="text-xs text-[var(--color-danger)] mt-1">
              Ball 0 va {maxScore} oralig'ida bo'lishi kerak.
            </p>
          )}
        </div>

        {/* Feedback */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Umumiy izoh
            <span className="text-[var(--color-danger)]"> *</span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Vazifa haqida umumiy fikringizni yozing..."
            rows={4}
            className={cn(
              'w-full rounded-lg border-2 px-3 py-2 text-sm',
              'bg-[var(--color-surface-elevated)] border-[var(--color-border)]',
              'focus-visible:outline-none focus-visible:border-[var(--color-primary)]',
              'transition-colors resize-y',
            )}
          />
        </div>

        {/* Strengths */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-1.5">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            Kuchli tomonlari
          </label>
          <textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="Nima yaxshi chiqdi?"
            rows={3}
            className={cn(
              'w-full rounded-lg border-2 px-3 py-2 text-sm',
              'bg-[var(--color-surface-elevated)] border-[var(--color-border)]',
              'focus-visible:outline-none focus-visible:border-[var(--color-primary)]',
              'transition-colors resize-y',
            )}
          />
        </div>

        {/* Improvements */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-1.5">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Yaxshilash kerak
          </label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="Nima ustida ishlashi kerak?"
            rows={3}
            className={cn(
              'w-full rounded-lg border-2 px-3 py-2 text-sm',
              'bg-[var(--color-surface-elevated)] border-[var(--color-border)]',
              'focus-visible:outline-none focus-visible:border-[var(--color-primary)]',
              'transition-colors resize-y',
            )}
          />
        </div>

        {/* Submit buttons — vertikal joylashtirilgan */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => handleSubmit('graded')}
            disabled={!canSubmit || gradeMutation.isPending}
            loading={gradeMutation.isPending}
            fullWidth
          >
            <Send className="h-4 w-4" />
            {gradeMutation.isPending ? 'Saqlanmoqda...' : 'Bahoni saqlash'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('returned')}
            disabled={!canSubmit || gradeMutation.isPending}
            fullWidth
          >
            <Save className="h-4 w-4" />
            Qaytarish (student qayta yozsin)
          </Button>
        </div>

        <p className="text-xs text-[var(--color-muted-foreground)] text-center">
          <strong>Bahoni saqlash</strong> — yakuniy ball.{' '}
          <strong>Qaytarish</strong> — student qayta yozsin.
        </p>
      </CardContent>
    </Card>
  );
}