'use client';

import Link from 'next/link';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/lib/hooks/use-dashboard';

export default function VocabularyPage() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-[var(--color-primary)]" />
          Lug'at
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          So'zlaringizni spaced repetition (SRS) bilan o'rganing va saqlang.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Jami so'zlar"
          value={isLoading ? '—' : data?.words_total ?? 0}
        />
        <StatCard
          label="O'zlashtirilgan"
          value={isLoading ? '—' : data?.words_mastered ?? 0}
          color="#10b981"
        />
        <StatCard
          label="Takrorlash"
          value={isLoading ? '—' : data?.words_due_now ?? 0}
          color="#f59e0b"
        />
        <StatCard label="Yangi" value={isLoading ? '—' : '—'} color="#3b82f6" />
      </div>

      {/* CTA: SRS review */}
      {!isLoading && (data?.words_due_now ?? 0) > 0 && (
        <Card className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 border-[var(--color-primary)]/20 mb-6">
          <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {data?.words_due_now} ta so'z takrorlashga tayyor
                </h3>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Spaced repetition algoritmi tanladi
                </p>
              </div>
            </div>
            <Link href="/vocabulary/review">
              <Button>
                Boshlash <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Coming soon */}
      <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
        <div className="text-4xl mb-3">📚</div>
        <h3 className="font-semibold text-lg mb-1">
          Lug'at flashcard mode tez orada
        </h3>
        <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
          Bu yerda barcha so'zlaringiz, kategoriyalar va flashcard amaliyoti
          bo'ladi. Hozircha har dars ichidagi so'zlarni ko'rishingiz mumkin.
        </p>
        <Link href="/tracks" className="inline-block mt-4">
          <Button variant="outline">Darslarni ochish</Button>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-bold" style={color ? { color } : undefined}>
          {value}
        </p>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}