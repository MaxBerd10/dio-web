'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  X,
  Sparkles,
  Trophy,
} from 'lucide-react';

import { useReviewQueue } from '@/lib/hooks/use-vocabulary';
import { vocabularySRSApi } from '@/lib/api/vocabulary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Flashcard } from '@/components/vocabulary/flashcard';
import { QualityButtons } from '@/components/vocabulary/quality-buttons';

interface SessionResult {
  total: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  xp: number;
}

export default function VocabularyReviewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: queue, isLoading } = useReviewQueue(20);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<SessionResult>({
    total: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    xp: 0,
  });
  const [finished, setFinished] = useState(false);

  const items = queue?.items ?? [];
  const currentItem = items[currentIdx];
  const isLast = currentIdx === items.length - 1;

  const submitMutation = useMutation({
    mutationFn: vocabularySRSApi.submitReview,
    onSuccess: (data) => {
      // XP'ni qo'shamiz
      if (data.xp_earned) {
        setResult((r) => ({ ...r, xp: r.xp + data.xp_earned! }));
      }
    },
  });

  const handleReveal = useCallback(() => {
    if (!revealed) setRevealed(true);
  }, [revealed]);

  const handleQuality = useCallback(
    async (quality: 0 | 2 | 4 | 5) => {
      if (!currentItem || submitMutation.isPending) return;

      // Hisobni yangilash
      setResult((r) => ({
        ...r,
        total: r.total + 1,
        again: quality === 0 ? r.again + 1 : r.again,
        hard: quality === 2 ? r.hard + 1 : r.hard,
        good: quality === 4 ? r.good + 1 : r.good,
        easy: quality === 5 ? r.easy + 1 : r.easy,
      }));

      // Backend'ga jo'natamiz
      await submitMutation.mutateAsync({
        word_id: currentItem.word.id,
        quality,
      });

      // Keyingi so'zga o'tish
      if (isLast) {
        setFinished(true);
        queryClient.invalidateQueries({ queryKey: ['vocabulary-stats'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      } else {
        setCurrentIdx((i) => i + 1);
        setRevealed(false);
      }
    },
    [currentItem, isLast, submitMutation, queryClient],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (finished) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) handleReveal();
        return;
      }
      if (!revealed) return;
      if (e.key === '1') handleQuality(0);
      else if (e.key === '2') handleQuality(2);
      else if (e.key === '3') handleQuality(4);
      else if (e.key === '4') handleQuality(5);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [revealed, finished, handleReveal, handleQuality]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Bo'sh queue
  if (!items.length) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Orqaga
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold mb-2">Hammasini ko&apos;rib chiqdingiz!</h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-5 max-w-sm mx-auto">
              Hozircha takrorlash uchun so&apos;zlar yo&apos;q. Darslarni davom
              ettiring — yangi so&apos;zlar avtomatik qo&apos;shiladi.
            </p>
            <Link href="/tracks">
              <Button>Darslarni ochish</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tugagan
  if (finished) {
    return (
      <SessionComplete
        result={result}
        onClose={() => router.push('/vocabulary')}
      />
    );
  }

  const progress = ((currentIdx + (revealed ? 0.5 : 0)) / items.length) * 100;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.push('/vocabulary')}
          className="h-9 w-9 rounded-lg hover:bg-[var(--color-muted)] flex items-center justify-center"
          aria-label="Yopish"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--color-muted-foreground)]">
              {currentIdx + 1} / {items.length}
            </span>
            {result.xp > 0 && (
              <span className="flex items-center gap-1 text-[var(--color-accent)] font-medium">
                <Sparkles className="h-3 w-3" />+{result.xp} XP
              </span>
            )}
          </div>
          <Progress value={progress} size="sm" />
        </div>
      </div>

      {/* Flashcard */}
      <Flashcard
        item={currentItem}
        revealed={revealed}
        onReveal={handleReveal}
      />

      {/* Action area */}
      <div className="mt-5">
        {revealed ? (
          <QualityButtons
            onSelect={handleQuality}
            disabled={submitMutation.isPending}
          />
        ) : (
          <p className="text-xs text-[var(--color-muted-foreground)] text-center">
            Avval o&apos;zingizni sinab ko&apos;ring, keyin tarjimani oching
          </p>
        )}
      </div>

      {/* Helper */}
      <div className="mt-6 text-center">
        <p className="text-[10px] text-[var(--color-muted-foreground)]">
          Klavishlar: <kbd className="px-1 py-0.5 rounded bg-[var(--color-muted)]">Space</kbd> — ko&apos;rsatish ·{' '}
          <kbd className="px-1 py-0.5 rounded bg-[var(--color-muted)]">1-4</kbd> — javob
        </p>
      </div>
    </div>
  );
}

function SessionComplete({
  result,
  onClose,
}: {
  result: SessionResult;
  onClose: () => void;
}) {
  const accuracy =
    result.total > 0
      ? Math.round(((result.good + result.easy) / result.total) * 100)
      : 0;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/0">
        <CardContent className="p-6 md:p-10 text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Sessiya tugadi!
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
            {result.total} ta so&apos;zni takrorladingiz
          </p>

          {/* Accuracy */}
          <div className="mb-6">
            <div className="text-5xl md:text-6xl font-bold tracking-tight text-green-500">
              {accuracy}%
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              Aniqlik
            </p>
          </div>

          {/* XP */}
          {result.xp > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-bold mb-6">
              <Trophy className="h-4 w-4" />+{result.xp} XP olindi
            </div>
          )}

          {/* Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 max-w-md mx-auto">
            <Stat label="Yana" value={result.again} color="#ef4444" />
            <Stat label="Qiyin" value={result.hard} color="#f59e0b" />
            <Stat label="Yaxshi" value={result.good} color="#3b82f6" />
            <Stat label="Oson" value={result.easy} color="#10b981" />
          </div>

          <Button fullWidth onClick={onClose}>
            Tugatish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--color-surface-elevated)] py-2">
      <p className="text-xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] text-[var(--color-muted-foreground)]">{label}</p>
    </div>
  );
}