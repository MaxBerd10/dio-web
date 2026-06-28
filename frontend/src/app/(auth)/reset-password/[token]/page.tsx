'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, CheckCircle2 } from 'lucide-react';

import { authApi } from '@/lib/auth-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo\'lishi kerak.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.confirmPasswordReset({ token, new_password: password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Havola yaroqsiz yoki muddati o'tgan. Qaytadan so'rang.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 md:p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-[var(--color-success)] mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Parol yangilandi!</h1>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Login sahifasiga yo'naltirilmoqdasiz...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 md:p-8">
          <div className="text-center mb-6">
            <KeyRound className="h-10 w-10 text-[var(--color-primary)] mx-auto mb-3" />
            <h1 className="text-xl font-bold">Yangi parol o'rnatish</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Yangi parol"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 8 ta belgi"
              required
            />
            <Input
              label="Parolni takrorlang"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-[var(--color-danger)]">{error}</p>
            )}

            <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
              {isLoading ? 'Saqlanmoqda...' : 'Parolni yangilash'}
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-4 block text-center text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            Login sahifasiga qaytish
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}