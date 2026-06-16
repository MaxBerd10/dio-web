'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Brain, ChevronRight } from 'lucide-react';

import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface GrammarTopic {
  id: number;
  title: string;
  slug: string;
  category: string;
  category_display: string;
  cefr_level: string;
  short_description: string;
  icon: string;
  rule_count: number;
}

export default function GrammarPage() {
  const { data: topics, isLoading } = useQuery({
    queryKey: ['grammar-topics'],
    queryFn: async () => {
      const { data } = await api.get<GrammarTopic[]>('/grammar/topics/');
      return data;
    },
  });

  // Kategoriya bo'yicha guruhlash
  const grouped: Record<string, GrammarTopic[]> = {};
  topics?.forEach((t) => {
    if (!grouped[t.category_display]) grouped[t.category_display] = [];
    grouped[t.category_display].push(t);
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-7 w-7 text-[var(--color-primary)]" />
          Grammar
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          Inglizcha grammatika qoidalari, qoidalar va misollar bilan.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : !topics || topics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Hozircha grammar mavzulari qo'shilmagan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, topicList]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-3">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topicList.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/grammar/${topic.id}`}
                    className="block group"
                  >
                    <Card className="transition-all hover:border-[var(--color-primary)] hover:shadow-sm group-active:scale-[0.99]">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="text-2xl shrink-0">
                          {topic.icon || '📘'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-sm md:text-base truncate">
                              {topic.title}
                            </h3>
                            {topic.cefr_level && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                {topic.cefr_level}
                              </span>
                            )}
                          </div>
                          {topic.short_description && (
                            <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
                              {topic.short_description}
                            </p>
                          )}
                          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                            {topic.rule_count} ta qoida
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0 group-hover:text-[var(--color-primary)]" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}