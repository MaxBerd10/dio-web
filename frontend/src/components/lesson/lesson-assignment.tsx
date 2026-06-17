'use client';

import { useState } from 'react';
import {
  ClipboardCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  Hourglass,
  Edit3,
} from 'lucide-react';

import { useLessonAssignments } from '@/lib/hooks/use-lesson-content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AssignmentEditor } from './assignment-editor';
import type { Assignment } from '@/lib/api/assignments';

interface LessonAssignmentProps {
  lessonId: number;
}

export function LessonAssignment({ lessonId }: LessonAssignmentProps) {
  const { data: assignments, isLoading } = useLessonAssignments(lessonId);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(
    null,
  );

  if (activeAssignment) {
    return (
      <AssignmentEditor
        assignment={activeAssignment}
        onClose={() => setActiveAssignment(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Bu darsda vazifalar yo'q.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => (
        <AssignmentCard
          key={a.id}
          assignment={a}
          onStart={() => setActiveAssignment(a)}
        />
      ))}
    </div>
  );
}

function AssignmentCard({
  assignment,
  onStart,
}: {
  assignment: Assignment;
  onStart: () => void;
}) {
  const sub = assignment.user_submission;
  const status = sub?.status;
  const statusInfo = getStatusInfo(status);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
              status === 'graded'
                ? 'bg-green-500/15 text-green-500'
                : 'bg-amber-500/15 text-amber-500',
            )}
          >
            <ClipboardCheck className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg leading-tight">
              {assignment.title}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {assignment.assignment_type_display}
            </p>

            <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-muted-foreground)] flex-wrap">
              {assignment.min_words && (
                <span>
                  {assignment.min_words}
                  {assignment.max_words && `–${assignment.max_words}`} so'z
                </span>
              )}
              {assignment.time_limit_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{assignment.time_limit_minutes} daq</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[var(--color-accent)]" />
                <span>+{assignment.xp_reward} XP</span>
              </div>
            </div>

            {/* Submission status */}
            {statusInfo && (
              <div
                className={cn(
                  'mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                  statusInfo.bgClass,
                  statusInfo.textClass,
                )}
              >
                <statusInfo.Icon className="h-3 w-3" />
                {statusInfo.label}
                {sub?.score !== null && sub?.score !== undefined && (
                  <span className="ml-1">· {Number(sub.score).toFixed(1)}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Button
            fullWidth
            variant={
              status === 'graded' || status === 'in_review' || status === 'submitted'
                ? 'outline'
                : 'primary'
            }
            onClick={onStart}
          >
            <Edit3 className="h-4 w-4" />
            {!status
              ? 'Vazifani boshlash'
              : status === 'draft'
                ? 'Davom etish'
                : 'Yana topshirish'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusInfo(status: string | undefined) {
  if (!status || status === 'draft') return null;

  if (status === 'submitted')
    return {
      label: 'Topshirildi',
      Icon: Hourglass,
      bgClass: 'bg-blue-500/15',
      textClass: 'text-blue-600 dark:text-blue-400',
    };
  if (status === 'in_review')
    return {
      label: 'Tekshirilmoqda',
      Icon: Hourglass,
      bgClass: 'bg-amber-500/15',
      textClass: 'text-amber-600 dark:text-amber-400',
    };
  if (status === 'graded')
    return {
      label: 'Baholandi',
      Icon: CheckCircle2,
      bgClass: 'bg-green-500/15',
      textClass: 'text-green-600 dark:text-green-400',
    };
  if (status === 'returned')
    return {
      label: 'Qaytarildi',
      Icon: CheckCircle2,
      bgClass: 'bg-orange-500/15',
      textClass: 'text-orange-600 dark:text-orange-400',
    };
  return null;
}