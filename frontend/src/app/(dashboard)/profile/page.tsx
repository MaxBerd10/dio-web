'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Save, Mail, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { authApi } from '@/lib/auth-api';
import { useAuthStore } from '@/store/auth';
import { useDashboard } from '@/lib/hooks/use-dashboard';
import type { LearningGoal } from '@/types/auth';
import { cn } from '@/lib/utils';

const CEFR_OPTIONS = [
  { value: 'A1', label: 'A1 — Beginner' },
  { value: 'A2', label: 'A2 — Elementary' },
  { value: 'B1', label: 'B1 — Intermediate' },
  { value: 'B2', label: 'B2 — Upper-Intermediate' },
  { value: 'C1', label: 'C1 — Advanced' },
  { value: 'C2', label: 'C2 — Proficient' },
];

const GOAL_OPTIONS = [
  { value: 'general', label: '🗣️ General English' },
  { value: 'cefr', label: '📚 CEFR' },
  { value: 'ielts', label: '🎯 IELTS' },
];

const ROLE_LABELS: Record<string, string> = {
  student: "O'quvchi",
  teacher: "O'qituvchi",
  admin: 'Admin',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const { data: dashboard } = useDashboard();
  const isStudent = user?.role === 'student';

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [cefrLevel, setCefrLevel] = useState(user?.cefr_level || '');
  const [learningGoal, setLearningGoal] = useState<LearningGoal>(user?.learning_goal || 'general');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initial = (fullName || username || '?').charAt(0).toUpperCase();

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = { full_name: fullName, username, phone, bio };
      if (isStudent) {
        payload.learning_goal = learningGoal;
        if (learningGoal === 'cefr') payload.cefr_level = cefrLevel;
      }
      const updated = await authApi.updateMe(payload);
      setUser(updated);
      setMessage({ type: 'success', text: 'Profil yangilandi.' });
    } catch {
      setMessage({ type: 'error', text: "Saqlashda xato yuz berdi, qaytadan urinib ko'ring." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 lg:p-8 animate-fadeIn">
      {/* Hero */}
      <Card className="overflow-hidden border-[var(--color-primary)]/15 bg-gradient-to-br from-[var(--color-primary-soft)] via-transparent to-[var(--color-accent-soft)]">
        <CardContent className="flex items-center gap-4 p-5 lg:p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl btn-gradient text-2xl font-bold shadow-lg">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight lg:text-2xl">
              {fullName || username}
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {ROLE_LABELS[user.role] || user.role} · {user.email}
            </p>
            {isStudent && dashboard && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--color-background)]/70 px-2.5 py-0.5 text-xs font-semibold">
                  Lv {dashboard.xp?.level ?? 1}
                </span>
                <span className="rounded-full bg-[var(--color-background)]/70 px-2.5 py-0.5 text-xs font-semibold">
                  {dashboard.xp?.total_xp ?? 0} XP
                </span>
                <span className="rounded-full bg-[var(--color-background)]/70 px-2.5 py-0.5 text-xs font-semibold">
                  🔥 {dashboard.streak?.current_streak ?? 0} kun
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-soft)]">
            <UserIcon className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <CardTitle>Profil ma&apos;lumotlari</CardTitle>
          <CardDescription>
            Shaxsiy ma&apos;lumotlaringizni shu yerda tahrirlashingiz mumkin.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {message && (
            <div
              className={cn(
                'rounded-xl px-4 py-3 text-sm',
                message.type === 'success'
                  ? 'border border-[var(--color-success)]/30 bg-[var(--color-success)]/8 text-[var(--color-success)]'
                  : 'border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8 text-[var(--color-danger)]',
              )}
            >
              {message.text}
            </div>
          )}

          <Input label="To'liq ism" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} hint="Faqat harflar, raqamlar va _" />

          <div className="relative">
            <Input label="Email" value={user.email} disabled hint="Email o'zgartirilmaydi" />
            <Mail className="absolute right-3 top-[2.6rem] h-4 w-4 text-[var(--color-muted-foreground)]" />
          </div>

          <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />

          <div>
            <label className="mb-1.5 block text-sm font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-input)] px-4 py-3 text-base outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--color-ring)]"
              placeholder="O'zingiz haqingizda qisqacha..."
            />
          </div>

          {isStudent && (
            <>
              <Select
                label="Maqsadingiz / Track"
                options={GOAL_OPTIONS}
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value as LearningGoal)}
              />
              {learningGoal === 'cefr' && (
                <Select
                  label="CEFR darajangiz"
                  options={CEFR_OPTIONS}
                  placeholder="Tanlang"
                  value={cefrLevel}
                  onChange={(e) => setCefrLevel(e.target.value)}
                />
              )}
            </>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={handleSave} loading={isSaving} disabled={isSaving} size="lg">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <Shield className="h-4 w-4" />
            Hisob boshqaruvi
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-danger)]/8 py-3.5 text-sm font-semibold text-[var(--color-danger)] transition-all active:scale-[0.98] hover:bg-[var(--color-danger)]/12"
          >
            <LogOut className="h-4 w-4" />
            Tizimdan chiqish
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
