'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Skull } from 'lucide-react';

import { useStartHangman, useSubmitHangmanResult } from '@/lib/hooks/use-game';
import { GameIdleScreen, GameResultScreen, GamePlayingShell } from '@/components/games/game-shell';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MAX_WRONG = 6;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

type Phase = 'idle' | 'playing' | 'result';

function HangmanFigure({ wrongCount }: { wrongCount: number }) {
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-40 w-40">
      <line x1="20" y1="180" x2="120" y2="180" stroke="currentColor" strokeWidth="4" className="text-[var(--color-muted-foreground)]" />
      <line x1="50" y1="180" x2="50" y2="20" stroke="currentColor" strokeWidth="4" className="text-[var(--color-muted-foreground)]" />
      <line x1="50" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="4" className="text-[var(--color-muted-foreground)]" />
      <line x1="130" y1="20" x2="130" y2="40" stroke="currentColor" strokeWidth="4" className="text-[var(--color-muted-foreground)]" />
      {wrongCount >= 1 && <circle cx="130" cy="55" r="15" stroke="currentColor" strokeWidth="3" fill="none" className="text-[var(--color-danger)]" />}
      {wrongCount >= 2 && <line x1="130" y1="70" x2="130" y2="115" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />}
      {wrongCount >= 3 && <line x1="130" y1="85" x2="110" y2="100" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />}
      {wrongCount >= 4 && <line x1="130" y1="85" x2="150" y2="100" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />}
      {wrongCount >= 5 && <line x1="130" y1="115" x2="113" y2="145" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />}
      {wrongCount >= 6 && <line x1="130" y1="115" x2="147" y2="145" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />}
    </svg>
  );
}

export default function HangmanPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [wordData, setWordData] = useState<{ id: number; word: string; translation_uz: string } | null>(null);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [won, setWon] = useState(false);

  const startMutation = useStartHangman();
  const submitMutation = useSubmitHangmanResult();

  const handleStart = () => {
    setShowHint(false);
    startMutation.mutate(undefined, {
      onSuccess: (data) => {
        setWordData(data);
        setGuessed(new Set());
        setWrongCount(0);
        setStartTime(Date.now());
        setPhase('playing');
      },
    });
  };

  const finishGame = useCallback((didWin: boolean, finalWrong: number) => {
    if (!wordData) return;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    setWon(didWin);
    submitMutation.mutate(
      { word_id: wordData.id, won: didWin, wrong_guesses: finalWrong, time_spent_seconds: timeSpent },
      {
        onSuccess: (data) => {
          setXpEarned(data.xp_earned);
          setPhase('result');
        },
      },
    );
  }, [wordData, startTime, submitMutation]);

  const handleGuess = (letter: string) => {
    if (!wordData || guessed.has(letter) || phase !== 'playing') return;
    const next = new Set(guessed);
    next.add(letter);
    setGuessed(next);

    if (wordData.word.includes(letter)) {
      if (wordData.word.split('').every((ch) => next.has(ch))) finishGame(true, wrongCount);
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= MAX_WRONG) finishGame(false, newWrong);
    }
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      const letter = e.key.toLowerCase();
      if (ALPHABET.includes(letter)) handleGuess(letter);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, guessed, wrongCount, wordData]);

  if (phase === 'idle') {
    return (
      <GameIdleScreen
        emoji="💀"
        title="Osma o'yin"
        description="So'zni harflab toping. 6 tadan ortiq xato qilsangiz — yutqazasiz!"
        onStart={handleStart}
        loading={startMutation.isPending}
        startIcon={<Skull className="h-4 w-4" />}
      />
    );
  }

  if (phase === 'result') {
    return (
      <GameResultScreen
        emoji={won ? '🎉' : '💀'}
        title={won ? "Top'dingiz!" : 'Yutqazdingiz'}
        subtitle={
          <>
            So&apos;z: <span className="font-bold text-[var(--color-foreground)]">{wordData?.word}</span>
            <br />
            {wordData?.translation_uz}
          </>
        }
        xpEarned={xpEarned}
        onPlayAgain={handleStart}
        loading={startMutation.isPending}
      />
    );
  }

  if (!wordData) return null;

  return (
    <GamePlayingShell>
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-sm font-semibold">
              Xatolar: {wrongCount}/{MAX_WRONG}
            </span>
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/12 px-3 py-1.5 text-xs font-semibold text-amber-600"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Yordam
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                <Lightbulb className="h-3.5 w-3.5" />
                {wordData.translation_uz}
              </span>
            )}
          </div>

          <HangmanFigure wrongCount={wrongCount} />

          <div className="my-6 flex flex-wrap justify-center gap-2">
            {wordData.word.split('').map((ch, idx) => (
              <div
                key={idx}
                className="flex h-11 w-10 items-center justify-center rounded-lg border-b-2 border-[var(--color-primary)] text-lg font-bold uppercase"
              >
                {guessed.has(ch) ? ch : ''}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-9">
            {ALPHABET.map((letter) => {
              const isGuessed = guessed.has(letter);
              const isCorrect = isGuessed && wordData.word.includes(letter);
              const isWrong = isGuessed && !wordData.word.includes(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleGuess(letter)}
                  disabled={isGuessed}
                  className={cn(
                    'h-10 rounded-xl text-sm font-bold uppercase transition-all active:scale-95',
                    isCorrect && 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
                    isWrong && 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]',
                    !isGuessed && 'bg-[var(--color-muted)] hover:bg-[var(--color-primary-soft)]',
                  )}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </GamePlayingShell>
  );
}
