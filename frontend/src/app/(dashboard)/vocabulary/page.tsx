'use client';

import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Brain,
  CheckCircle2,
  Hourglass,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
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
    <div className="mx-auto max-w-5xl p-4 lg:p-8 animate-fadeIn">
      <PageHeader
        icon={<BookOpen className="h-6 w-6" />}
        title="Lug'at"
        description="So'zlaringizni spaced repetition (SRS) bilan o'rganing va saqlang."
      />

      {!queueLoading && hasReview && (
        <Card className="mb-6 overflow-hidden border-[var(--color-primary)]/25 bg-gradient-to-br from-[var(--color-primary)]/12 via-[var(--color-primary)]/5 to-transparent">
          <CardContent className="p-5 lg:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl btn-gradient shadow-lg">
                  <Sparkles className="h-7 w-7" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold tracking-tight lg:text-xl">
                    {totalToReview} ta so&apos;z tayyor
                  </h2>
                  <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
                    {queue?.due_count ? `${queue.due_count} ta takrorlash` : ''}
                    {queue?.due_count && queue?.new_count ? ' · ' : ''}
                    {queue?.new_count ? `${queue.new_count} ta yangi` : ''}
                  </p>
                </div>
              </div>
              <Link href="/vocabulary/review" className="shrink-0">
                <Button size="lg">
                  Boshlash
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="section-label mb-3">Sizning lug&apos;atingiz</h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Jami so'zlar" value={stats?.total ?? 0} Icon={BookOpen} accent="blue" />
            <StatCard label="Yangi" value={stats?.new ?? 0} Icon={Sparkles} accent="purple" sublabel="Hali ko'rilmagan" />
            <StatCard label="O'rganilmoqda" value={stats?.learning ?? 0} Icon={Brain} accent="amber" sublabel="1-2 marta ko'rilgan" />
            <StatCard label="O'zlashtirilgan" value={stats?.mastered ?? 0} Icon={CheckCircle2} accent="success" sublabel="Mustahkam yodlangan" />
          </div>
        )}
      </div>

      {!statsLoading && (stats?.due_now ?? 0) > 0 && !hasReview && (
        <Card className="mt-4">
          <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div className="flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-amber-500" />
              <span className="text-sm">
                <strong>{stats!.due_now}</strong> ta so&apos;z takrorlashga tayyor
              </span>
            </div>
            <Link href="/vocabulary/review">
              <Button size="sm" variant="outline">Takrorlash</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!queueLoading && queue?.items.length === 0 && !hasReview && (
        <Card className="mt-6 border-dashed">
          <CardContent className="py-12 px-6 text-center">
            <div className="mb-3 text-4xl">📚</div>
            <h3 className="mb-1 text-lg font-bold">Lug&apos;atingiz hozircha bo&apos;sh</h3>
            <p className="mx-auto mb-4 max-w-md text-sm text-[var(--color-muted-foreground)]">
              Darslarni boshlang — har dars sizga yangi so&apos;zlar qo&apos;shadi.
            </p>
            <Link href="/tracks">
              <Button variant="outline">Darslarni ochish</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="section-label mb-3">SRS qanday ishlaydi?</h2>
        <Card className="bg-[var(--color-muted)]/20">
          <CardContent className="space-y-2 p-5 text-sm leading-relaxed">
            <p>
              <strong>Spaced Repetition System (SRS)</strong> — bu so&apos;zlarni uzoq vaqt esda saqlash uchun ilmiy isbotlangan usul.
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              Yangi so&apos;zni ko&apos;rganingizda, biz uni 1 kun, keyin 6 kun, keyin esa 2 hafta keyin yana ko&apos;rsatamiz.
              Har safar uni eslab qolsangiz, keyingi takrorlash oralig&apos;i uzayadi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ACCENTS = {
  blue: { bg: 'bg-blue-500/12', text: 'text-blue-500', border: 'border-blue-500/20' },
  purple: { bg: 'bg-purple-500/12', text: 'text-purple-500', border: 'border-purple-500/20' },
  amber: { bg: 'bg-amber-500/12', text: 'text-amber-500', border: 'border-amber-500/20' },
  success: { bg: 'bg-[var(--color-success)]/12', text: 'text-[var(--color-success)]', border: 'border-[var(--color-success)]/20' },
};

function StatCard({
  label,
  value,
  Icon,
  accent,
  sublabel,
}: {
  label: string;
  value: number;
  Icon: React.ElementType;
  accent: keyof typeof ACCENTS;
  sublabel?: string;
}) {
  const styles = ACCENTS[accent];
  return (
    <Card className={cn('border', styles.border)}>
      <CardContent className="p-4">
        <div className={cn('mb-2 flex h-9 w-9 items-center justify-center rounded-xl', styles.bg, styles.text)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className={cn('text-2xl font-bold tabular-nums', styles.text)}>{value}</p>
        <p className="mt-0.5 text-xs font-medium text-[var(--color-muted-foreground)]">{label}</p>
        {sublabel && (
          <p className="mt-0.5 text-[10px] text-[var(--color-muted-foreground)] opacity-70">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
