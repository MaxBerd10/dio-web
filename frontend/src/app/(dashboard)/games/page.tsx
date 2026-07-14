'use client';

import Link from 'next/link';
import { Gamepad2, Zap, Skull, Shuffle, ArrowRight, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const GAMES = [
  {
    href: '/games/word-match',
    icon: Zap,
    title: "So'z bilish",
    description: "10 ta so'z, har biriga 8 soniya. Tezroq javob — ko'proq XP!",
    accent: 'amber' as const,
    xp: '+15 XP',
  },
  {
    href: '/games/hangman',
    icon: Skull,
    title: "Osma o'yin",
    description: "So'zni harflab toping, 6 tadan ortiq xato qilmang.",
    accent: 'purple' as const,
    xp: '+20 XP',
  },
  {
    href: '/games/scramble',
    icon: Shuffle,
    title: "So'z tartibini tiklash",
    description: "Aralashtirilgan harflardan to'g'ri so'zni yig'ing.",
    accent: 'blue' as const,
    xp: '+12 XP',
  },
];

const ACCENTS = {
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-600', border: 'hover:border-amber-500/30' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-600', border: 'hover:border-purple-500/30' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-600', border: 'hover:border-blue-500/30' },
};

export default function GamesHubPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 lg:p-8 animate-fadeIn">
      <PageHeader
        icon={<Gamepad2 className="h-6 w-6" />}
        title="O'yinlar"
        description="O'ynab turib so'z boyligingizni mustahkamlang va XP yig'ing."
      />

      <Card className="mb-5 border-[var(--color-primary)]/15 bg-gradient-to-br from-[var(--color-primary-soft)] to-transparent">
        <CardContent className="flex items-center gap-3 p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Har bir o&apos;yin tugagach XP qo&apos;shiladi va streakingiz saqlanadi.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {GAMES.map((game) => {
          const styles = ACCENTS[game.accent];
          const Icon = game.icon;
          return (
            <Link key={game.href} href={game.href} className="block active:scale-[0.98] transition-transform">
              <Card className={cn('transition-all hover:shadow-md', styles.border)}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', styles.bg, styles.text)}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{game.title}</p>
                      <span className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                        {game.xp}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">{game.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[var(--color-muted-foreground)]/50" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
