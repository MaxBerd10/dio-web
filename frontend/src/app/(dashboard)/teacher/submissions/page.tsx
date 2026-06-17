'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  Inbox,
  Clock,
  CheckCircle2,
  Hourglass,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';

import { useTeacherSubmissions } from '@/lib/hooks/use-teacher';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
  SubmissionStatus,
  SubmissionListItem,
} from '@/lib/api/teacher';

type FilterValue = 'all' | SubmissionStatus;

const FILTERS: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'Hammasi' },
  { value: 'submitted', label: 'Yangi' },
  { value: 'in_review', label: 'Tekshirilmoqda' },
  { value: 'graded', label: 'Baholangan' },
  { value: 'returned', label: 'Qaytarilgan' },
];

export default function TeacherSubmissionsPage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<FilterValue>('all');

  const { data, isLoading } = useTeacherSubmissions(
    filter === 'all' ? undefined : filter,
  );

  const submissions = data?.results ?? [];
  const total = data?.count ?? 0;

  // Faqat teacher/admin uchun ruxsat
  if (user && user.role !== 'teacher' && user.role !== 'admin') {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="text-[var(--color-danger)]">
          Bu sahifa faqat o'qituvchilar uchun.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Inbox className="h-7 w-7 text-[var(--color-primary)]" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Vazifalar
          </h1>
        </div>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          O'quvchilar topshirgan yozma vazifalarni ko'rib chiqing va baholang.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              filter === f.value
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                : 'bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Result info */}
      {!isLoading && (
        <p className="text-xs text-[var(--color-muted-foreground)] mb-3">
          {total} ta natija
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <SubmissionRow key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission }: { submission: SubmissionListItem }) {
  const statusInfo = getStatusInfo(submission.status);

  return (
    <Link href={`/teacher/submissions/${submission.id}`} className="block group">
      <Card className="transition-all hover:border-[var(--color-primary)] hover:shadow-sm group-active:scale-[0.995]">
        <CardContent className="p-4 md:p-5 flex items-start gap-4">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center font-semibold shrink-0">
            {submission.student_name.charAt(0).toUpperCase()}
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="font-semibold text-sm md:text-base truncate">
                  {submission.student_name}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 truncate">
                  {submission.assignment_title}
                </p>
              </div>

              {/* Status badge */}
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0',
                  statusInfo.bgClass,
                  statusInfo.textClass,
                )}
              >
                <statusInfo.Icon className="h-3 w-3" />
                {statusInfo.label}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-muted-foreground)] flex-wrap">
              <span>{submission.word_count} so'z</span>
              {submission.submitted_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(submission.submitted_at)}
                </span>
              )}
              {submission.score !== null && (
                <span className="font-bold text-[var(--color-foreground)]">
                  Ball: {Number(submission.score).toFixed(1)}
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0 group-hover:text-[var(--color-primary)] self-center" />
        </CardContent>
      </Card>
    </Link>
  );
}

function getStatusInfo(status: SubmissionStatus) {
  if (status === 'submitted')
    return {
      label: 'Yangi',
      Icon: Hourglass,
      bgClass: 'bg-blue-500/15',
      textClass: 'text-blue-600 dark:text-blue-400',
    };
  if (status === 'in_review')
    return {
      label: 'Tekshirilmoqda',
      Icon: ArrowUpDown,
      bgClass: 'bg-amber-500/15',
      textClass: 'text-amber-600 dark:text-amber-400',
    };
  if (status === 'graded')
    return {
      label: 'Baholangan',
      Icon: CheckCircle2,
      bgClass: 'bg-green-500/15',
      textClass: 'text-green-600 dark:text-green-400',
    };
  return {
    label: 'Qaytarilgan',
    Icon: ClipboardCheck,
    bgClass: 'bg-orange-500/15',
    textClass: 'text-orange-600 dark:text-orange-400',
  };
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'hozir';
  if (diffMinutes < 60) return `${diffMinutes} daq oldin`;
  if (diffHours < 24) return `${diffHours} soat oldin`;
  if (diffDays < 7) return `${diffDays} kun oldin`;
  return date.toLocaleDateString('uz-UZ');
}

function EmptyState({ filter }: { filter: FilterValue }) {
  const messages: Record<FilterValue, string> = {
    all: "Hali hech qanday vazifa topshirilmagan.",
    submitted: "Yangi vazifalar yo'q. Hammasini ko'rib chiqdingiz!",
    in_review: "Hozircha tekshirayotgan vazifangiz yo'q.",
    graded: "Hali hech qaysi vazifani baholamagansiz.",
    returned: "Qaytarilgan vazifalar yo'q.",
  };

  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 px-6 text-center">
      <div className="text-5xl mb-3">📭</div>
      <h3 className="font-semibold text-lg mb-1">Bo'sh</h3>
      <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
        {messages[filter]}
      </p>
    </div>
  );
}