'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Search, Trophy } from 'lucide-react';

import { useAllQuizzes } from '@/lib/hooks/use-quiz';
import { quizApi, type QuizStartResponse, type AllQuizItem } from '@/lib/api/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizPlayer } from '@/components/lesson/quiz-player';
import { cn } from '@/lib/utils';

const TRACK_OPTIONS = [
  { value: '', label: 'Hammasi' },
  { value: 'general', label: 'General' },
  { value: 'cefr', label: 'CEFR' },
  { value: 'ielts', label: 'IELTS' },
];

const LEVEL_OPTIONS = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function QuizRow({ quiz, onStart }: { quiz: AllQuizItem; onStart: (id: number) => void }) {
  return (
    <Card className="hover:border-[var(--color-primary)]/30 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
          <ClipboardCheck className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{quiz.title}</p>
          <p className="text-xs text-[var(--color-muted-foreground)] truncate">
            {quiz.course_title} · {quiz.module_title} · {quiz.lesson_title}
          </p>
        </div>
        {quiz.best_score !== null && (
          <span className="flex items-center gap-1 text-xs text-[var(--color-success)] shrink-0">
            <Trophy className="h-3.5 w-3.5" />
            {Math.round(quiz.best_score)}%
          </span>
        )}
        <button
          onClick={() => onStart(quiz.id)}
          className="shrink-0 rounded-full bg-[var(--color-primary)] text-white text-xs font-medium px-3.5 py-1.5 hover:opacity-90 transition-opacity"
        >
          {quiz.user_attempts > 0 ? 'Qayta yechish' : 'Boshlash'}
        </button>
      </CardContent>
    </Card>
  );
}

export default function QuizzesPage() {
  const queryClient = useQueryClient();
  const [track, setTrack] = useState('');
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const [startData, setStartData] = useState<QuizStartResponse | null>(null);

  const { data: quizzes, isLoading } = useAllQuizzes({
    track: track || undefined,
    level: level || undefined,
    search: search || undefined,
  });

  const startMutation = useMutation({
    mutationFn: (quizId: number) => quizApi.startQuiz(quizId),
    onSuccess: (data) => setStartData(data),
  });

  const handleClose = () => {
    setStartData(null);
    queryClient.invalidateQueries({ queryKey: ['all-quizzes'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  if (startData) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <QuizPlayer
          startData={startData}
          onClose={handleClose}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-7 w-7 text-[var(--color-primary)]" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Testlar</h1>
        </div>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          Istalgan testni tanlab, darrov yechishni boshlang.
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Test nomi bo'yicha qidirish..."
          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto mb-3 pb-1">
        {TRACK_OPTIONS.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setTrack(t.value);
              setLevel('');
            }}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              track === t.value
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {track === 'cefr' && (
        <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
          {LEVEL_OPTIONS.map((lvl) => (
            <button
              key={lvl || 'all'}
              onClick={() => setLevel(lvl)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                level === lvl
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]',
              )}
            >
              {lvl || 'Hammasi'}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : !quizzes || quizzes.length === 0 ? (
        <p className="text-center py-10 text-sm text-[var(--color-muted-foreground)]">
          Hech qanday test topilmadi.
        </p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <QuizRow key={q.id} quiz={q} onStart={(id) => startMutation.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  );
}