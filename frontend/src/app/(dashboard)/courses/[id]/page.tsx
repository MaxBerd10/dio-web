'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { useCourse } from '@/lib/hooks/use-courses';
import { Skeleton } from '@/components/ui/skeleton';
import { ModuleCard } from '@/components/tracks/module-card';

const TRACK_LABELS: Record<string, string> = {
  general: 'General English',
  cefr: 'CEFR Levels',
  ielts: 'IELTS Preparation',
};

const CEFR_COLORS: Record<string, string> = {
  A1: 'var(--color-cefr-a1)',
  A2: 'var(--color-cefr-a2)',
  B1: 'var(--color-cefr-b1)',
  B2: 'var(--color-cefr-b2)',
  C1: 'var(--color-cefr-c1)',
  C2: 'var(--color-cefr-c2)',
};

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);

  const { data: course, isLoading, error } = useCourse(courseId);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      {course && (
        <Link
          href={`/tracks/${course.track}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          {TRACK_LABELS[course.track]}
        </Link>
      )}

      {/* Header */}
      {isLoading ? (
        <div className="space-y-3 mb-8">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-danger)]">
            Kurs yuklashda xato yuz berdi.
          </p>
        </div>
      ) : course ? (
        <>
          <div className="mb-8">
            <div className="flex items-start gap-4 flex-wrap">
              {course.icon && <div className="text-4xl">{course.icon}</div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {course.cefr_level && (
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                      style={{
                        backgroundColor:
                          CEFR_COLORS[course.cefr_level] ||
                          'var(--color-primary)',
                      }}
                    >
                      {course.cefr_level}
                    </span>
                  )}
                  {course.ielts_skill && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-[var(--color-accent)] capitalize">
                      {course.ielts_skill}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="text-[var(--color-muted-foreground)] mt-2 text-sm md:text-base leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Modules */}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              Bo'limlar ({course.modules.length})
            </h2>
            {course.modules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Hozircha bo'limlar qo'shilmagan.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {course.modules.map((module, idx) => (
                  <ModuleCard key={module.id} module={module} index={idx} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}