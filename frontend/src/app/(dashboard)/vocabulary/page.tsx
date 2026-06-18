'use client';

import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Brain,
  CheckCircle2,
  Hourglass,
  Star,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useVocabularyStats, useReviewQueue } from '@/lib/hooks/use-vocabulary';
import { cn } from '@/lib/utils';

export default function VocabularyPage() {
  const { data: stats, isLoading: statsLoading } = useVocabularyStats();
  const { data: queue, isLoading: queueLoading } = useReviewQueue(50);

  const hasReview = (queue?.due_count ?? 0) + (queue?.new_count ?? 0) > 0;
  const totalToReview = (queue?.due_count ?? 0) + (queue?.new_count ?? 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-[var(--color-primary)]" />
          Lug'at
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          So'zlaringizni spaced repetition (SRS) bilan o'rganing va saqlang.
        </p>
      </div>

      {/* Big CTA — agar takrorlash bor */}
      {!queueLoading && hasReview && (
        <Card className="mb-6 border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-primary)]/5 to-transparent overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-14 w-14 rounded-2xl bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
                  <Sparkles className="h-7 w-7 text-[var(--color-primary)]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight">
                    {totalToReview} ta so'z tayyor
                  </h2>
                  <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
                    {queue?.due_count ? `${queue.due_count} ta takrorlash` : ''}
                    {queue?.due_count && queue?.new_count ? ' · ' : ''}
                    {queue?.new_count ? `${queue.new_count} ta yangi` : ''}
                  </p>
                </div>
              </div>
              <Link href="/vocabulary/review" className="shrink-0">
                <Button>
                  Boshlash
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div>
        <h2 className="text-base font-semibold mb-3">Sizning lug'atingiz</h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Jami so'zlar"
              value={stats?.total ?? 0}
              Icon={BookOpen}
              color="#3b82f6"
            />
            <StatCard
              label="Yangi"
              value={stats?.new ?? 0}
              Icon={Sparkles}
              color="#8b5cf6"
              sublabel="Hali ko'rilmagan"
            />
            <StatCard
              label="O'rganilmoqda"
              value={stats?.learning ?? 0}
              Icon={Brain}
              color="#f59e0b"
              sublabel="1-2 marta ko'rilgan"
            />
            <StatCard
              label="O'zlashtirilgan"
              value={stats?.mastered ?? 0}
              Icon={CheckCircle2}
              color="#10b981"
              sublabel="Mustahkam yodlangan"
            />
          </div>
        )}
      </div>

      {/* Due now mini badge */}
      {!statsLoading && (stats?.due_now ?? 0) > 0 && !hasReview && (
        <Card className="mt-4">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-amber-500" />
              <span className="text-sm">
                <strong>{stats!.due_now}</strong> ta so'z takrorlashga tayyor
              </span>
            </div>
            <Link href="/vocabulary/review">
              <Button size="sm" variant="outline">
                Takrorlash
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Words list — recent learned */}
      {!queueLoading && queue?.items.length === 0 && !hasReview && (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="font-semibold text-lg mb-1">
            Lug'atingiz hozircha bo'sh
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto mb-4">
            Darslarni boshlang — har dars sizga yangi so'zlar qo'shadi.
          </p>
          <Link href="/tracks">
            <Button variant="outline">Darslarni ochish</Button>
          </Link>
        </div>
      )}

      {/* How SRS works info */}
      <div className="mt-8">
        <h2 className="text-base font-semibold mb-3">SRS qanday ishlaydi?</h2>
        <Card>
          <CardContent className="p-5 text-sm leading-relaxed space-y-2">
            <p>
              <strong>Spaced Repetition System (SRS)</strong> — bu so'zlarni
              uzoq vaqt esda saqlash uchun ilmiy isbotlangan usul.
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              Yangi so'zni ko'rganingizda, biz uni 1 kun, keyin 6 kun, keyin
              esa 2 hafta keyin yana ko'rsatamiz. Har safar uni eslab qolsangiz,
              keyingi takrorlash oralig'i uzayadi. Bu sizning miyangiz uchun
              eng samarali yo'l.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
  color,
  sublabel,
}: {
  label: string;
  value: number;
  Icon: React.ElementType;
  color: string;
  sublabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
        <p className="text-2xl font-bold" style={{ color }}>
          {value}
        </p>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
          {label}
        </p>
        {sublabel && (
          <p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5 opacity-70">
            {sublabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}