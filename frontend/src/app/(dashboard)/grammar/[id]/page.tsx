'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, AlertTriangle, Lightbulb } from 'lucide-react';

import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface GrammarExample {
  id: number;
  sentence: string;
  translation: string;
  highlight: string;
  is_incorrect: boolean;
  order: number;
}

interface GrammarRule {
  id: number;
  title: string;
  formula: string;
  explanation: string;
  explanation_uz: string;
  tips: string;
  common_mistakes: string;
  order: number;
  examples: GrammarExample[];
}

interface GrammarTopicDetail {
  id: number;
  title: string;
  slug: string;
  category: string;
  category_display: string;
  cefr_level: string;
  short_description: string;
  description: string;
  icon: string;
  rules: GrammarRule[];
}

export default function GrammarTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const topicId = parseInt(id, 10);

  const { data: topic, isLoading } = useQuery({
    queryKey: ['grammar-topic', topicId],
    queryFn: async () => {
      const { data } = await api.get<GrammarTopicDetail>(
        `/grammar/topics/${topicId}/`,
      );
      return data;
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <Link
        href="/grammar"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Barcha grammar mavzulari
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-32" />
        </div>
      ) : !topic ? (
        <p className="text-[var(--color-danger)]">Mavzu topilmadi.</p>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
                {topic.category_display}
              </span>
              {topic.cefr_level && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
                  {topic.cefr_level}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {topic.icon && <span className="text-3xl">{topic.icon}</span>}
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {topic.title}
              </h1>
            </div>
            {topic.short_description && (
              <p className="text-[var(--color-muted-foreground)] mt-2 text-sm md:text-base">
                {topic.short_description}
              </p>
            )}
          </div>

          {/* Intro description */}
          {topic.description && (
            <Card className="mb-6">
              <CardContent className="p-5">
                <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                  {topic.description}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rules */}
          <div className="space-y-6">
            {topic.rules.map((rule, idx) => (
              <RuleBlock key={rule.id} rule={rule} index={idx} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RuleBlock({ rule, index }: { rule: GrammarRule; index: number }) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6 space-y-4">
        {/* Rule header */}
        <div>
          <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider font-semibold">
            Qoida {index + 1}
          </p>
          <h2 className="text-lg md:text-xl font-bold mt-1">{rule.title}</h2>
        </div>

        {/* Formula */}
        {rule.formula && (
          <div className="rounded-lg bg-[var(--color-primary)]/8 border border-[var(--color-primary)]/20 px-4 py-3">
            <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">
              Formula
            </p>
            <p className="font-mono text-sm md:text-base text-[var(--color-primary)] font-semibold">
              {rule.formula}
            </p>
          </div>
        )}

        {/* Explanation */}
        {rule.explanation && (
          <div>
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {rule.explanation}
            </p>
          </div>
        )}

        {/* O'zbekcha izoh */}
        {rule.explanation_uz && (
          <div className="rounded-lg bg-[var(--color-muted)]/50 px-4 py-3">
            <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">
              O'zbekcha izoh
            </p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {rule.explanation_uz}
            </p>
          </div>
        )}

        {/* Examples */}
        {rule.examples.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">
              Misollar
            </p>
            <div className="space-y-2">
              {rule.examples.map((example) => (
                <ExampleRow key={example.id} example={example} />
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {rule.tips && (
          <div className="rounded-lg bg-blue-500/8 border border-blue-500/20 px-4 py-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                  Maslahat
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {rule.tips}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Common mistakes */}
        {rule.common_mistakes && (
          <div className="rounded-lg bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/20 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--color-danger)] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[var(--color-danger)] uppercase tracking-wider mb-1">
                  Tez-tez uchraydigan xatolar
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed font-mono">
                  {rule.common_mistakes}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExampleRow({ example }: { example: GrammarExample }) {
  return (
    <div
      className={cn(
        'rounded-lg px-4 py-3 border',
        example.is_incorrect
          ? 'bg-[var(--color-danger)]/8 border-[var(--color-danger)]/20'
          : 'bg-[var(--color-success)]/8 border-[var(--color-success)]/20',
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-base mt-0.5">
          {example.is_incorrect ? '❌' : '✓'}
        </span>
        <div className="flex-1">
          <p
            className={cn(
              'text-sm md:text-base',
              example.is_incorrect && 'line-through opacity-80',
            )}
          >
            {renderHighlight(example.sentence, example.highlight)}
          </p>
          {example.translation && (
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {example.translation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function renderHighlight(sentence: string, highlight: string) {
  if (!highlight) return sentence;
  const idx = sentence.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return sentence;

  const before = sentence.slice(0, idx);
  const match = sentence.slice(idx, idx + highlight.length);
  const after = sentence.slice(idx + highlight.length);

  return (
    <>
      {before}
      <span className="font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1 rounded">
        {match}
      </span>
      {after}
    </>
  );
}