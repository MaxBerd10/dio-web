'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  Sparkles,
  BookOpen,
  Brain,
  CircleCheck,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';

import { useLesson } from '@/lib/hooks/use-courses';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { renderMarkdown } from '@/lib/markdown';
import { LessonWords } from '@/components/lesson/lesson-words';
import { LessonGrammar } from '@/components/lesson/lesson-grammar';
import { LessonQuiz } from '@/components/lesson/lesson-quiz';
import { LessonAssignment } from '@/components/lesson/lesson-assignment';
import { LessonCompleteButton } from '@/components/lesson/lesson-complete-button';
import { cn } from '@/lib/utils';

type TabValue = 'overview' | 'words' | 'grammar' | 'quiz' | 'assignment';

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const lessonId = parseInt(id, 10);
  const { data: lesson, isLoading, error } = useLesson(lessonId);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  return (
    <div className="mx-auto max-w-4xl animate-fadeIn p-4 lg:p-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Orqaga
      </button>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3 rounded-xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <Card className="border-[var(--color-danger)]/30">
          <CardContent className="py-12 text-center text-[var(--color-danger)]">
            Dars yuklashda xato yuz berdi.
          </CardContent>
        </Card>
      ) : lesson ? (
        <>
          <p className="section-label mb-2">
            {lesson.course_title} · {lesson.module_title}
          </p>

          <div className="relative overflow-hidden rounded-3xl border border-[var(--color-primary)]/15 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-surface-elevated)] to-transparent p-5 lg:p-6">
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{lesson.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-background)]/70 px-3 py-1 text-xs font-medium">
                <Clock className="h-3.5 w-3.5" />
                {lesson.estimated_minutes} daqiqa
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
                <Sparkles className="h-3.5 w-3.5" />
                +{lesson.xp_reward} XP
              </span>
              {lesson.cefr_level && (
                <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-[var(--color-primary-foreground)]">
                  {lesson.cefr_level}
                </span>
              )}
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="mt-6"
          >
            <TabsList className="w-full overflow-x-auto md:w-auto">
              <TabsTrigger value="overview">Umumiy</TabsTrigger>
              <TabsTrigger value="words" icon={<BookOpen className="h-3.5 w-3.5" />} count={lesson.word_count}>
                So&apos;zlar
              </TabsTrigger>
              <TabsTrigger value="grammar" icon={<Brain className="h-3.5 w-3.5" />} count={lesson.grammar_topic_count}>
                Grammar
              </TabsTrigger>
              <TabsTrigger value="quiz" icon={<CircleCheck className="h-3.5 w-3.5" />} count={lesson.quiz_count}>
                Test
              </TabsTrigger>
              <TabsTrigger value="assignment" icon={<ClipboardCheck className="h-3.5 w-3.5" />} count={lesson.assignment_count}>
                Vazifa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <LessonOverview lesson={lesson} onJumpTab={setActiveTab} />
            </TabsContent>
            <TabsContent value="words">
              <LessonWords lessonId={lesson.id} />
            </TabsContent>
            <TabsContent value="grammar">
              <LessonGrammar lessonId={lesson.id} />
            </TabsContent>
            <TabsContent value="quiz">
              <LessonQuiz lessonId={lesson.id} />
            </TabsContent>
            <TabsContent value="assignment">
              <LessonAssignment lessonId={lesson.id} />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}

function LessonOverview({
  lesson,
  onJumpTab,
}: {
  lesson: import('@/lib/api/content').LessonDetail;
  onJumpTab: (t: TabValue) => void;
}) {
  return (
    <div className="space-y-4">
      {lesson.description && (
        <Card>
          <CardContent className="p-5 lg:p-6">
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)] lg:text-base">
              {lesson.description}
            </p>
          </CardContent>
        </Card>
      )}

      {lesson.content && (
        <Card>
          <CardContent className="p-5 lg:p-6">
            <h3 className="section-label mb-4">Dars matni</h3>
            <div className="space-y-1 text-sm leading-relaxed lg:text-base">
              {renderMarkdown(lesson.content)}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ContentBlock icon={BookOpen} label="So'zlar" count={lesson.word_count} accent="primary" onClick={() => onJumpTab('words')} />
        <ContentBlock icon={Brain} label="Grammar" count={lesson.grammar_topic_count} accent="purple" onClick={() => onJumpTab('grammar')} />
        <ContentBlock icon={CircleCheck} label="Testlar" count={lesson.quiz_count} accent="success" onClick={() => onJumpTab('quiz')} />
        <ContentBlock icon={ClipboardCheck} label="Vazifalar" count={lesson.assignment_count} accent="accent" onClick={() => onJumpTab('assignment')} />
      </div>

      <LessonCompleteButton lessonId={lesson.id} xpReward={lesson.xp_reward} />

      {lesson.next_lesson_id && (
        <Link href={`/lessons/${lesson.next_lesson_id}`} className="block">
          <Card className="transition-all hover:border-[var(--color-primary)]/40 hover:shadow-md active:scale-[0.99]">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Keyingi dars</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
                Davom etish
                <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}

const BLOCK_STYLES = {
  primary: { bg: 'bg-[var(--color-primary-soft)]', icon: 'text-[var(--color-primary)]' },
  purple: { bg: 'bg-purple-500/15', icon: 'text-purple-500' },
  success: { bg: 'bg-[var(--color-success)]/12', icon: 'text-[var(--color-success)]' },
  accent: { bg: 'bg-[var(--color-accent-soft)]', icon: 'text-[var(--color-accent)]' },
} as const;

function ContentBlock({
  icon: Icon,
  label,
  count,
  accent,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  accent: keyof typeof BLOCK_STYLES;
  onClick: () => void;
}) {
  const styles = BLOCK_STYLES[accent];
  return (
    <button type="button" onClick={onClick} disabled={count === 0} className="text-left">
      <Card
        className={cn(
          'h-full transition-all',
          count > 0
            ? 'cursor-pointer hover:border-[var(--color-primary)]/30 hover:shadow-sm active:scale-[0.99]'
            : 'cursor-not-allowed opacity-50',
        )}
      >
        <CardContent className="p-4 text-center">
          <div className={cn('mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl', styles.bg, styles.icon)}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold tabular-nums">{count}</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
        </CardContent>
      </Card>
    </button>
  );
}
