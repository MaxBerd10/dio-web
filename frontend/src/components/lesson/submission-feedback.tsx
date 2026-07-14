'use client';

import {
  ThumbsUp,
  Lightbulb,
  MessageSquare,
  Calendar,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SubmissionDetail } from '@/lib/api/assignments';

interface SubmissionFeedbackProps {
  submission: SubmissionDetail;
  isIELTS: boolean;
}

export function SubmissionFeedback({
  submission,
  isIELTS,
}: SubmissionFeedbackProps) {
  const score = submission.score ?? 0;
  const maxScore = isIELTS ? 9 : 100;
  const percentage = (Number(score) / maxScore) * 100;
  const isGoodScore = isIELTS ? Number(score) >= 6.5 : Number(score) >= 70;

  return (
    <div className="space-y-4">
      {/* Big score banner */}
      <Card
        className={cn(
          'overflow-hidden border-2',
          isGoodScore
            ? 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/0'
            : 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/0',
        )}
      >
        <CardContent className="p-6 md:p-8 text-center">
          <div className="text-4xl mb-2">{isGoodScore ? '🎉' : '💪'}</div>
          <h3 className="text-lg font-semibold mb-1">
            {isGoodScore ? "Ajoyib natija!" : "Yaxshi urinish!"}
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)] mb-5">
            Vazifangiz baholandi
          </p>

          <div className="flex items-baseline justify-center gap-2 mb-2">
            <div
              className={cn(
                'text-6xl md:text-7xl font-bold tracking-tight',
                isGoodScore ? 'text-green-500' : 'text-amber-500',
              )}
            >
              {Number(score).toFixed(isIELTS ? 1 : 0)}
            </div>
            <div className="text-xl text-[var(--color-muted-foreground)] font-medium">
              / {maxScore}
            </div>
          </div>

          {isIELTS && (
            <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
              IELTS Band Score
            </p>
          )}

          {/* Progress bar */}
          <div className="max-w-xs mx-auto h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isGoodScore ? 'bg-green-500' : 'bg-amber-500',
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teacher info */}
      {submission.reviewer_name && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center font-semibold shrink-0">
              {submission.reviewer_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Tekshiruvchi
              </p>
              <p className="font-medium text-sm">{submission.reviewer_name}</p>
            </div>
            {submission.reviewed_at && (
              <div className="text-right">
                <p className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(submission.reviewed_at)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* General feedback */}
      {submission.feedback && (
        <FeedbackBlock
          icon={MessageSquare}
          iconColor="text-[var(--color-primary)]"
          bgColor="bg-[var(--color-primary)]/5"
          borderColor="border-[var(--color-primary)]/20"
          title="Umumiy izoh"
          text={submission.feedback}
        />
      )}

      {/* Strengths */}
      {submission.strengths && (
        <FeedbackBlock
          icon={ThumbsUp}
          iconColor="text-green-500"
          bgColor="bg-green-500/5"
          borderColor="border-green-500/20"
          title="Kuchli tomonlari"
          text={submission.strengths}
        />
      )}

      {/* Improvements */}
      {submission.improvements && (
        <FeedbackBlock
          icon={Lightbulb}
          iconColor="text-amber-500"
          bgColor="bg-amber-500/5"
          borderColor="border-amber-500/20"
          title="Yaxshilash kerak"
          text={submission.improvements}
        />
      )}

      {/* Original submission collapsible */}
      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
            Sizning javobingiz ({submission.word_count} so'z)
          </p>
          <div className="rounded-lg bg-[var(--color-muted)]/30 px-4 py-3 max-h-60 overflow-y-auto">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {submission.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackBlock({
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  title,
  text,
}: {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  title: string;
  text: string;
}) {
  return (
    <Card className={cn('border', borderColor, bgColor)}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn('h-4 w-4', iconColor)} />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
            {title}
          </h3>
        </div>
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}