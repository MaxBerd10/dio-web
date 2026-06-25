'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Sparkles, Skull, RotateCcw } from 'lucide-react';

import { useStartHangman, useSubmitHangmanResult } from '@/lib/hooks/use-game';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_WRONG = 6;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

type Phase = 'idle' | 'playing' | 'result';

function HangmanFigure({ wrongCount }: { wrongCount: number }) {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto">
      {/* Gallow */}
      <line x1="20" y1="180" x2="120" y2="180" stroke="currentColor" strokeWidth="4" className="text-[var(--color-muted-foreground)]" />
      <line x1="50" y1="180" x2="50" y2="20" stroke="currentColor" strokeWidth="4" className="text-[var(--color-muted-foreground)]" />
      <line x1="50" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="4" className="text-[var(--color-muted-foreground)]" />
      <line x1="130" y1="20" x2="130" y2="40" stroke="currentColor" strokeWidth="4" className="text-[var(--color-muted-foreground)]" />

      {/* Head */}
      {wrongCount >= 1 && (
        <circle cx="130" cy="55" r="15" stroke="currentColor" strokeWidth="3" fill="none" className="text-[var(--color-danger)]" />
      )}
      {/* Body */}
      {wrongCount >= 2 && (
        <line x1="130" y1="70" x2="130" y2="115" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />
      )}
      {/* Left arm */}
      {wrongCount >= 3 && (
        <line x1="130" y1="85" x2="110" y2="100" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />
      )}
      {/* Right arm */}
      {wrongCount >= 4 && (
        <line x1="130" y1="85" x2="150" y2="100" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />
      )}
      {/* Left leg */}
      {wrongCount >= 5 && (
        <line x1="130" y1="115" x2="113" y2="145" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />
      )}
      {/* Right leg */}
      {wrongCount >= 6 && (
        <line x1="130" y1="115" x2="147" y2="145" stroke="currentColor" strokeWidth="3" className="text-[var(--color-danger)]" />
      )}
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

  const isWordComplete = wordData
    ? wordData.word.split('').every((ch) => guessed.has(ch))
    : false;

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
      {
        word_id: wordData.id,
        won: didWin,
        wrong_guesses: finalWrong,
        time_spent_seconds: timeSpent,
      },
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
      const complete = wordData.word.split('').every((ch) => next.has(ch));
      if (complete) {
        finishGame(true, wrongCount);
      }
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= MAX_WRONG) {
        finishGame(false, newWrong);
      }
    }
  };

  // Fizik klaviatura
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

  // === Idle ===
  if (phase === 'idle') {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto text-center">
        <div className="text-6xl mb-4">💀</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Osma o'yin
        </h1>
        <p className="text-[var(--color-muted-foreground)] mb-6">
          So'zni harflab toping. 6 tadan ortiq xato qilsangiz — yutqazasiz!
        </p>
        <Button onClick={handleStart} loading={startMutation.isPending}>
          <Skull className="h-4 w-4" />
          {startMutation.isPending ? 'Yuklanmoqda...' : 'Boshlash'}
        </Button>
      </div>
    );
  }

  // === Result ===
  if (phase === 'result') {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto text-center">
        <div className="text-6xl mb-4">{won ? '🎉' : '💀'}</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          {won ? "Top'dingiz!" : "Yutqazdingiz"}
        </h1>
        <p className="text-[var(--color-muted-foreground)] mb-1">
          So'z: <span className="font-bold text-[var(--color-foreground)]">{wordData?.word}</span>
        </p>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
          {wordData?.translation_uz}
        </p>

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
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--color-muted-foreground)]">
          Xatolar: {wrongCount} / {MAX_WRONG}
        </span>
        {!showHint ? (
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Yordam
          </button>
        ) : (
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5" />
            {wordData.translation_uz}
          </span>
        )}
      </div>

      <HangmanFigure wrongCount={wrongCount} />

      {/* So'z bo'shliqlari */}
      <div className="flex flex-wrap justify-center gap-2 my-6">
        {wordData.word.split('').map((ch, idx) => (
          <div
            key={idx}
            className="h-10 w-9 flex items-center justify-center border-b-2 border-[var(--color-border)] text-lg font-bold uppercase"
          >
            {guessed.has(ch) ? ch : ''}
          </div>
        ))}
      </div>

      {/* Klaviatura */}
      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
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
                'h-9 rounded-md text-sm font-semibold uppercase transition-colors',
                isCorrect && 'bg-[var(--color-success)]/20 text-[var(--color-success)]',
                isWrong && 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]',
                !isGuessed && 'bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/70',
              )}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}