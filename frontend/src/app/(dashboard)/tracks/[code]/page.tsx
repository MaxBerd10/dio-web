'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { useCourses } from '@/lib/hooks/use-courses';
import { useTracks } from '@/lib/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseCard } from '@/components/tracks/course-card';
import type { TrackCode } from '@/lib/api/content';

const VALID_TRACKS: TrackCode[] = ['general', 'cefr', 'ielts'];

export default function TrackDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  // Validatsiya
  if (!VALID_TRACKS.includes(code as TrackCode)) {
    notFound();
  }

  const trackCode = code as TrackCode;

  const { data: tracks } = useTracks();
  const { data: coursesData, isLoading } = useCourses({ track: trackCode });

  const track = tracks?.find((t) => t.code === trackCode);
  const courses = coursesData?.results ?? [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/tracks"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Barcha yo'nalishlar
      </Link>

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          {track?.icon && <div className="text-4xl">{track.icon}</div>}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {track?.name || 'Yuklanmoqda...'}
          </h1>
        </div>
        {track?.description && (
          <p className="text-[var(--color-muted-foreground)] mt-2 text-sm md:text-base">
            {track.description}
          </p>
        )}
      </div>

      {/* Kurslar gridi */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[180px] rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState track={trackCode} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ track }: { track: TrackCode }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 px-6 text-center">
      <div className="text-5xl mb-3">📚</div>
      <h3 className="font-semibold text-lg mb-1">
        Bu yo'nalishda hozircha kurs yo'q
      </h3>
      <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
        {track === 'general' && "General English kurslari tez orada qo'shiladi."}
        {track === 'cefr' && "CEFR darajalar bo'yicha kurslar tez orada qo'shiladi."}
        {track === 'ielts' && "IELTS tayyorgarlik kurslari tez orada qo'shiladi."}
      </p>
    </div>
  );
}