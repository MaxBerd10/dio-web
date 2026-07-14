'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Trophy, Zap } from 'lucide-react';

import { useStartWordMatch, useSubmitWordMatchResult } from '@/lib/hooks/use-game';
import type { WordMatchQuestion } from '@/lib/api/game';
import { GameIdleScreen, GameResultScreen, GamePlayingShell } from '@/components/games/game-shell';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TIME_PER_QUESTION = 8;
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
        { correct_count: correctCount, total_count: questions.length, time_spent_seconds: timeSpent },
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
    if (selected) return;
    setSelected(option);
    const isCorrect = option === currentQ.translation_uz;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(goNext, 900);
  };

  useEffect(() => {
    if (phase !== 'playing' || selected) return;
    if (timeLeft <= 0) {
      const timeoutId = setTimeout(() => {
        setSelected('__timeout__');
        setFeedback('wrong');
        setTimeout(goNext, 700);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, selected, goNext]);

  if (phase === 'idle') {
    return (
      <GameIdleScreen
        emoji="🎮"
        title="So'z bilish o'yini"
        description="10 ta so'z, har biriga 8 soniya. Tezroq va to'g'ri javob bering, ko'proq XP oling!"
        onStart={handleStart}
        loading={startMutation.isPending}
        startIcon={<Gamepad2 className="h-4 w-4" />}
      />
    );
  }

  if (phase === 'result') {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <GameResultScreen
        emoji={pct >= 70 ? '🏆' : '💪'}
        title="O'yin tugadi!"
        subtitle={`${correctCount} / ${questions.length} to'g'ri javob`}
        xpEarned={xpEarned}
        extra={
          <div className="mt-2 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-[var(--color-primary)]">
              <Trophy className="h-4 w-4" />
              <span className="font-bold">{pct}%</span>
            </div>
          </div>
        }
        onPlayAgain={handleStart}
        loading={startMutation.isPending}
      />
    );
  }

  if (!currentQ) return null;

  return (
    <GamePlayingShell>
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-sm font-semibold">
          {currentIdx + 1} / {questions.length}
        </span>
        <div className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold',
          timeLeft <= 3 ? 'bg-[var(--color-danger)]/12 text-[var(--color-danger)]' : 'bg-amber-500/12 text-amber-600',
        )}>
          <Zap className="h-4 w-4" />
          {timeLeft}s
        </div>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-[var(--color-muted)]">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-linear',
            timeLeft <= 3 ? 'bg-[var(--color-danger)]' : 'bg-gradient-to-r from-amber-400 to-[var(--color-accent)]',
          )}
          style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
        />
      </div>

      <Card className="mb-5 border-[var(--color-primary)]/15 bg-gradient-to-br from-[var(--color-primary-soft)] to-transparent">
        <CardContent className="p-10 text-center">
          <p className="text-3xl font-bold tracking-tight md:text-4xl">{currentQ.word}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {currentQ.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrectOpt = opt === currentQ.translation_uz;
          let style = 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-primary)]/40';

          if (selected) {
            if (isCorrectOpt) style = 'border-[var(--color-success)] bg-[var(--color-success)]/10';
            else if (isSelected) style = 'border-[var(--color-danger)] bg-[var(--color-danger)]/10';
            else style = 'border-[var(--color-border)] opacity-50';
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleAnswer(opt)}
              disabled={!!selected}
              className={cn(
                'rounded-2xl border-2 px-4 py-4 text-left text-sm font-semibold transition-all active:scale-[0.98] md:text-base',
                style,
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className={cn(
          'mt-4 text-center text-sm font-semibold',
          feedback === 'correct' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
        )}>
          {feedback === 'correct' ? "✓ To'g'ri!" : `✗ To'g'ri javob: ${currentQ.translation_uz}`}
        </p>
      )}
    </GamePlayingShell>
  );
}
