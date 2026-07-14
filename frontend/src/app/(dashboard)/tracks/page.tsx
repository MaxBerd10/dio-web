'use client';

import { GraduationCap } from 'lucide-react';

import { useTracks } from '@/lib/hooks/use-dashboard';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { TrackCard } from '@/components/tracks/track-card';
import { Card, CardContent } from '@/components/ui/card';

export default function TracksPage() {
  const { data: tracks, isLoading, error } = useTracks();

  return (
    <div className="mx-auto max-w-6xl p-4 lg:p-8 animate-fadeIn">
      <PageHeader
        icon={<GraduationCap className="h-6 w-6" />}
        title="O'rganish yo'nalishlari"
        description="O'zingiz xohlagan yo'nalishni tanlang. Istalgan vaqtda boshqasiga o'tishingiz mumkin."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[240px] rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-[var(--color-danger)]/30">
          <CardContent className="py-12 text-center text-[var(--color-danger)]">
            Yo&apos;nalishlarni yuklashda xato yuz berdi.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {tracks?.map((track) => (
            <TrackCard key={track.code} track={track} />
          ))}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-3 md:mt-12 md:grid-cols-3 md:gap-4">
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

function InfoBlock({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <Card className="bg-[var(--color-muted)]/30 border-dashed">
      <CardContent className="p-4">
        <div className="mb-2 text-2xl">{icon}</div>
        <h3 className="mb-1 font-bold">{title}</h3>
        <p className="text-xs leading-relaxed text-[var(--color-muted-foreground)]">{description}</p>
      </CardContent>
    </Card>
  );
}
