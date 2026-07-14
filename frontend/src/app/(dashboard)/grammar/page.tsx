'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Brain, ChevronRight } from 'lucide-react';

import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/page-header';
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
    queryFn: async (): Promise<GrammarTopic[]> => {
      const { data } = await api.get('/grammar/topics/', { params: { page_size: 100 } });
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      return [];
    },
  });

  const grouped: Record<string, GrammarTopic[]> = {};
  topics?.forEach((t) => {
    if (!grouped[t.category_display]) grouped[t.category_display] = [];
    grouped[t.category_display].push(t);
  });

  return (
    <div className="mx-auto max-w-5xl p-4 lg:p-8 animate-fadeIn">
      <PageHeader
        icon={<Brain className="h-6 w-6" />}
        title="Grammar"
        description="Inglizcha grammatika qoidalari, qoidalar va misollar bilan."
        badge={topics && topics.length > 0 ? `${topics.length} mavzu` : undefined}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : !topics || topics.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 px-6 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Hozircha grammar mavzulari qo&apos;shilmagan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, topicList]) => (
            <div key={category}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="section-label">{category}</h2>
                <span className="rounded-full bg-[var(--color-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--color-muted-foreground)]">
                  {topicList.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {topicList.map((topic) => (
                  <Link key={topic.id} href={`/grammar/${topic.id}`} className="group block active:scale-[0.98] transition-transform">
                    <Card className="transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md">
                      <CardContent className="flex items-center gap-3 p-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-2xl">
                          {topic.icon || '📘'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-bold text-sm md:text-base">{topic.title}</h3>
                            {topic.cefr_level && (
                              <span className="shrink-0 rounded-lg bg-[var(--color-primary-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                                {topic.cefr_level}
                              </span>
                            )}
                          </div>
                          {topic.short_description && (
                            <p className="line-clamp-1 text-xs text-[var(--color-muted-foreground)]">
                              {topic.short_description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                            {topic.rule_count} ta qoida
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] transition-colors group-hover:text-[var(--color-primary)]" />
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
