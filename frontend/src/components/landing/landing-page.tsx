import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Flame,
  Gamepad2,
  GraduationCap,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { LandingAuthRedirect } from '@/components/landing/landing-auth-redirect';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: GraduationCap,
    title: '3 ta yo\'nalish',
    desc: 'General English, CEFR (A1–C2) va IELTS tayyorgarligi.',
    accent: 'text-[var(--color-primary)]',
    bg: 'bg-[var(--color-primary-soft)]',
  },
  {
    icon: BookOpen,
    title: 'SRS lug\'at',
    desc: 'Spaced repetition bilan so\'zlarni uzoq muddat eslab qoling.',
    accent: 'text-blue-500',
    bg: 'bg-blue-500/12',
  },
  {
    icon: Gamepad2,
    title: 'O\'yinlar',
    desc: 'Word Match, Hangman, Scramble — o\'ynab XP yig\'ing.',
    accent: 'text-pink-500',
    bg: 'bg-pink-500/12',
  },
  {
    icon: Brain,
    title: 'Grammar',
    desc: '17+ mavzu, qoidalar va misollar bilan.',
    accent: 'text-purple-500',
    bg: 'bg-purple-500/12',
  },
  {
    icon: Flame,
    title: 'Streak & XP',
    desc: 'Kunlik maqsad, streak va daraja tizimi.',
    accent: 'text-[var(--color-streak)]',
    bg: 'bg-[var(--color-streak)]/12',
  },
  {
    icon: Trophy,
    title: 'Reyting & yutuqlar',
    desc: 'Haftalik leaderboard va achievement badge\'lar.',
    accent: 'text-[var(--color-accent)]',
    bg: 'bg-[var(--color-accent-soft)]',
  },
];

const STEPS = [
  { num: '1', title: 'Ro\'yxatdan o\'ting', desc: 'Track tanlang: General, CEFR yoki IELTS.' },
  { num: '2', title: 'Darslarni boshlang', desc: 'Mavzular, testlar va lug\'at bir joyda.' },
  { num: '3', title: 'Har kuni mashq qiling', desc: 'XP yig\'ing, streak saqlang, o\'sib boring.' },
];

export function LandingPage() {
  return (
    <div className="min-h-dvh">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass border-b border-[var(--color-border)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:h-16 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl btn-gradient text-sm font-bold shadow-md">
              D
            </span>
            <span className="font-bold tracking-tight">
              <span className="text-[var(--color-primary)]">Diyora</span>
            </span>
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Kirish</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Boshlash</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--color-primary-soft)] blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-[var(--color-accent-soft)] blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="section-label mb-3">🇺🇿 O&apos;zbek o&apos;quvchilar uchun</p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Ingliz tilini{' '}
              <span className="text-[var(--color-primary)]">qiziqarli</span> va{' '}
              <span className="text-[var(--color-primary)]">samarali</span> o&apos;rganing
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-muted-foreground)] lg:text-lg">
              CEFR A1 dan C2 gacha, IELTS tayyorgarligi, lug&apos;at SRS, o&apos;yinlar va
              gamification — hammasi bitta platformada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" fullWidth className="sm:w-auto">
                  Bepul boshlash
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" fullWidth className="sm:w-auto">
                  Hisobim bor
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { icon: Target, label: 'CEFR A1–C2' },
                { icon: Zap, label: 'IELTS' },
                { icon: Sparkles, label: 'XP & streak' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-semibold"
                >
                  <Icon className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Preview cards */}
          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-16">
            {[
              { emoji: '🔥', val: 'Streak', sub: 'Har kuni mashq' },
              { emoji: '📚', val: 'SRS', sub: 'Lug\'at takrorlash' },
              { emoji: '🎮', val: 'O\'yinlar', sub: 'XP yig\'ish' },
            ].map((item) => (
              <div
                key={item.val}
                className="glass-card rounded-2xl p-5 text-center"
              >
                <div className="text-3xl">{item.emoji}</div>
                <p className="mt-2 font-bold">{item.val}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/50 px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="section-label text-center">Imkoniyatlar</p>
          <h2 className="mt-2 text-center text-2xl font-bold lg:text-3xl">
            Nima uchun Diyora?
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, accent, bg }) => (
              <div key={title} className="glass-card rounded-2xl p-5">
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted-foreground)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="section-label text-center">Qanday ishlaydi</p>
          <h2 className="mt-2 text-center text-2xl font-bold lg:text-3xl">
            3 qadamda boshlang
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl btn-gradient text-lg font-bold shadow-lg">
                  {step.num}
                </div>
                <h3 className="mt-4 font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 lg:px-8">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary-soft)] to-[var(--color-accent-soft)] p-8 text-center lg:p-12">
          <h2 className="text-2xl font-bold lg:text-3xl">Bugun boshlang 🚀</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--color-muted-foreground)] lg:text-base">
            Ro&apos;yxatdan o&apos;ting va birinchi darsingizni 2 daqiqada boshlang.
            Telefoningizga ilova sifatida ham o&apos;rnatishingiz mumkin.
          </p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg">
              Ro&apos;yxatdan o&apos;tish — bepul
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] px-4 py-8 text-center text-xs text-[var(--color-muted-foreground)] lg:px-8">
        <p>© 2026 English with Diyora · dio.max.co.uz</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/login" className="hover:text-[var(--color-primary)]">Kirish</Link>
          <Link href="/register" className="hover:text-[var(--color-primary)]">Ro&apos;yxatdan o&apos;tish</Link>
        </div>
      </footer>

      <InstallPrompt />
      <LandingAuthRedirect />
    </div>
  );
}
