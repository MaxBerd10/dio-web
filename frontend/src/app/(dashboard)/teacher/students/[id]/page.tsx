'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  CircleDot,
  Search,
  Sparkles,
  ClipboardCheck,
  FileText,
} from 'lucide-react';

import { useTeacherStudentDetail } from '@/lib/hooks/use-teacher';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
  StudentDetailCourse,
  StudentDetailLesson,
} from '@/lib/api/teacher';

const TRACK_LABELS: Record<string, string> = {
  general: 'General English',
  cefr: 'CEFR',
  ielts: 'IELTS',
};

function lessonMatchesSearch(lesson: StudentDetailLesson, q: string): boolean {
  if (lesson.title.toLowerCase().includes(q)) return true;
  if (lesson.quizzes.some((quiz) => quiz.title.toLowerCase().includes(q))) return true;
  if (lesson.assignments.some((a) => a.title.toLowerCase().includes(q))) return true;
  return false;
}

function StatusIcon({ status }: { status: StudentDetailLesson['status'] }) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0" />;
  }
  if (status === 'in_progress') {
    return <CircleDot className="h-4 w-4 text-amber-500 shrink-0" />;
  }
  return <Circle className="h-4 w-4 text-[var(--color-muted-foreground)]/40 shrink-0" />;
}

function LessonRow({ lesson }: { lesson: StudentDetailLesson }) {
  const hasExtras = lesson.quizzes.length > 0 || lesson.assignments.length > 0;

  return (
    <div className="py-2.5 px-3 rounded-lg hover:bg-[var(--color-muted)]/50 transition-colors">
      <div className="flex items-center gap-2.5">
        <StatusIcon status={lesson.status} />
        <span
          className={cn(
            'text-sm flex-1',
            lesson.status === 'completed'
              ? 'text-[var(--color-foreground)]'
              : 'text-[var(--color-muted-foreground)]',
          )}
        >
          {lesson.title}
        </span>
        {lesson.xp_earned > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-[var(--color-accent)] shrink-0">
            <Sparkles className="h-3 w-3" />
            {lesson.xp_earned}
          </span>
        )}
      </div>

      {hasExtras && (
        <div className="mt-1.5 ml-6 flex flex-wrap gap-1.5">
          {lesson.quizzes.map((quiz) => (
            <span
              key={`quiz-${quiz.id}`}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                quiz.attempted
                  ? quiz.passed
                    ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                    : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                  : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
              )}
            >
              <ClipboardCheck className="h-3 w-3" />
              {quiz.title}
              {quiz.attempted && ` · ${quiz.best_score}%`}
            </span>
          ))}
          {lesson.assignments.map((a) => (
            <span
              key={`assign-${a.id}`}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                a.status === 'graded'
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : a.status
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
              )}
            >
              <FileText className="h-3 w-3" />
              {a.title} · {a.status_display}
              {a.score !== null && ` · ${a.score}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleSection({
  module,
  forceOpen,
}: {
  module: StudentDetailCourse['modules'][number];
  forceOpen: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isOpen = open || forceOpen;

  const completedCount = module.lessons.filter((l) => l.status === 'completed').length;

  return (
    <div className="border-t border-[var(--color-border)] first:border-t-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 py-2.5 px-1 text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0" />
        )}
        <span className="text-sm font-medium flex-1">{module.title}</span>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {completedCount}/{module.lessons.length}
        </span>
      </button>
      {isOpen && (
        <div className="pb-1.5">
          {module.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  forceOpenModuleIds,
  forceOpenCourse,
}: {
  course: StudentDetailCourse;
  forceOpenModuleIds: Set<number>;
  forceOpenCourse: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isOpen = open || forceOpenCourse;

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.status === 'completed').length,
    0,
  );

  return (
    <Card>
      <CardContent className="p-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-3 text-left"
        >
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-[var(--color-muted-foreground)] shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 text-[var(--color-muted-foreground)] shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{course.title}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {TRACK_LABELS[course.track] ?? course.track} · {completedLessons}/{totalLessons} dars
            </p>
          </div>
          <div className="h-2 w-20 rounded-full bg-[var(--color-muted)] overflow-hidden shrink-0">
            <div
              className="h-full rounded-full bg-[var(--color-primary)]"
              style={{
                width: `${totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0}%`,
              }}
            />
          </div>
        </button>

        {isOpen && (
          <div className="mt-2">
            {course.modules.map((module) => (
              <ModuleSection
                key={module.id}
                module={module}
                forceOpen={forceOpenModuleIds.has(module.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeacherStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  const studentId = params?.id ? Number(params.id) : null;
  const { data, isLoading } = useTeacherStudentDetail(studentId);

  const filtered = useMemo(() => {
    if (!data) return { courses: [], openModuleIds: new Set<number>(), openCourseIds: new Set<number>() };

    const q = search.trim().toLowerCase();
    if (!q) {
      return { courses: data.courses, openModuleIds: new Set<number>(), openCourseIds: new Set<number>() };
    }

    const openModuleIds = new Set<number>();
    const openCourseIds = new Set<number>();

    const courses = data.courses
      .map((course) => {
        const modules = course.modules
          .map((module) => {
            const lessons = module.lessons.filter((l) => lessonMatchesSearch(l, q));
            if (lessons.length > 0) {
              openModuleIds.add(module.id);
            }
            return { ...module, lessons };
          })
          .filter((m) => m.lessons.length > 0);

        if (modules.length > 0) {
          openCourseIds.add(course.id);
        }

        return { ...course, modules };
      })
      .filter((c) => c.modules.length > 0);

    return { courses, openModuleIds, openCourseIds };
  }, [data, search]);

  if (user && user.role !== 'teacher' && user.role !== 'admin') {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="text-[var(--color-danger)]">
          Bu sahifa faqat o'qituvchilar uchun.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push('/teacher/students')}
        className="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Studentlar
      </button>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : !data ? (
        <p className="text-[var(--color-muted-foreground)]">Student topilmadi.</p>
      ) : (
        <>
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">
              {data.student.full_name || data.student.username}
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              @{data.student.username}
              {data.student.cefr_level && ` · ${data.student.cefr_level}`}
            </p>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mavzu qidirish... (masalan: Part 1, Writing Task 2)"
              className="w-full rounded-lg border border-[var(--color-border)] bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </div>

          {filtered.courses.length === 0 ? (
            <p className="text-center py-10 text-sm text-[var(--color-muted-foreground)]">
              Hech narsa topilmadi.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  forceOpenModuleIds={filtered.openModuleIds}
                  forceOpenCourse={filtered.openCourseIds.has(course.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}