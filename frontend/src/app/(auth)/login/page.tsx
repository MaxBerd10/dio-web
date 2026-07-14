'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { LogIn } from 'lucide-react';

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
      const res = await authApi.login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
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
    <Card className="glass-card border-[var(--color-primary)]/10">
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl btn-gradient">
          <LogIn className="h-6 w-6" />
        </div>
        <CardTitle>Tizimga kirish</CardTitle>
        <CardDescription>
          Hisobingizga kirish uchun email va parolingizni kiriting.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4 pt-0">
          {serverError && (
            <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8 px-4 py-3 text-sm text-[var(--color-danger)]">
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
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                Parolni unutdingizmi?
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button type="submit" fullWidth loading={isSubmitting} size="lg">
            {isSubmitting ? 'Kirilmoqda...' : 'Kirish'}
          </Button>
          <p className="text-sm text-center text-[var(--color-muted-foreground)]">
            Hisobingiz yo&apos;qmi?{' '}
            <Link
              href="/register"
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
