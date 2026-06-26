'use client';

import Link from 'next/link';
import { Gamepad2, Zap, Skull, Shuffle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const GAMES = [
  {
    href: '/games/word-match',
    icon: Zap,
    title: "So'z bilish",
    description: "10 ta so'z, har biriga 8 soniya. Tezroq javob — ko'proq XP!",
    color: '#f59e0b',
  },
  {
    href: '/games/hangman',
    icon: Skull,
    title: "Osma o'yin",
    description: "So'zni harflab toping, 6 tadan ortiq xato qilmang.",
    color: '#8b5cf6',
  },
  {
    href: '/games/scramble',
    icon: Shuffle,
    title: "So'z tartibini tiklash",
    description: "Aralashtirilgan harflardan to'g'ri so'zni yig'ing.",
    color: '#3b82f6',
  },
];

export default function GamesHubPage() {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Gamepad2 className="h-7 w-7 text-[var(--color-primary)]" />
          O'yinlar
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          O'ynab turib so'z boyligingizni mustahkamlang.
        </p>
      </div>

      <div className="space-y-3">
        {GAMES.map((game) => (
          <Link key={game.href} href={game.href} className="block">
            <Card className="hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all active:scale-[0.99]">
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${game.color}20` }}
                >
                  <game.icon className="h-6 w-6" style={{ color: game.color }} />
                </div>
                <div>
                  <p className="font-bold text-base">{game.title}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    {game.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}