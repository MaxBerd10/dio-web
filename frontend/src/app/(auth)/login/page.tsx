'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await authApi.login(data);
      tokenStorage.set(res.access, res.refresh);
      setUser(res.user);
      router.push('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      setServerError(
        axiosErr.response?.data?.detail ||
          "Email yoki parol noto'g'ri. Qayta urinib ko'ring.",
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tizimga kirish</CardTitle>
        <CardDescription>
          Hisobingizga kirish uchun email va parolingizni kiriting.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          {serverError && (
            <div className="rounded-md border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
              {serverError}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            {...register('email')}
            error={errors.email?.message}
          />
          <div>
            <Input
              label="Parol"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="mt-1.5 text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:underline"
              >
                Parolni unutdingizmi?
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button type="submit" fullWidth loading={isSubmitting}>
            {isSubmitting ? 'Kirilmoqda...' : 'Kirish'}
          </Button>
          <p className="text-sm text-center text-[var(--color-muted-foreground)]">
            Hisobingiz yo'qmi?{' '}
            <Link
              href="/register"
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              Ro'yxatdan o'tish
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

