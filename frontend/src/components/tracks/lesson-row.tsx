'use client';

import Link from 'next/link';
import {
  BookOpen,
  Brain,
  Headphones,
  Mic,
  PenLine,
  BookText,
  Layers,
  Sparkles,
  Clock,
  ChevronRight,
  Lock,
  LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LessonSummary } from '@/lib/api/content';

const LESSON_TYPE_ICONS: Record<string, LucideIcon> = {
  vocabulary: BookOpen,
  grammar: Brain,
  listening: Headphones,
  speaking: Mic,
  writing: PenLine,
  reading: BookText,
  mixed: Layers,
};

const LESSON_TYPE_LABELS: Record<string, string> = {
  vocabulary: "So'z",
  grammar: 'Grammar',
  listening: 'Tinglash',
  speaking: 'Gapirish',
  writing: 'Yozish',
  reading: "O'qish",
  mixed: 'Aralash',
};

interface LessonRowProps {
  lesson: LessonSummary;
  index: number;
}

export function LessonRow({ lesson, index }: LessonRowProps) {
  const Icon = LESSON_TYPE_ICONS[lesson.lesson_type] || Layers;
  const label = LESSON_TYPE_LABELS[lesson.lesson_type] || 'Dars';

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className={cn('block group', lesson.is_premium && 'opacity-60')}
    >
      <Card className="transition-all hover:border-[var(--color-primary)] hover:shadow-sm group-active:scale-[0.99]">
        <CardContent className="p-4 flex items-center gap-4">
          {/* Number */}
          <div className="text-sm font-bold text-[var(--color-muted-foreground)] w-6 shrink-0">
            {index + 1}.
          </div>

          {/* Icon */}
          <div className="h-10 w-10 shrink-0 rounded-lg bg-[var(--color-muted)] flex items-center justify-center">
            <Icon className="h-4 w-4 text-[var(--color-foreground)]" />
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm md:text-base truncate">
                {lesson.title}
              </h3>
              {lesson.is_premium && (
                <Lock className="h-3.5 w-3.5 text-[var(--color-muted-foreground)] shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-muted-foreground)]">
              <span className="px-1.5 py-0.5 rounded bg-[var(--color-muted)] font-medium">
                {label}
              </span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{lesson.estimated_minutes} daq</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[var(--color-accent)]" />
                <span>+{lesson.xp_reward} XP</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0 group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
}