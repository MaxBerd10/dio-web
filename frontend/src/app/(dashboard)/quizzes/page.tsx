'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Search, Trophy } from 'lucide-react';

import { useAllQuizzes } from '@/lib/hooks/use-quiz';
import { quizApi, type QuizStartResponse, type AllQuizItem } from '@/lib/api/quiz';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

function QuizRow({ quiz, onStart, loading }: { quiz: AllQuizItem; onStart: (id: number) => void; loading: boolean }) {
  return (
    <Card className="transition-all hover:border-[var(--color-primary)]/25 hover:shadow-sm">
      <CardContent className="flex items-center gap-3 p-4 lg:gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{quiz.title}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
            {quiz.course_title} · {quiz.module_title} · {quiz.lesson_title}
          </p>
        </div>
        {quiz.best_score !== null && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-success)]/12 px-2.5 py-1 text-xs font-semibold text-[var(--color-success)]">
            <Trophy className="h-3.5 w-3.5" />
            {Math.round(quiz.best_score)}%
          </span>
        )}
        <Button size="sm" className="shrink-0" disabled={loading} onClick={() => onStart(quiz.id)}>
          {quiz.user_attempts > 0 ? 'Qayta' : 'Boshlash'}
        </Button>
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
      <div className="mx-auto max-w-3xl animate-fadeIn p-4 lg:p-8">
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
    <div className="mx-auto max-w-4xl animate-fadeIn p-4 lg:p-8">
      <PageHeader
        icon={<ClipboardCheck className="h-6 w-6" />}
        title="Testlar"
        description="Istalgan testni tanlab, darhol yechishni boshlang."
        badge={quizzes ? `${quizzes.length} ta` : undefined}
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Test nomi bo'yicha qidirish..."
          className="pl-10"
        />
      </div>

      <div className="scrollbar-none mb-3 flex gap-2 overflow-x-auto pb-1">
        {TRACK_OPTIONS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setTrack(t.value);
              setLevel('');
            }}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              track === t.value
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm'
                : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {track === 'cefr' && (
        <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto pb-1">
          {LEVEL_OPTIONS.map((lvl) => (
            <button
              key={lvl || 'all'}
              type="button"
              onClick={() => setLevel(lvl)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                level === lvl
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
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
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : !quizzes || quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
            Hech qanday test topilmadi.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <QuizRow
              key={q.id}
              quiz={q}
              loading={startMutation.isPending}
              onStart={(id) => startMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
