'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';

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
import { tokenStorage } from '@/lib/tokens';
import { useAuthStore } from '@/store/auth';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/lib/validations/auth';

const ROLE_OPTIONS = [
  { value: 'student', label: "O'quvchi (Student)" },
  { value: 'teacher', label: "O'qituvchi (Teacher)" },
];

const CEFR_OPTIONS = [
  { value: 'A1', label: 'A1 — Beginner' },
  { value: 'A2', label: 'A2 — Elementary' },
  { value: 'B1', label: 'B1 — Intermediate' },
  { value: 'B2', label: 'B2 — Upper-Intermediate' },
  { value: 'C1', label: 'C1 — Advanced' },
  { value: 'C2', label: 'C2 — Proficient' },
];

const GOAL_OPTIONS = [
  { value: 'general', label: '🗣️  General English — kundalik amaliyot' },
  { value: 'cefr', label: '📚 CEFR — A1 dan C2 gacha darajalar' },
  { value: 'ielts', label: '🎯 IELTS — imtihon tayyorgarligi' },
];

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
      learning_goal: 'general',
    },
  });

  const selectedRole = watch('role');
  const selectedGoal = watch('learning_goal');
  const isStudent = selectedRole === 'student';
  const isCefrTrack = selectedGoal === 'cefr';

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      // Teacher uchun learning fields kerak emas
      // CEFR track bo'lmasa cefr_level ham kerak emas
      const payload = !isStudent
        ? {
            ...data,
            cefr_level: undefined,
            learning_goal: undefined,
          }
        : !isCefrTrack
          ? { ...data, cefr_level: undefined }
          : data;

      const res = await authApi.register(payload);
      tokenStorage.set(res.access, res.refresh);
      setUser(res.user);
      router.push('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<Record<string, string[] | string>>;
      const data = axiosErr.response?.data;
      if (data && typeof data === 'object') {
        // Backend field-level xatolarini bitta xabarga aylantirish
        const firstError = Object.entries(data)[0];
        if (firstError) {
          const [field, message] = firstError;
          const msgText = Array.isArray(message) ? message[0] : message;
          setServerError(`${field}: ${msgText}`);
          return;
        }
      }
      setServerError("Ro'yxatdan o'tishda xato. Qayta urinib ko'ring.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ro'yxatdan o'tish</CardTitle>
        <CardDescription>
          Yangi hisob yarating va o'rganishni boshlang.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          {serverError && (
            <div className="rounded-md border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
              {serverError}
            </div>
          )}

          <Select
            label="Kim sifatida ro'yxatdan o'tasiz?"
            options={ROLE_OPTIONS}
            required
            {...register('role')}
            error={errors.role?.message}
          />

          <Input
            label="To'liq ism"
            placeholder="Aliyev Ali"
            autoComplete="name"
            required
            {...register('full_name')}
            error={errors.full_name?.message}
          />

          <Input
            label="Username"
            placeholder="ali_uz"
            autoComplete="username"
            required
            {...register('username')}
            error={errors.username?.message}
            hint="Faqat harflar, raqamlar va _"
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Parol"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            {...register('password')}
            error={errors.password?.message}
            hint="Kamida 8 belgi, katta+kichik harf, raqam"
          />

          <Input
            label="Parolni tasdiqlang"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            {...register('password_confirm')}
            error={errors.password_confirm?.message}
          />

          {isStudent && (
            <>
              <Select
                label="Maqsadingiz / Track"
                options={GOAL_OPTIONS}
                required
                {...register('learning_goal')}
                error={errors.learning_goal?.message}
                hint="Keyin Dashboard'da boshqa track'larga ham qo'shilishingiz mumkin"
              />

              {isCefrTrack && (
                <Select
                  label="Joriy CEFR darajangiz"
                  options={CEFR_OPTIONS}
                  placeholder="Tanlang (ixtiyoriy)"
                  {...register('cefr_level')}
                  error={errors.cefr_level?.message}
                  hint="Bilmasangiz keyin placement test orqali aniqlaymiz"
                />
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button type="submit" fullWidth loading={isSubmitting}>
            {isSubmitting ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
          </Button>

          <p className="text-sm text-center text-[var(--color-muted-foreground)]">
            Hisobingiz bormi?{' '}
            <Link
              href="/login"
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              Kirish
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}