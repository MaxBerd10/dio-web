'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLessonWords } from '@/lib/hooks/use-lesson-content';
import { WordCard } from './word-card';

interface LessonWordsProps {
  lessonId: number;
}

export function LessonWords({ lessonId }: LessonWordsProps) {
  const { data: words, isLoading } = useLessonWords(lessonId);
  const [revealAll, setRevealAll] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Bu darsda hozircha so'zlar yo'q.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold">
            Yangi so'zlar ({words.length})
          </h2>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
            Har bir kartani bosib tarjimasi va misolini ochishingiz mumkin
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRevealAll(!revealAll)}
        >
          {revealAll ? (
            <>
              <EyeOff className="h-4 w-4" />
              Yashirish
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Hammasini ko'rsatish
            </>
          )}
        </Button>
      </div>

      {/* Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        key={String(revealAll)} // remount qilish uchun
      >
        {words.map((item) => (
          <WordCardWrapper key={item.id} item={item} revealAll={revealAll} />
        ))}
      </div>
    </div>
  );
}

function WordCardWrapper({
  item,
  revealAll,
}: {
  item: import('@/lib/api/vocabulary').LessonWord;
  revealAll: boolean;
}) {
  if (revealAll) {
    return <RevealedWordCard item={item} />;
  }
  return <WordCard item={item} />;
}

function RevealedWordCard({
  item,
}: {
  item: import('@/lib/api/vocabulary').LessonWord;
}) {
  const { word, is_key_word } = item;

  const playAudio = () => {
    if (word.audio_url) {
      const audio = new Audio(word.audio_url);
      audio.play().catch(() => {});
    } else {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={
        'p-5 rounded-xl border bg-[var(--color-surface-elevated)] ' +
        (is_key_word
          ? 'border-[var(--color-primary)]/40'
          : 'border-[var(--color-border)]')
      }
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">
            {word.word}
          </h3>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-muted)] uppercase">
            {word.part_of_speech}
          </span>
        </div>
        <button
          type="button"
          onClick={playAudio}
          className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-muted)] hover:bg-[var(--color-border)] flex items-center justify-center"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
      </div>
      {word.pronunciation && (
        <p className="text-sm text-[var(--color-muted-foreground)] font-mono">
          {word.pronunciation}
        </p>
      )}
      <p className="text-lg font-medium mt-3">{word.translation_uz}</p>
      {word.example_sentence && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-muted)]/50">
          <p className="text-sm italic">"{word.example_sentence}"</p>
          {word.example_translation && (
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {word.example_translation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}