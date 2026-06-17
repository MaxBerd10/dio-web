'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  User,
  FileText,
  Calendar,
  Hash,
  CheckCircle2,
  Hourglass,
  ArrowUpDown,
  ClipboardCheck as ReturnedIcon,
  PlayCircle,
} from 'lucide-react';

import { teacherSubmissionApi } from '@/lib/api/teacher';
import { useSubmissionForReview } from '@/lib/hooks/use-teacher';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { GradingForm } from '@/components/teacher/grading-form';
import type { SubmissionDetail } from '@/lib/api/assignments';

export default function SubmissionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const submissionId = parseInt(id, 10);

  const { user } = useAuthStore();
  const { data: submission, isLoading } = useSubmissionForReview(submissionId);
  const [justGraded, setJustGraded] = useState(false);

  if (user && user.role !== 'teacher' && user.role !== 'admin') {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="text-[var(--color-danger)]">Bu sahifa faqat o&apos;qituvchilar uchun.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Link href="/teacher/submissions" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4">
        <ChevronLeft className="h-4 w-4" />
        Barcha vazifalar
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-96" />
        </div>
      ) : !submission ? (
        <p className="text-[var(--color-danger)]">Vazifa topilmadi.</p>
      ) : (
        <SubmissionContent submission={submission} justGraded={justGraded} onGraded={() => setJustGraded(true)} />
      )}
    </div>
  );
}

function SubmissionContent({
  submission,
  justGraded,
  onGraded,
}: {
  submission: SubmissionDetail;
  justGraded: boolean;
  onGraded: () => void;
}) {
  const queryClient = useQueryClient();
  const statusInfo = getStatusInfo(submission.status);

  const isIELTS =
    submission.assignment_title.includes('Task 1') ||
    submission.assignment_title.includes('Task 2') ||
    submission.assignment_title.toLowerCase().includes('ielts');

  const claimMutation = useMutation({
    mutationFn: () => teacherSubmissionApi.claim(submission.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-submission', submission.id] });
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] });
    },
  });

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{submission.assignment_title}</h1>
        <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)] flex-wrap">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span className="font-medium text-[var(--color-foreground)]">{submission.student_name}</span>
            <span>(@{submission.student_username})</span>
          </div>
          {submission.submitted_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(submission.submitted_at)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            <span>{submission.word_count} so&apos;z</span>
          </div>
          <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', statusInfo.bgClass, statusInfo.textClass)}>
            <statusInfo.Icon className="h-3 w-3" />
            {statusInfo.label}
          </div>
        </div>
      </div>

      {/* Just graded celebration */}
      {justGraded && submission.status === 'graded' && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/0 mb-5">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/15 text-green-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Baho saqlandi!</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">O&apos;quvchi tez orada natijani ko&apos;radi.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: essay content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-[var(--color-primary)]" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">O&apos;quvchi javobi</h3>
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                {submission.content || (<em className="text-[var(--color-muted-foreground)]">(matn yo&apos;q)</em>)}
              </div>
            </CardContent>
          </Card>

          {submission.audio_file && (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-[var(--color-muted-foreground)] mb-2">Audio yozuv</p>
                <audio controls src={submission.audio_file} className="w-full" />
              </CardContent>
            </Card>
          )}

          {submission.attachment && (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-[var(--color-muted-foreground)] mb-2">Qo&apos;shilgan fayl</p>
                <a href={submission.attachment} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] underline">Faylni ochish</a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: actions */}
        <div className="lg:col-span-1 space-y-4">
          {submission.status === 'submitted' && (
            <Card className="border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
              <CardContent className="p-5">
                <p className="font-semibold mb-1">Tekshirishni boshlaysizmi?</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-4">Vazifani o&apos;zingizga biriktirib, baholash formaiga o&apos;tasiz.</p>
                <Button fullWidth onClick={() => claimMutation.mutate()} loading={claimMutation.isPending}>
                  <PlayCircle className="h-4 w-4" />
                  Tekshirishni boshlash
                </Button>
              </CardContent>
            </Card>
          )}

          {(submission.status === 'in_review' || submission.status === 'graded' || submission.status === 'returned') && (
            <GradingForm submission={submission} isIELTS={isIELTS} onSuccess={onGraded} />
          )}

          {submission.reviewer_name && (
            <Card>
              <CardContent className="p-4 text-xs text-[var(--color-muted-foreground)]">
                <p>Tekshiruvchi: <span className="font-medium text-[var(--color-foreground)]">{submission.reviewer_name}</span></p>
                {submission.reviewed_at && (<p className="mt-1">Tekshirildi: {formatDate(submission.reviewed_at)}</p>)}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function getStatusInfo(status: string) {
  if (status === 'submitted') return { label: 'Yangi', Icon: Hourglass, bgClass: 'bg-blue-500/15', textClass: 'text-blue-600 dark:text-blue-400' };
  if (status === 'in_review') return { label: 'Tekshirilmoqda', Icon: ArrowUpDown, bgClass: 'bg-amber-500/15', textClass: 'text-amber-600 dark:text-amber-400' };
  if (status === 'graded') return { label: 'Baholangan', Icon: CheckCircle2, bgClass: 'bg-green-500/15', textClass: 'text-green-600 dark:text-green-400' };
  return { label: 'Qaytarilgan', Icon: ReturnedIcon, bgClass: 'bg-orange-500/15', textClass: 'text-orange-600 dark:text-orange-400' };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}