'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Module } from '@/lib/api/content';

interface ModuleCardProps {
  module: Module;
  index: number;
}

export function ModuleCard({ module, index }: ModuleCardProps) {
  return (
    <Link href={`/modules/${module.id}`} className="block group">
      <Card className="transition-all hover:border-[var(--color-primary)] hover:shadow-md group-active:scale-[0.99]">
        <CardContent className="p-5 flex items-center gap-4">
          {/* Number badge */}
          <div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-lg">
            {index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-0.5 truncate">
              {module.title}
            </h3>
            {module.description && (
              <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
                {module.description}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1.5 text-xs text-[var(--color-muted-foreground)]">
              <BookOpen className="h-3.5 w-3.5" />
              <span>
                {module.lesson_count}{' '}
                {module.lesson_count === 1 ? 'dars' : 'dars'}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-[var(--color-muted-foreground)] shrink-0 group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
}