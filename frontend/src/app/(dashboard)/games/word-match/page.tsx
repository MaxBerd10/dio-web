'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Sparkles, Trophy, X, Zap } from 'lucide-react';

import { useStartWordMatch, useSubmitWordMatchResult } from '@/lib/hooks/use-game';
import type { WordMatchQuestion } from '@/lib/api/game';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TIME_PER_QUESTION = 8; // soniya

type Phase = 'idle' | 'playing' | 'result';

export default function WordMatchPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [questions, setQuestions] = useState<WordMatchQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [startTime, setStartTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const startMutation = useStartWordMatch();
  const submitMutation = useSubmitWordMatchResult();

  const currentQ = questions[currentIdx];

  const handleStart = () => {
    startMutation.mutate(
      { count: 10 },
      {
        onSuccess: (data) => {
          setQuestions(data.questions);
          setCurrentIdx(0);
          setCorrectCount(0);
          setSelected(null);
          setFeedback(null);
          setTimeLeft(TIME_PER_QUESTION);
          setStartTime(Date.now());
          setPhase('playing');
        },
      },
    );
  };

  const goNext = useCallback(() => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setFeedback(null);
      setTimeLeft(TIME_PER_QUESTION);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      submitMutation.mutate(
        {
          correct_count: correctCount,
          total_count: questions.length,
          time_spent_seconds: timeSpent,
        },
        {
          onSuccess: (data) => {
            setXpEarned(data.xp_earned);
            setPhase('result');
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, questions.length, correctCount, startTime]);

  const handleAnswer = (option: string) => {
    if (selected) return; // allaqachon javob berilgan
    setSelected(option);
    const isCorrect = option === currentQ.translation_uz;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setTimeout(goNext, 900);
  };

  // Taymer
  useEffect(() => {
    if (phase !== 'playing' || selected) return;
    if (timeLeft <= 0) {
      setSelected('__timeout__');
      setFeedback('wrong');
      setTimeout(goNext, 700);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, selected, goNext]);

  // === Idle / Start screen ===
  if (phase === 'idle') {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          So'z bilish o'yini
        </h1>
        <p className="text-[var(--color-muted-foreground)] mb-6">
          10 ta so'z, har biriga 8 soniya. Tezroq va to'g'ri javob bering, ko'proq XP oling!
        </p>
        <Button onClick={handleStart} loading={startMutation.isPending}>
          <Gamepad2 className="h-4 w-4" />
          {startMutation.isPending ? 'Yuklanmoqda...' : 'Boshlash'}
        </Button>
      </div>
    );
  }

  // === Result screen ===
  if (phase === 'result') {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">{pct >= 70 ? '🏆' : '💪'}</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          O'yin tugadi!
        </h1>
        <p className="text-[var(--color-muted-foreground)] mb-6">
          {correctCount} / {questions.length} to'g'ri javob
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            <Sparkles className="h-4 w-4" />
            <span className="font-bold">+{xpEarned} XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Trophy className="h-4 w-4" />
            <span className="font-bold">{pct}%</span>
          </div>
        </div>

        <Button onClick={handleStart} loading={startMutation.isPending}>
          <Gamepad2 className="h-4 w-4" />
          Yana o'ynash
        </Button>
      </div>
    );
  }

  // === Playing screen ===
  if (!currentQ) return null;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--color-muted-foreground)]">
          Savol {currentIdx + 1} / {questions.length}
        </span>
        <div className="flex items-center gap-1.5">
          <Zap className={cn('h-4 w-4', timeLeft <= 3 ? 'text-[var(--color-danger)]' : 'text-amber-500')} />
          <span
            className={cn(
              'font-bold text-sm',
              timeLeft <= 3 ? 'text-[var(--color-danger)]' : 'text-amber-500',
            )}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-[var(--color-muted)] rounded-full overflow-hidden mb-6">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-linear',
            timeLeft <= 3 ? 'bg-[var(--color-danger)]' : 'bg-amber-500',
          )}
          style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
        />
      </div>

      {/* Word card */}
      <Card className="mb-5">
        <CardContent className="p-8 text-center">
          <p className="text-3xl md:text-4xl font-bold tracking-tight">
            {currentQ.word}
          </p>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrectOpt = opt === currentQ.translation_uz;
          let style = 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-primary)]/40';

          if (selected) {
            if (isCorrectOpt) {
              style = 'border-[var(--color-success)] bg-[var(--color-success)]/10';
            } else if (isSelected) {
              style = 'border-[var(--color-danger)] bg-[var(--color-danger)]/10';
            } else {
              style = 'border-[var(--color-border)] opacity-50';
            }
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleAnswer(opt)}
              disabled={!!selected}
              className={cn(
                'px-4 py-3.5 rounded-lg border-2 text-sm md:text-base font-medium transition-all text-left',
                style,
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p
          className={cn(
            'text-center mt-4 text-sm font-medium',
            feedback === 'correct' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
          )}
        >
          {feedback === 'correct' ? "✓ To'g'ri!" : `✗ To'g'ri javob: ${currentQ.translation_uz}`}
        </p>
      )}
    </div>
  );
}