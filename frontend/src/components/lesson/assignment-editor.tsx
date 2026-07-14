'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardCheck,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
  Hourglass,
  X,
} from 'lucide-react';

import {
  assignmentsApi,
  type Assignment,
} from '@/lib/api/assignments';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { renderMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { SubmissionFeedback } from './submission-feedback';

interface AssignmentEditorProps {
  assignment: Assignment;
  onClose: () => void;
}

export function AssignmentEditor({ assignment, onClose }: AssignmentEditorProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Mavjud submission detail (agar bor bo'lsa)
  const existingSubId = assignment.user_submission?.id;
  const { data: submission, isLoading: isLoadingSub } = useQuery({
    queryKey: ['submission', existingSubId],
    queryFn: () => assignmentsApi.getSubmission(existingSubId!),
    enabled: !!existingSubId,
  });

  const isIELTS =
    assignment.title.includes('Task 1') ||
    assignment.title.includes('Task 2') ||
    assignment.title.toLowerCase().includes('ielts');

  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [content]);

  const minOk =
    assignment.min_words == null || wordCount >= assignment.min_words;
  const maxOk =
    assignment.max_words == null || wordCount <= assignment.max_words;
  const wordsOk = minOk && maxOk;

  const submitMutation = useMutation({
    mutationFn: () =>
      assignmentsApi.submitAssignment(assignment.id, { content }),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['lesson-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['submission'] });
    },
  });

  // Loading state
  if (existingSubId && isLoadingSub) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Submission graded yoki returned — feedback ko'rsatamiz
  if (
    submission &&
    (submission.status === 'graded' || submission.status === 'returned')
  ) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg hover:bg-[var(--color-muted)] flex items-center justify-center"
            aria-label="Yopish"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-semibold text-base md:text-lg truncate">
            {assignment.title}
          </h2>
        </div>

        <SubmissionFeedback submission={submission} isIELTS={isIELTS} />

        {/* Qaytarilgan bo'lsa — qayta urinish */}
        {submission.status === 'returned' && (
          <Card className="border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
            <CardContent className="p-5">
              <p className="font-semibold text-sm mb-1">
                Vazifa qaytarildi
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] mb-4">
                O'qituvchining tavsiyalarini hisobga olib, vazifani qayta yozing.
              </p>
              <Button
                fullWidth
                onClick={() => {
                  // submission state'ini tozalaymiz, editor ochiladi
                  setContent(submission.content);
                  // bu re-render qilish uchun — submission undefined emas, lekin status draftga aylandi deb hisoblaymiz
                  // Aslida API'da yangi submission yaratadi (chunki POST submit endpoint)
                  queryClient.setQueryData(
                    ['submission', existingSubId],
                    null,
                  );
                }}
              >
                Qayta yozish
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Submission submitted yoki in_review — kutish ekrani
  if (
    submission &&
    (submission.status === 'submitted' || submission.status === 'in_review')
  ) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg hover:bg-[var(--color-muted)] flex items-center justify-center"
            aria-label="Yopish"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-semibold text-base md:text-lg truncate">
            {assignment.title}
          </h2>
        </div>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/0">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="text-4xl mb-2">⏳</div>
            <h2 className="text-xl font-bold tracking-tight mb-2">
              {submission.status === 'in_review'
                ? "O'qituvchi tekshirmoqda"
                : "Tekshirishni kutmoqda"}
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
              Vazifangiz topshirildi. O'qituvchi tez orada baho va izoh
              qoldiradi. Tekshirish odatda 24-48 soat oladi.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Hourglass className="h-3 w-3" />
              {submission.status === 'in_review'
                ? 'Tekshirilmoqda'
                : 'Topshirildi'}
            </div>
          </CardContent>
        </Card>

        {/* Topshirgan matn (collapsed) */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
              Sizning javobingiz ({submission.word_count} so'z)
            </p>
            <div className="rounded-lg bg-[var(--color-muted)]/30 px-4 py-3 max-h-60 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {submission.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Yangi topshirish — success ekran
  if (submitted) {
    return (
      <div className="space-y-4">
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/0">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Vazifa topshirildi!
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
              O'qituvchi vazifangizni ko'rib chiqib, baho va izoh qoldiradi.
              Tekshirish odatda 24-48 soat oladi.
            </p>
            <div className="mt-5 text-xs text-[var(--color-muted-foreground)]">
              Status: <span className="font-semibold">Tekshirishni kutmoqda</span>
            </div>
          </CardContent>
        </Card>
        <Button fullWidth onClick={onClose}>
          Yopish
        </Button>
      </div>
    );
  }

  // Default — editor (yangi yozish yoki qayta yozish)
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-lg hover:bg-[var(--color-muted)] flex items-center justify-center"
          aria-label="Yopish"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base md:text-lg truncate">
            {assignment.title}
          </h2>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--color-muted-foreground)]">
            <span>{assignment.assignment_type_display}</span>
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
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Topshiriq
            </h3>
          </div>

          {assignment.image_url && (
            <div className="mb-4 rounded-lg overflow-hidden border border-[var(--color-border)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assignment.image_url}
                alt={assignment.title}
                className="w-full h-auto"
              />
            </div>
          )}

          <div className="text-sm md:text-base leading-relaxed">
            {renderMarkdown(assignment.instructions)}
          </div>
        </CardContent>
      </Card>

      {/* Rubric (collapsible) */}
      {assignment.rubric && <RubricCard rubric={assignment.rubric} />}

      {/* Editor */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Javobingiz
            </h3>
            <WordCountBadge
              count={wordCount}
              min={assignment.min_words}
              max={assignment.max_words}
              ok={wordsOk}
            />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Javobingizni shu yerga yozing..."
            className={cn(
              'w-full min-h-[300px] md:min-h-[400px] rounded-lg border-2 px-4 py-3',
              'text-sm md:text-base leading-relaxed',
              'bg-[var(--color-surface-elevated)] border-[var(--color-border)]',
              'focus-visible:outline-none focus-visible:border-[var(--color-primary)]',
              'transition-colors resize-y',
            )}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div>
        {!wordsOk && wordCount > 0 && (
          <div className="flex items-start gap-2 mb-3 text-xs text-[var(--color-danger)]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              {assignment.min_words && wordCount < assignment.min_words && (
                <>Kamida {assignment.min_words} ta so'z yozing.</>
              )}
              {assignment.max_words && wordCount > assignment.max_words && (
                <>Maksimum {assignment.max_words} ta so'z (siz {wordCount} yozdingiz).</>
              )}
            </p>
          </div>
        )}

        <Button
          fullWidth
          onClick={() => submitMutation.mutate()}
          disabled={wordCount === 0 || !wordsOk || submitMutation.isPending}
          loading={submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Yuborilmoqda...' : 'Topshirish'}
        </Button>
        <p className="text-xs text-[var(--color-muted-foreground)] text-center mt-2">
          O'qituvchi vazifangizni qo'lda tekshirib, baho qo'yadi.
        </p>
      </div>
    </div>
  );
}

function WordCountBadge({
  count,
  min,
  max,
  ok,
}: {
  count: number;
  min: number | null;
  max: number | null;
  ok: boolean;
}) {
  const targetText =
    min && max ? `${min}–${max} so'z` : min ? `≥${min} so'z` : max ? `≤${max} so'z` : null;

  return (
    <div className="flex items-center gap-2">
      {targetText && (
        <span className="text-xs text-[var(--color-muted-foreground)]">
          Maqsad: {targetText}
        </span>
      )}
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
          count === 0
            ? 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
            : ok
              ? 'bg-green-500/15 text-green-600 dark:text-green-400'
              : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]',
        )}
      >
        {ok && count > 0 && <CheckCircle2 className="h-3 w-3" />}
        {count} so'z
      </span>
    </div>
  );
}

function RubricCard({ rubric }: { rubric: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <CardContent className="p-0">
        <button
          onClick={() => setOpen(!open)}
          className="w-full p-5 flex items-center justify-between hover:bg-[var(--color-muted)]/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Baholash mezonlari
            </h3>
          </div>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {open ? 'Yashirish' : "Ko'rish"}
          </span>
        </button>
        {open && (
          <div className="px-5 pb-5 text-sm leading-relaxed">
            {renderMarkdown(rubric)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}