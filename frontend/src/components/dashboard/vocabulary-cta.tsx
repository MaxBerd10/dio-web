'use client';

import Link from 'next/link';
import { Brain, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/lib/hooks/use-dashboard';

export function VocabularyCTA() {
  const { data } = useDashboard();
  const dueCount = data?.words_due_now ?? 0;

  if (dueCount === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 border-[var(--color-primary)]/20">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
            <Brain className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base">
              {dueCount} ta so'z takrorlashga tayyor
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              Spaced repetition algoritmi shu so'zlarni siz unutmasligingiz uchun
              tanladi.
            </p>
          </div>
        </div>
        <Link href="/vocabulary/review" className="block mt-4 md:mt-3 md:ml-16">
          <Button fullWidth size="md" className="md:w-auto">
            Hozir takrorlash <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}