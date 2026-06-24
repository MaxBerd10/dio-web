'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Save } from 'lucide-react';

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
  const isStudent = user?.role === 'student';

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [cefrLevel, setCefrLevel] = useState(user?.cefr_level || '');
  const [learningGoal, setLearningGoal] = useState(user?.learning_goal || 'general');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initial = (fullName || username || '?').charAt(0).toUpperCase();

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = {
        full_name: fullName,
        username,
        phone,
        bio,
      };
      if (isStudent) {
        payload.learning_goal = learningGoal;
        if (learningGoal === 'cefr') {
          payload.cefr_level = cefrLevel;
        }
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
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-2xl font-bold text-[var(--color-primary)]">
          {initial}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{fullName || username}</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {ROLE_LABELS[user.role] || user.role} · {user.email}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Profil ma'lumotlari
          </CardTitle>
          <CardDescription>
            Shaxsiy ma'lumotlaringizni shu yerda tahrirlashingiz mumkin.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <div
              className={
                message.type === 'success'
                  ? 'rounded-md border border-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-2 text-sm text-[var(--color-success)]'
                  : 'rounded-md border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]'
              }
            >
              {message.text}
            </div>
          )}

          <Input
            label="To'liq ism"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            hint="Faqat harflar, raqamlar va _"
          />

          <Input
            label="Email"
            value={user.email}
            disabled
            hint="Email o'zgartirilmaydi"
          />

          <Input
            label="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
          />

          <div>
            <label className="text-sm font-medium mb-1.5 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              placeholder="O'zingiz haqingizda qisqacha..."
            />
          </div>

          {isStudent && (
            <>
              <Select
                label="Maqsadingiz / Track"
                options={GOAL_OPTIONS}
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
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
          <Button onClick={handleSave} loading={isSaving} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardContent className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Tizimdan chiqish
          </button>
        </CardContent>
      </Card>
    </div>
  );
}