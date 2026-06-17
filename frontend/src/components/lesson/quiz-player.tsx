'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';

import { quizApi, type QuizStartResponse, type QuizSubmitResponse } from '@/lib/api/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuizPlayerProps {
  startData: QuizStartResponse;
  onClose: () => void;
  onComplete: () => void;
}

type Answer =
  | { type: 'choice'; choiceIds: number[] }
  | { type: 'text'; value: string };

export function QuizPlayer({ startData, onClose, onComplete }: QuizPlayerProps) {
  const { attempt_id, quiz, questions } = startData;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  const currentQ = questions[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === questions.length - 1;
  const currentAnswer = answers[currentQ?.id];
  const hasAnswer = currentAnswer && (
    (currentAnswer.type === 'choice' && currentAnswer.choiceIds.length > 0) ||
    (currentAnswer.type === 'text' && currentAnswer.value.trim().length > 0)
  );

  const answerMutation = useMutation({
    mutationFn: (payload: Parameters<typeof quizApi.submitAnswer>[1]) =>
      quizApi.submitAnswer(attempt_id, payload),
  });

  const submitMutation = useMutation({
    mutationFn: () => quizApi.submitQuiz(attempt_id),
    onSuccess: (data) => setResult(data),
  });

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIdx]);

  // Result ko'rinayotganda yakuniy callback
  useEffect(() => {
    if (result) onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const saveCurrentAnswer = async () => {
    if (!currentAnswer) return;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    if (currentAnswer.type === 'choice') {
      await answerMutation.mutateAsync({
        question_id: currentQ.id,
        selected_choice_ids: currentAnswer.choiceIds,
        time_spent_seconds: timeSpent,
      });
    } else {
      await answerMutation.mutateAsync({
        question_id: currentQ.id,
        text_answer: currentAnswer.value,
        time_spent_seconds: timeSpent,
      });
    }
  };

  const goNext = async () => {
    if (!hasAnswer) return;
    await saveCurrentAnswer();
    if (!isLast) setCurrentIdx((i) => i + 1);
  };

  const goPrev = () => {
    if (!isFirst) setCurrentIdx((i) => i - 1);
  };

  const handleSubmit = async () => {
    if (hasAnswer) await saveCurrentAnswer();
    submitMutation.mutate();
  };

  const setAnswer = (a: Answer) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: a }));
  };

  // Agar yakuniy natija bor — Results ko'rsatamiz
  if (result) {
    return <QuizResults result={result} onClose={onClose} />;
  }

  if (!currentQ) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] p-8 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Bu testda savollar yo'q.
        </p>
      </div>
    );
  }

  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-lg hover:bg-[var(--color-muted)] flex items-center justify-center"
          aria-label="Yopish"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--color-muted-foreground)]">
              Savol {currentIdx + 1} / {questions.length}
            </span>
            <span className="font-medium">{quiz.title}</span>
          </div>
          <Progress value={progress} size="sm" />
        </div>
      </div>

      {/* Question card */}
      <Card>
        <CardContent className="p-5 md:p-6">
          {/* Question type badge */}
          <div className="mb-3">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-muted)] text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {currentQ.question_type_display}
            </span>
          </div>

          {/* Question text */}
          <div className="text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap mb-5">
            {currentQ.text}
          </div>

          {/* Image */}
          {currentQ.image && (
            <img
              src={currentQ.image}
              alt=""
              className="rounded-lg mb-5 max-h-64 w-auto"
            />
          )}

          {/* Answer input */}
          <AnswerInput
            question={currentQ}
            value={answers[currentQ.id]}
            onChange={setAnswer}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={isFirst}
        >
          <ChevronLeft className="h-4 w-4" />
          Oldingi
        </Button>

        {isLast ? (
          <Button
            onClick={handleSubmit}
            disabled={!hasAnswer || submitMutation.isPending}
            loading={submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Yuborilmoqda...' : 'Yakunlash'}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!hasAnswer}>
            Keyingi
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(idx)}
            className={cn(
              'h-2 rounded-full transition-all',
              idx === currentIdx
                ? 'w-8 bg-[var(--color-primary)]'
                : answers[q.id]
                  ? 'w-2 bg-[var(--color-primary)]/40'
                  : 'w-2 bg-[var(--color-border)]',
            )}
            aria-label={`Savol ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Answer input — savol turiga qarab
// ============================================================

function AnswerInput({
  question,
  value,
  onChange,
}: {
  question: import('@/lib/api/quiz').QuizQuestion;
  value: Answer | undefined;
  onChange: (a: Answer) => void;
}) {
  if (
    question.question_type === 'multiple_choice' ||
    question.question_type === 'true_false'
  ) {
    const selected = value?.type === 'choice' ? value.choiceIds : [];
    return (
      <div className="space-y-2">
        {question.choices.map((choice) => {
          const isSelected = selected.includes(choice.id);
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => onChange({ type: 'choice', choiceIds: [choice.id] })}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
                'active:scale-[0.99]',
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/8'
                  : 'border-[var(--color-border)] hover:border-[var(--color-muted-foreground)]/40 bg-[var(--color-surface-elevated)]',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0',
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                      : 'border-[var(--color-border)]',
                  )}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm md:text-base">{choice.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.question_type === 'multiple_select') {
    const selected = value?.type === 'choice' ? value.choiceIds : [];
    const toggle = (id: number) => {
      const next = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];
      onChange({ type: 'choice', choiceIds: next });
    };
    return (
      <div className="space-y-2">
        <p className="text-xs text-[var(--color-muted-foreground)] mb-2">
          Bir nechta to'g'ri javob bo'lishi mumkin
        </p>
        {question.choices.map((choice) => {
          const isSelected = selected.includes(choice.id);
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => toggle(choice.id)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border-2 transition-all active:scale-[0.99]',
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/8'
                  : 'border-[var(--color-border)] hover:border-[var(--color-muted-foreground)]/40 bg-[var(--color-surface-elevated)]',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-5 w-5 rounded border-2 flex items-center justify-center shrink-0',
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                      : 'border-[var(--color-border)]',
                  )}
                >
                  {isSelected && (
                    <CircleCheck className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-sm md:text-base">{choice.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (
    question.question_type === 'fill_blank' ||
    question.question_type === 'short_answer'
  ) {
    const text = value?.type === 'text' ? value.value : '';
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => onChange({ type: 'text', value: e.target.value })}
        placeholder="Javobni shu yerga yozing..."
        className={cn(
          'w-full h-12 rounded-lg border-2 px-4 text-base',
          'bg-[var(--color-surface-elevated)] border-[var(--color-border)]',
          'focus-visible:outline-none focus-visible:border-[var(--color-primary)]',
          'transition-colors',
        )}
        autoFocus
      />
    );
  }

  return (
    <p className="text-sm text-[var(--color-muted-foreground)]">
      Bu savol turi hozircha qo'llab-quvvatlanmaydi: {question.question_type}
    </p>
  );
}

// ============================================================
// Results screen
// ============================================================

function QuizResults({
  result,
  onClose,
}: {
  result: QuizSubmitResponse;
  onClose: () => void;
}) {
  const correctCount = result.results?.filter((r) => r.user_answer.is_correct).length ?? 0;
  const totalCount = result.results?.length ?? 0;
  const minutes = Math.floor(result.time_spent_seconds / 60);
  const seconds = result.time_spent_seconds % 60;

  return (
    <div className="space-y-5">
      {/* Top close */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="h-9 px-3 rounded-lg hover:bg-[var(--color-muted)] flex items-center gap-1 text-sm"
        >
          <X className="h-4 w-4" />
          Yopish
        </button>
      </div>

      {/* Main result */}
      <Card
        className={cn(
          'overflow-hidden relative',
          result.passed
            ? 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/0'
            : 'border-[var(--color-danger)]/30 bg-gradient-to-br from-[var(--color-danger)]/5 to-[var(--color-danger)]/0',
        )}
      >
        <CardContent className="p-6 md:p-8 text-center">
          <div className="text-5xl mb-3">{result.passed ? '🎉' : '💪'}</div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            {result.passed ? "Ajoyib!" : 'Yana urinib ko\'ring'}
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {result.passed
              ? "Testni muvaffaqiyatli yakunladingiz."
              : "Sizga yana bir nechta urinish kerak."}
          </p>

          {/* Big percentage */}
          <div className="mt-6 mb-4">
            <div
              className={cn(
                'text-6xl md:text-7xl font-bold tracking-tight',
                result.passed
                  ? 'text-green-500'
                  : 'text-[var(--color-danger)]',
              )}
            >
              {Math.round(result.percentage)}%
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              {correctCount} / {totalCount} to'g'ri javob
            </p>
          </div>

          {/* XP earned */}
          {result.xp_earned > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
              <Sparkles className="h-4 w-4" />
              <span className="font-bold">+{result.xp_earned} XP</span>
            </div>
          )}

          <div className="mt-5 text-xs text-[var(--color-muted-foreground)]">
            Vaqt: {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </CardContent>
      </Card>

      {/* Per-question results */}
      {result.results && result.show_correct_answers && (
        <div>
          <h3 className="text-base font-semibold mb-3">
            Savol-javoblar
          </h3>
          <div className="space-y-3">
            {result.results.map((r, idx) => (
              <QuestionResult key={r.question.id} item={r} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom action */}
      <Button fullWidth onClick={onClose}>
        Tugatish
      </Button>
    </div>
  );
}

function QuestionResult({
  item,
  index,
}: {
  item: NonNullable<QuizSubmitResponse['results']>[number];
  index: number;
}) {
  const { question, user_answer } = item;
  const isCorrect = user_answer.is_correct;

  return (
    <Card
      className={cn(
        isCorrect
          ? 'border-green-500/30'
          : 'border-[var(--color-danger)]/30',
      )}
    >
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-8 w-8 rounded-full shrink-0 flex items-center justify-center',
              isCorrect
                ? 'bg-green-500/15 text-green-500'
                : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]',
            )}
          >
            {isCorrect ? (
              <CircleCheck className="h-4 w-4" />
            ) : (
              <CircleX className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1">
              Savol {index + 1}
            </p>
            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
              {question.text}
            </p>

            {/* Choices feedback */}
            {question.choices.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {question.choices.map((choice) => {
                  const wasSelected = user_answer.selected_choice_ids.includes(
                    choice.id,
                  );
                  const isCorrectChoice = choice.is_correct;
                  return (
                    <div
                      key={choice.id}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                        isCorrectChoice && 'bg-green-500/10',
                        wasSelected && !isCorrectChoice && 'bg-[var(--color-danger)]/10',
                      )}
                    >
                      {isCorrectChoice ? (
                        <CircleCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : wasSelected ? (
                        <CircleX className="h-3.5 w-3.5 text-[var(--color-danger)] shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-[var(--color-border)] shrink-0" />
                      )}
                      <span
                        className={cn(
                          (isCorrectChoice || wasSelected) && 'font-medium',
                        )}
                      >
                        {choice.text}
                      </span>
                      {wasSelected && (
                        <span className="ml-auto text-[10px] text-[var(--color-muted-foreground)]">
                          (siz)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fill-blank user answer vs correct */}
            {question.question_type === 'fill_blank' && (
              <div className="mt-3 space-y-1.5">
                {user_answer.text_answer && (
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                      isCorrect
                        ? 'bg-green-500/10'
                        : 'bg-[var(--color-danger)]/10',
                    )}
                  >
                    <span className="text-xs text-[var(--color-muted-foreground)]">
                      Sizning javobingiz:
                    </span>
                    <span className="font-mono">
                      {user_answer.text_answer}
                    </span>
                  </div>
                )}
                {!isCorrect && question.correct_answer_text && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-green-500/10">
                    <span className="text-xs text-[var(--color-muted-foreground)]">
                      To'g'ri javob:
                    </span>
                    <span className="font-mono font-medium">
                      {question.correct_answer_text}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            {question.explanation && (
              <div className="mt-3 rounded-md bg-[var(--color-muted)]/50 px-3 py-2">
                <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider font-semibold mb-0.5">
                  Tushuntirish
                </p>
                <p className="text-sm leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}