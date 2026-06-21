'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Flame,
  ClipboardList,
  Activity,
  Search,
  Award,
  BookOpenCheck,
  ChevronRight,
} from 'lucide-react';

import { useTeacherDashboard } from '@/lib/hooks/use-teacher';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ActivityStatus, TeacherStudentItem } from '@/lib/api/teacher';

type StatusFilter = 'all' | 'active' | 'inactive' | 'pending';

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Hammasi' },
  { value: 'active', label: 'Faol' },
  { value: 'inactive', label: 'Nofaol' },
  { value: 'pending', label: 'Vazifa kutmoqda' },
];

const LEVELS = ['Hammasi', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const ACTIVITY_STYLES: Record<ActivityStatus, string> = {
  active: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  recent: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  inactive: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
  never: 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
};

const ACTIVITY_LABELS: Record<ActivityStatus, string> = {
  active: 'Bugun faol',
  recent: 'Shu hafta faol',
  inactive: 'Nofaol',
  never: 'Hali boshlamagan',
};

// Progress foiziga qarab rang — past% qizil/sariq, yuqori% yashil
function progressColor(pct: number): string {
  if (pct >= 70) return 'bg-[var(--color-success)]';
  if (pct >= 35) return 'bg-amber-500';
  if (pct > 0) return 'bg-orange-500';
  return 'bg-[var(--color-muted-foreground)]/30';
}

function formatLastActive(dateStr: string | null): string {
  if (!dateStr) return "Hali faollik yo'q";
  const date = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.floor(
    (today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return 'Bugun';
  if (diffDays === 1) return 'Kecha';
  if (diffDays < 7) return `${diffDays} kun oldin`;
  return new Date(dateStr).toLocaleDateString('uz-UZ');
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-full bg-[var(--color-primary)]/10 p-2.5">
          <Icon className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {label}
          </p>
          <p className="text-xl font-bold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentRow({ student }: { student: TeacherStudentItem }) {
  const initial = (student.full_name || student.username)
    .charAt(0)
    .toUpperCase();

  return (
    <Link href={`/teacher/students/${student.id}`} className="block">
      <Card className="transition-all hover:shadow-md hover:border-[var(--color-primary)]/30 active:scale-[0.99]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-base font-semibold text-[var(--color-primary)]">
              {initial}
            </div>

            {/* Ism va username */}
            <div className="min-w-[140px] flex-1">
              <p className="font-semibold leading-tight">{student.full_name}</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                @{student.username}
                {student.cefr_level && ` · ${student.cefr_level}`}
              </p>
            </div>

            {/* XP / Level */}
            <div className="flex items-center gap-1.5 text-sm">
              <Award className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="font-medium">Lv{student.level}</span>
              <span className="text-[var(--color-muted-foreground)]">
                · {student.xp} XP
              </span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 text-sm">
              <Flame
                className={cn(
                  'h-4 w-4',
                  student.current_streak > 0
                    ? 'text-orange-500'
                    : 'text-[var(--color-muted-foreground)]',
                )}
              />
              <span className="font-medium">{student.current_streak}</span>
            </div>

            {/* Oxirgi faollik */}
            <div className="min-w-[90px] text-xs text-[var(--color-muted-foreground)]">
              {formatLastActive(student.last_active)}
            </div>

            {/* Activity badge */}
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                ACTIVITY_STYLES[student.activity_status],
              )}
            >
              {ACTIVITY_LABELS[student.activity_status]}
            </span>

            {/* Kutilayotgan vazifa */}
            {student.pending_submissions > 0 && (
              <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                {student.pending_submissions} vazifa kutmoqda
              </span>
            )}

            <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] ml-auto shrink-0" />
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-[var(--color-muted)] overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  progressColor(student.lesson_progress_pct),
                )}
                style={{ width: `${student.lesson_progress_pct}%` }}
              />
            </div>
            <span className="text-xs text-[var(--color-muted-foreground)] shrink-0 flex items-center gap-1">
              <BookOpenCheck className="h-3.5 w-3.5" />
              {student.completed_lessons} dars · {student.lesson_progress_pct}%
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function TeacherStudentsPage() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [levelFilter, setLevelFilter] = useState('Hammasi');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useTeacherDashboard({
    level: levelFilter === 'Hammasi' ? undefined : levelFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  if (user && user.role !== 'teacher' && user.role !== 'admin') {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="text-[var(--color-danger)]">
          Bu sahifa faqat o'qituvchilar uchun.
        </p>
      </div>
    );
  }

  const students = (data?.students ?? []).filter((s) =>
    search
      ? s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.username.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-[var(--color-primary)]" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Studentlar
          </h1>
        </div>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          Barcha o'quvchilarning faolligi va progressini kuzating.
        </p>
      </div>

      {/* Stat kartochkalari */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Users}
            label="Jami studentlar"
            value={data?.stats.total_students ?? 0}
          />
          <StatCard
            icon={Activity}
            label="Bugun faol"
            value={data?.stats.active_today ?? 0}
          />
          <StatCard
            icon={ClipboardList}
            label="Vazifa kutmoqda"
            value={data?.stats.pending_submissions ?? 0}
          />
          <StatCard
            icon={Flame}
            label="O'rtacha streak"
            value={data?.stats.average_streak ?? 0}
          />
        </div>
      )}

      {/* Qidiruv */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki username bo'yicha qidirish..."
          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
        />
      </div>

      {/* Status filtri */}
      <div className="flex gap-2 overflow-x-auto mb-3 pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              statusFilter === f.value
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Level filtri */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors',
              levelFilter === lvl
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]',
            )}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Studentlar ro'yxati */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-muted-foreground)]">
          Hech qanday student topilmadi.
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((s) => (
            <StudentRow key={s.id} student={s} />
          ))}
        </div>
      )}
    </div>
  );
}