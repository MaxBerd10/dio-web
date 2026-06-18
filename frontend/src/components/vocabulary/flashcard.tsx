'use client';

import { useState, useEffect } from 'react';
import { Volume2, Eye, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewQueueItem } from '@/lib/api/vocabulary';

interface FlashcardProps {
  item: ReviewQueueItem;
  revealed: boolean;
  onReveal: () => void;
}

export function Flashcard({ item, revealed, onReveal }: FlashcardProps) {
  const { word, is_new, status } = item;

  // So'z o'zgarganda audio ni avtomatik chal
  useEffect(() => {
    playAudio(word.word, word.audio_url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id]);

  const playAudio = (text: string, url: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(() => {});
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 bg-[var(--color-surface-elevated)] transition-all',
        revealed
          ? 'border-[var(--color-primary)]/30'
          : 'border-[var(--color-border)]',
      )}
    >
      {/* Status badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
        {is_new && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            <Sparkles className="h-2.5 w-2.5" />
            Yangi
          </span>
        )}
        {status === 'mastered' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-600 dark:text-green-400">
            <Star className="h-2.5 w-2.5 fill-current" />
            O&apos;zlashtirilgan
          </span>
        )}
        {word.cefr_level && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
            {word.cefr_level}
          </span>
        )}
      </div>

      <div className="p-8 md:p-10 min-h-[400px] flex flex-col">
        {/* Front: word + audio */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              {word.word}
            </h2>
            <button
              type="button"
              onClick={() => playAudio(word.word, word.audio_url)}
              className="h-10 w-10 rounded-full bg-[var(--color-muted)] hover:bg-[var(--color-border)] flex items-center justify-center transition-colors"
              aria-label="Talaffuz"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>

          {word.pronunciation && (
            <p className="text-base text-[var(--color-muted-foreground)] font-mono">
              {word.pronunciation}
            </p>
          )}

          <p className="text-xs text-[var(--color-muted-foreground)] mt-1 uppercase tracking-wider">
            {word.part_of_speech_display}
          </p>
        </div>

        {/* Back: translation + example */}
        {revealed ? (
          <div className="flex-1 flex flex-col justify-center space-y-4 animate-fadeIn">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-semibold">
                {word.translation_uz}
              </p>
              {word.translation_ru && (
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                  {word.translation_ru}
                </p>
              )}
            </div>

            {word.example_sentence && (
              <div className="rounded-xl bg-[var(--color-muted)]/50 px-5 py-4">
                <p className="text-sm md:text-base italic mb-1">
                  &ldquo;{word.example_sentence}&rdquo;
                </p>
                {word.example_translation && (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {word.example_translation}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Reveal button */
          <div className="flex-1 flex items-center justify-center">
            <button
              type="button"
              onClick={onReveal}
              className="px-6 py-3 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-border)] flex items-center gap-2 transition-all active:scale-95"
            >
              <Eye className="h-5 w-5" />
              <span className="font-medium">Tarjimani ko&apos;rsatish</span>
              <span className="text-xs text-[var(--color-muted-foreground)] ml-1">
                (Space)
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}