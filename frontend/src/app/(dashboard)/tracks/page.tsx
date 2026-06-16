'use client';

import { useTracks } from '@/lib/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrackCard } from '@/components/tracks/track-card';

export default function TracksPage() {
  const { data: tracks, isLoading, error } = useTracks();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          O'rganish yo'nalishlari
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          O'zingiz xohlagan yo'nalishni tanlang. Istalgan vaqtda boshqasiga
          o'tishingiz mumkin.
        </p>
      </div>

      {/* Tracks grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[220px] rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-danger)]">
            Yo'nalishlarni yuklashda xato yuz berdi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {tracks?.map((track) => (
            <TrackCard key={track.code} track={track} />
          ))}
        </div>
      )}

      {/* Info section */}
      <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-sm">
        <InfoBlock
          icon="🗣️"
          title="General English"
          description="Kundalik suhbat, sayohat, ish va kommunikatsiya uchun amaliy darslar."
        />
        <InfoBlock
          icon="📚"
          title="CEFR Levels"
          description="A1 dan C2 gacha — har bir daraja uchun tartibli, akademik darslar."
        />
        <InfoBlock
          icon="🎯"
          title="IELTS Preparation"
          description="Listening, Reading, Writing, Speaking — to'rt skill bo'yicha tayyorgarlik."
        />
      </div>
    </div>
  );
}

function InfoBlock({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-[var(--color-surface)]">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}