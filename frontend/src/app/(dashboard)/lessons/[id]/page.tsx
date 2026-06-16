'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Clock,
  Sparkles,
  BookOpen,
  Brain,
  CircleCheck,
  ClipboardCheck,
} from 'lucide-react';

import { useLesson } from '@/lib/hooks/use-courses';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lessonId = parseInt(id, 10);

  const { data: lesson, isLoading, error } = useLesson(lessonId);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/tracks"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Orqaga
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-danger)]">
            Dars yuklashda xato yuz berdi.
          </p>
        </div>
      ) : lesson ? (
        <>
          {/* Path */}
          <p className="text-xs text-[var(--color-muted-foreground)] mb-2">
            {lesson.course_title} → {lesson.module_title}
          </p>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            {lesson.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)] mb-6 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lesson.estimated_minutes} daqiqa</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              <span>+{lesson.xp_reward} XP</span>
            </div>
            {lesson.cefr_level && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
                {lesson.cefr_level}
              </span>
            )}
          </div>

          {/* Description */}
          {lesson.description && (
            <Card className="mb-6">
              <CardContent className="p-5">
                <p className="text-sm md:text-base text-[var(--color-foreground)] leading-relaxed">
                  {lesson.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Content blocks overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <ContentBlock
              icon={BookOpen}
              label="So'zlar"
              count={lesson.word_count}
              color="#3b82f6"
            />
            <ContentBlock
              icon={Brain}
              label="Grammar"
              count={lesson.grammar_topic_count}
              color="#8b5cf6"
            />
            <ContentBlock
              icon={CircleCheck}
              label="Testlar"
              count={lesson.quiz_count}
              color="#10b981"
            />
            <ContentBlock
              icon={ClipboardCheck}
              label="Vazifalar"
              count={lesson.assignment_count}
              color="#f59e0b"
            />
          </div>

          {/* Placeholder bo'lim — keyin to'liq qilamiz */}
          <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
            <p className="text-lg font-semibold mb-1">🚧 Dars yuklanmoqda</p>
            <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
              Dars ichi (so'zlar, grammar, testlar, vazifalar) keyingi qadamda
              to'liq qilinadi.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

function ContentBlock({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 md:p-4 text-center">
        <div
          className="h-9 w-9 mx-auto rounded-lg flex items-center justify-center mb-2"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <p className="text-xl font-bold">{count}</p>
        <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
      </CardContent>
    </Card>
  );
}