'use client';

import { Star, AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLessonGrammar } from '@/lib/hooks/use-lesson-content';
import type {
  GrammarRule,
  GrammarExample,
  LessonGrammarItem,
} from '@/lib/api/grammar';

interface LessonGrammarProps {
  lessonId: number;
}

export function LessonGrammar({ lessonId }: LessonGrammarProps) {
  const { data: items, isLoading } = useLessonGrammar(lessonId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 px-6 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Bu darsda grammar mavzulari yo'q.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {items.map((item) => (
        <TopicBlock key={item.id} item={item} />
      ))}
    </div>
  );
}

function TopicBlock({ item }: { item: LessonGrammarItem }) {
  const { topic, is_main_topic } = item;

  return (
    <section>
      {/* Topic header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
            {topic.category_display}
          </span>
          {topic.cefr_level && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
              {topic.cefr_level}
            </span>
          )}
          {is_main_topic && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
              <Star className="h-3 w-3 fill-current" />
              Asosiy mavzu
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {topic.icon && <span className="text-2xl">{topic.icon}</span>}
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {topic.title}
          </h2>
        </div>
        {topic.short_description && (
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1.5">
            {topic.short_description}
          </p>
        )}
      </div>

      {/* Intro description */}
      {topic.description && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {topic.description}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      <div className="space-y-4">
        {topic.rules.map((rule, idx) => (
          <RuleBlock key={rule.id} rule={rule} index={idx} />
        ))}
      </div>
    </section>
  );
}

function RuleBlock({ rule, index }: { rule: GrammarRule; index: number }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {/* Rule header */}
        <div>
          <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider font-semibold">
            Qoida {index + 1}
          </p>
          <h3 className="text-base md:text-lg font-bold mt-0.5">
            {rule.title}
          </h3>
        </div>

        {/* Formula */}
        {rule.formula && (
          <div className="rounded-lg bg-[var(--color-primary)]/8 border border-[var(--color-primary)]/20 px-4 py-3">
            <p className="text-[10px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">
              Formula
            </p>
            <p className="font-mono text-sm text-[var(--color-primary)] font-semibold">
              {rule.formula}
            </p>
          </div>
        )}

        {/* Explanation */}
        {rule.explanation && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {rule.explanation}
          </p>
        )}

        {/* O'zbekcha izoh */}
        {rule.explanation_uz && (
          <div className="rounded-lg bg-[var(--color-muted)]/50 px-4 py-3">
            <p className="text-[10px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">
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
            <p className="text-[10px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">
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
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
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
                <p className="text-[10px] font-semibold text-[var(--color-danger)] uppercase tracking-wider mb-1">
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
        'rounded-lg px-4 py-2.5 border',
        example.is_incorrect
          ? 'bg-[var(--color-danger)]/8 border-[var(--color-danger)]/20'
          : 'bg-[var(--color-success)]/8 border-[var(--color-success)]/20',
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-sm mt-0.5">
          {example.is_incorrect ? '❌' : '✓'}
        </span>
        <div className="flex-1">
          <p
            className={cn(
              'text-sm',
              example.is_incorrect && 'line-through opacity-80',
            )}
          >
            {renderHighlight(example.sentence, example.highlight)}
          </p>
          {example.translation && (
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
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