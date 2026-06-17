'use client';

import { useState } from 'react';
import { Volume2, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LessonWord } from '@/lib/api/vocabulary';

interface WordCardProps {
  item: LessonWord;
}

export function WordCard({ item }: WordCardProps) {
  const { word, is_key_word } = item;
  const [revealed, setRevealed] = useState(false);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (word.audio_url) {
      const audio = new Audio(word.audio_url);
      audio.play().catch(() => {});
    } else {
      // Browser TTS fallback
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card
      className={cn(
        'transition-all cursor-pointer',
        is_key_word && 'border-[var(--color-primary)]/40',
        'hover:shadow-md',
      )}
      onClick={() => setRevealed((r) => !r)}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl md:text-2xl font-bold tracking-tight">
              {word.word}
            </h3>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-muted)] text-[var(--color-muted-foreground)] uppercase">
              {word.part_of_speech}
            </span>
            {is_key_word && (
              <Star className="h-4 w-4 fill-[var(--color-accent)] text-[var(--color-accent)]" />
            )}
          </div>
          <button
            type="button"
            onClick={playAudio}
            className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-muted)] hover:bg-[var(--color-border)] flex items-center justify-center transition-colors"
            aria-label="Talaffuz"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>

        {/* IPA */}
        {word.pronunciation && (
          <p className="text-sm text-[var(--color-muted-foreground)] font-mono">
            {word.pronunciation}
          </p>
        )}

        {/* Translation (toggle) */}
        <div
          className={cn(
            'mt-3 transition-all duration-200',
            !revealed && 'select-none',
          )}
        >
          <p
            className={cn(
              'text-lg font-medium',
              !revealed &&
                'blur-sm text-[var(--color-muted-foreground)] hover:blur-none',
            )}
          >
            {word.translation_uz}
          </p>
        </div>

        {/* Example */}
        {word.example_sentence && (
          <div className="mt-4 p-3 rounded-lg bg-[var(--color-muted)]/50">
            <p className="text-sm italic">"{word.example_sentence}"</p>
            {revealed && word.example_translation && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {word.example_translation}
              </p>
            )}
          </div>
        )}

        {/* Reveal hint */}
        {!revealed && (
          <p className="text-xs text-[var(--color-muted-foreground)] mt-3 text-center">
            👁️ Tarjima va misolni ochish uchun bosing
          </p>
        )}
      </CardContent>
    </Card>
  );
}