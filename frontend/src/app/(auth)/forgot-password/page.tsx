'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

import { authApi } from '@/lib/auth-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch {
      setError("Xato yuz berdi, qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 md:p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-[var(--color-success)] mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Tekshiring emailingizni</h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
              Agar <strong>{email}</strong> bilan hisob mavjud bo'lsa, parolni tiklash havolasi yuborildi. Havola 1 soat amal qiladi.
            </p>
            <Link href="/login">
              <Button fullWidth variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Login sahifasiga qaytish
              </Button>
            </Link>
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
            <Mail className="h-10 w-10 text-[var(--color-primary)] mx-auto mb-3" />
            <h1 className="text-xl font-bold">Parolni unutdingizmi?</h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1.5">
              Email manzilingizni kiriting, tiklash havolasini yuboramiz.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@misol.com"
              required
            />

            {error && (
              <p className="text-sm text-[var(--color-danger)]">{error}</p>
            )}

            <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
              {isLoading ? 'Yuborilmoqda...' : 'Havola yuborish'}
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-4 flex items-center justify-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Login sahifasiga qaytish
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}