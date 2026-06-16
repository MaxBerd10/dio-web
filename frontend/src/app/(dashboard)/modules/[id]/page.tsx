'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { useModule } from '@/lib/hooks/use-courses';
import { Skeleton } from '@/components/ui/skeleton';
import { LessonRow } from '@/components/tracks/lesson-row';

export default function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const moduleId = parseInt(id, 10);

  const { data: module, isLoading, error } = useModule(moduleId);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Breadcrumb — module'dan tepa course'ga */}
      <Link
        href="/tracks"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Orqaga
      </Link>

      {/* Header */}
      {isLoading ? (
        <div className="space-y-3 mb-8">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-danger)]">
            Bo'lim yuklashda xato yuz berdi.
          </p>
        </div>
      ) : module ? (
        <>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {module.title}
            </h1>
            {module.description && (
              <p className="text-[var(--color-muted-foreground)] mt-2 text-sm md:text-base leading-relaxed">
                {module.description}
              </p>
            )}
          </div>

          {/* Lessons */}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              Darslar ({module.lessons.length})
            </h2>
            {module.lessons.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Hozircha darslar qo'shilmagan.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {module.lessons.map((lesson, idx) => (
                  <LessonRow key={lesson.id} lesson={lesson} index={idx} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}