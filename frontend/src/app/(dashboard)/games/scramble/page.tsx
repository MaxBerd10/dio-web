'use client';

import { useState } from 'react';
import { Shuffle, Lightbulb, Sparkles, RotateCcw, Delete } from 'lucide-react';

import { useStartScramble, useSubmitScrambleResult } from '@/lib/hooks/use-game';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Phase = 'idle' | 'playing' | 'result';

export default function ScramblePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [wordData, setWordData] = useState<{ id: number; scrambled: string[]; translation_uz: string } | null>(null);
  const [available, setAvailable] = useState<{ char: string; key: number }[]>([]);
  const [answer, setAnswer] = useState<{ char: string; key: number }[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [checking, setChecking] = useState(false);
  const [wrongFeedback, setWrongFeedback] = useState(false);

  const startMutation = useStartScramble();
  const submitMutation = useSubmitScrambleResult();

  const handleStart = () => {
    setShowHint(false);
    setHintsUsed(0);
    setWrongFeedback(false);
    startMutation.mutate(undefined, {
      onSuccess: (data) => {
        setWordData(data);
        setAvailable(data.scrambled.map((char, idx) => ({ char, key: idx })));
        setAnswer([]);
        setStartTime(Date.now());
        setPhase('playing');
      },
    });
  };

  const pickLetter = (item: { char: string; key: number }) => {
    setAvailable((prev) => prev.filter((l) => l.key !== item.key));
    setAnswer((prev) => {
      const next = [...prev, item];
      if (wordData && next.length === wordData.scrambled.length) {
        checkAnswer(next);
      }
      return next;
    });
  };

  const removeLetter = (item: { char: string; key: number }) => {
    setAnswer((prev) => prev.filter((l) => l.key !== item.key));
    setAvailable((prev) => [...prev, item]);
  };

  const checkAnswer = (filled: { char: string; key: number }[]) => {
    if (!wordData) return;
    setChecking(true);
    const formed = filled.map((a) => a.char).join('');
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    submitMutation.mutate(
      { word_id: wordData.id, answer: formed, hints_used: hintsUsed, time_spent_seconds: timeSpent },
      {
        onSuccess: (data) => {
          setChecking(false);
          if (data.won) {
            setXpEarned(data.xp_earned);
            setPhase('result');
          } else {
            setWrongFeedback(true);
            setTimeout(() => {
              setWrongFeedback(false);
              setAvailable(filled);
              setAnswer([]);
            }, 900);
          }
        },
        onError: () => setChecking(false),
      },
    );
  };

  const useHint = () => {
    setShowHint(true);
    setHintsUsed((h) => h + 1);
  };

  // === Idle ===
  if (phase === 'idle') {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto text-center">
        <div className="text-6xl mb-4">🔀</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          So'z tartibini tiklash
        </h1>
        <p className="text-[var(--color-muted-foreground)] mb-6">
          Aralashtirilgan harflardan to'g'ri so'zni yig'ing.
        </p>
        <Button onClick={handleStart} loading={startMutation.isPending}>
          <Shuffle className="h-4 w-4" />
          {startMutation.isPending ? 'Yuklanmoqda...' : 'Boshlash'}
        </Button>
      </div>
    );
  }

  // === Result ===
  if (phase === 'result') {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Top'dingiz!
        </h1>
        {xpEarned > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-bold">+{xpEarned} XP</span>
          </div>
        )}
        <div>
          <Button onClick={handleStart} loading={startMutation.isPending}>
            <RotateCcw className="h-4 w-4" />
            Yana o'ynash
          </Button>
        </div>
      </div>
    );
  }

  // === Playing ===
  if (!wordData) return null;

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-[var(--color-muted-foreground)]">
          {wordData.length} harf
        </span>
        {!showHint ? (
          <button
            type="button"
            onClick={useHint}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Yordam (-5 XP)
          </button>
        ) : (
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5" />
            {wordData.translation_uz}
          </span>
        )}
      </div>

      {/* Javob qatori */}
      <Card className={cn('mb-6 transition-colors', wrongFeedback && 'border-[var(--color-danger)]')}>
        <CardContent className="p-6 flex flex-wrap justify-center gap-2 min-h-[72px]">
          {answer.length === 0 && (
            <span className="text-sm text-[var(--color-muted-foreground)] self-center">
              Harflarni bosib so'z yasang
            </span>
          )}
          {answer.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => removeLetter(item)}
              disabled={checking}
              className={cn(
                'h-11 w-11 rounded-lg border-2 text-lg font-bold uppercase transition-colors',
                wrongFeedback
                  ? 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]/40 text-[var(--color-danger)]'
                  : 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20',
              )}
            >
              {item.char}
            </button>
          ))}
        </CardContent>
      </Card>

      {wrongFeedback && (
        <p className="text-center text-sm text-[var(--color-danger)] mb-4">
          Noto'g'ri, qaytadan urinib ko'ring
        </p>
      )}

      {/* Mavjud harflar */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {available.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => pickLetter(item)}
            disabled={checking}
            className="h-11 w-11 rounded-lg bg-[var(--color-muted)] text-lg font-bold uppercase hover:bg-[var(--color-muted)]/70 transition-colors disabled:opacity-50"
          >
            {item.char}
          </button>
        ))}
      </div>

      {answer.length > 0 && !checking && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setAvailable((prev) => [...prev, ...answer]);
              setAnswer([]);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-danger)]"
          >
            <Delete className="h-3.5 w-3.5" />
            Tozalash
          </button>
        </div>
      )}
    </div>
  );
}