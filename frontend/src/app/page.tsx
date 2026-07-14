import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/landing-page';

export const metadata: Metadata = {
  title: 'English with Diyora — Ingliz tilini oson o\'rganing',
  description:
    'CEFR A1–C2, IELTS, SRS lug\'at, o\'yinlar va gamification. O\'zbek o\'quvchilar uchun zamonaviy ingliz tili platformasi.',
  openGraph: {
    title: 'English with Diyora',
    description: 'Ingliz tilini qiziqarli va samarali o\'rganing',
    type: 'website',
  },
};

export default function Home() {
  return <LandingPage />;
}
