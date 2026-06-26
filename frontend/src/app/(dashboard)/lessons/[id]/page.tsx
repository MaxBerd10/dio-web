'use client';

import { LessonQuiz } from '@/components/lesson/lesson-quiz';
import { LessonAssignment } from '@/components/lesson/lesson-assignment';
import { LessonCompleteButton } from '@/components/lesson/lesson-complete-button';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { renderMarkdown } from '@/lib/markdown';
import { LessonWords } from '@/components/lesson/lesson-words';
import { LessonGrammar } from '@/components/lesson/lesson-grammar';

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
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-foreground)] hover:text-[var(--color-primary)] mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Orqaga
      </button>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-danger)]">
            Dars yuklashda xato yuz berdi.
          </p>
        </div>
      ) : lesson ? (
        <>
          <p className="text-xs text-[var(--color-muted-foreground)] mb-2">
            {lesson.course_title} → {lesson.module_title}
          </p>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            {lesson.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)] mb-6 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lesson.estimated_minutes} daqiqa</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              <span>+{lesson.xp_reward} XP</span>
            </div>
            {lesson.cefr_level && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
                {lesson.cefr_level}
              </span>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="overview">Umumiy</TabsTrigger>
              <TabsTrigger
                value="words"
                icon={<BookOpen className="h-3.5 w-3.5" />}
                count={lesson.word_count}
              >
                So'zlar
              </TabsTrigger>
              <TabsTrigger
                value="grammar"
                icon={<Brain className="h-3.5 w-3.5" />}
                count={lesson.grammar_topic_count}
              >
                Grammar
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                icon={<CircleCheck className="h-3.5 w-3.5" />}
                count={lesson.quiz_count}
              >
                Test
              </TabsTrigger>
              <TabsTrigger
                value="assignment"
                icon={<ClipboardCheck className="h-3.5 w-3.5" />}
                count={lesson.assignment_count}
              >
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
      {/* Description */}
      {lesson.description && (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm md:text-base leading-relaxed text-[var(--color-muted-foreground)]">
              {lesson.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Content — markdown render */}
      {lesson.content && (
        <Card>
          <CardContent className="p-5 md:p-6">
            <h3 className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4">
              Dars matni
            </h3>
            <div className="text-sm md:text-base leading-relaxed space-y-1">
              {renderMarkdown(lesson.content)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ContentBlock
          icon={BookOpen}
          label="So'zlar"
          count={lesson.word_count}
          color="#3b82f6"
          onClick={() => onJumpTab('words')}
        />
        <ContentBlock
          icon={Brain}
          label="Grammar"
          count={lesson.grammar_topic_count}
          color="#8b5cf6"
          onClick={() => onJumpTab('grammar')}
        />
        <ContentBlock
          icon={CircleCheck}
          label="Testlar"
          count={lesson.quiz_count}
          color="#10b981"
          onClick={() => onJumpTab('quiz')}
        />
        <ContentBlock
          icon={ClipboardCheck}
          label="Vazifalar"
          count={lesson.assignment_count}
          color="#f59e0b"
          onClick={() => onJumpTab('assignment')}
        />
      </div>

      <LessonCompleteButton
        lessonId={lesson.id}
        xpReward={lesson.xp_reward}
      />

      {lesson.next_lesson_id && (
        <Link href={`/lessons/${lesson.next_lesson_id}`} className="block">
          <Card className="hover:border-[var(--color-primary)]/40 transition-all hover:shadow-md active:scale-[0.99]">
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
                Keyingi dars
              </span>
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

function ContentBlock({
  icon: Icon,
  label,
  count,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={count === 0}
      className="text-left"
    >
      <Card
        className={
          'transition-all ' +
          (count > 0
            ? 'hover:border-[var(--color-primary)] hover:shadow-sm cursor-pointer active:scale-[0.99]'
            : 'opacity-50 cursor-not-allowed')
        }
      >
        <CardContent className="p-3 md:p-4 text-center">
          <div
            className="h-9 w-9 mx-auto rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <p className="text-xl font-bold">{count}</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
        </CardContent>
      </Card>
    </button>
  );
}