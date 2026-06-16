'use client';

import Link from 'next/link';
import { BookOpen, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Course } from '@/lib/api/content';

const CEFR_COLORS: Record<string, string> = {
  A1: 'var(--color-cefr-a1)',
  A2: 'var(--color-cefr-a2)',
  B1: 'var(--color-cefr-b1)',
  B2: 'var(--color-cefr-b2)',
  C1: 'var(--color-cefr-c1)',
  C2: 'var(--color-cefr-c2)',
};

const IELTS_ICONS: Record<string, string> = {
  listening: '🎧',
  reading: '📖',
  writing: '✍️',
  speaking: '🗣️',
};

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  // Course tipiga qarab badge yasaymiz
  let badge: { label: string; color: string } | null = null;
  let displayIcon = course.icon;

  if (course.track === 'cefr' && course.cefr_level) {
    badge = {
      label: course.cefr_level,
      color: CEFR_COLORS[course.cefr_level] || 'var(--color-primary)',
    };
  } else if (course.track === 'ielts' && course.ielts_skill) {
    badge = {
      label: course.ielts_skill.toUpperCase(),
      color: 'var(--color-accent)',
    };
    if (!displayIcon) {
      displayIcon = IELTS_ICONS[course.ielts_skill] || '🎯';
    }
  }

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <Card className="h-full transition-all hover:border-[var(--color-primary)] hover:shadow-md group-active:scale-[0.99]">
        <CardContent className="p-5 flex flex-col h-full min-h-[160px]">
          {/* Header — icon va badge */}
          <div className="flex items-start justify-between mb-3">
            {displayIcon && (
              <div className="text-2xl">{displayIcon}</div>
            )}
            {badge && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: badge.color }}
              >
                {badge.label}
              </span>
            )}
          </div>

          {/* Title + description */}
          <h3 className="font-semibold text-base md:text-lg leading-tight mb-1.5">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-xs md:text-sm text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed flex-1">
              {course.description}
            </p>
          )}

          {/* Footer stats */}
          <div className="mt-4 flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
            <div className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              <span>{course.module_count} bo'lim</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{course.lesson_count} dars</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}