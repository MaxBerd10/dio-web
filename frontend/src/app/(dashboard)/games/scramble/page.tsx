'use client';

import { useState, useEffect, useRef } from 'react';
import { Shuffle, Lightbulb, Delete } from 'lucide-react';

import { useStartScramble, useSubmitScrambleResult } from '@/lib/hooks/use-game';
import { GameIdleScreen, GameResultScreen, GamePlayingShell } from '@/components/games/game-shell';
import { Card, CardContent } from '@/components/ui/card';
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
  const pendingCheckRef = useRef<{ filled: { char: string; key: number }[]; timeSpent: number } | null>(null);
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

  const pickLetter = (item: { char: string; key: number }, now: number) => {
    setAvailable((prev) => prev.filter((l) => l.key !== item.key));
    const next = [...answer, item];
    if (wordData && next.length === wordData.scrambled.length) {
      pendingCheckRef.current = { filled: next, timeSpent: Math.round((now - startTime) / 1000) };
    }
    setAnswer(next);
  };

  useEffect(() => {
    const pending = pendingCheckRef.current;
    if (!pending || !wordData || checking) return;
    pendingCheckRef.current = null;
    setChecking(true);
    const { filled, timeSpent } = pending;
    const formed = filled.map((a) => a.char).join('');

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
  }, [answer, wordData, checking, hintsUsed, startTime, submitMutation]);

  const removeLetter = (item: { char: string; key: number }) => {
    setAnswer((prev) => prev.filter((l) => l.key !== item.key));
    setAvailable((prev) => [...prev, item]);
  };

  if (phase === 'idle') {
    return (
      <GameIdleScreen
        emoji="🔀"
        title="So'z tartibini tiklash"
        description="Aralashtirilgan harflardan to'g'ri so'zni yig'ing."
        onStart={handleStart}
        loading={startMutation.isPending}
        startIcon={<Shuffle className="h-4 w-4" />}
      />
    );
  }

  if (phase === 'result') {
    return (
      <GameResultScreen
        emoji="🎉"
        title="Top'dingiz!"
        xpEarned={xpEarned}
        onPlayAgain={handleStart}
        loading={startMutation.isPending}
      />
    );
  }

  if (!wordData) return null;

  return (
    <GamePlayingShell>
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-sm font-semibold">
          {wordData.scrambled.length} harf
        </span>
        {!showHint ? (
          <button
            type="button"
            onClick={() => { setShowHint(true); setHintsUsed((h) => h + 1); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/12 px-3 py-1.5 text-xs font-semibold text-amber-600"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Yordam (-5 XP)
          </button>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
            <Lightbulb className="h-3.5 w-3.5" />
            {wordData.translation_uz}
          </span>
        )}
      </div>

      <Card className={cn('mb-4 transition-colors', wrongFeedback && 'border-[var(--color-danger)]')}>
        <CardContent className="flex min-h-[80px] flex-wrap justify-center gap-2 p-6">
          {answer.length === 0 && (
            <span className="self-center text-sm text-[var(--color-muted-foreground)]">
              Harflarni bosib so&apos;z yasang
            </span>
          )}
          {answer.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => removeLetter(item)}
              disabled={checking}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl border-2 text-lg font-bold uppercase transition-all active:scale-95',
                wrongFeedback
                  ? 'border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                  : 'border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
              )}
            >
              {item.char}
            </button>
          ))}
        </CardContent>
      </Card>

      {wrongFeedback && (
        <p className="mb-4 text-center text-sm font-medium text-[var(--color-danger)]">
          Noto&apos;g&apos;ri, qaytadan urinib ko&apos;ring
        </p>
      )}

      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {available.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => pickLetter(item, Date.now())}
            disabled={checking}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-muted)] text-lg font-bold uppercase transition-all hover:bg-[var(--color-primary-soft)] active:scale-95 disabled:opacity-50"
          >
            {item.char}
          </button>
        ))}
      </div>

      {answer.length > 0 && !checking && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => { setAvailable((prev) => [...prev, ...answer]); setAnswer([]); }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-danger)]"
          >
            <Delete className="h-3.5 w-3.5" />
            Tozalash
          </button>
        </div>
      )}
    </GamePlayingShell>
  );
}
