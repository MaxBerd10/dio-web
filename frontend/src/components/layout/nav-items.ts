import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Brain,
  Trophy,
  ClipboardCheck,
  BarChart2,
  Award,
  FileText,
  Inbox,
  Users,
  Gamepad2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  forRoles?: Array<'student' | 'teacher' | 'admin'>;
  mobileShow?: boolean;
  dividerBefore?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  // ── Bosh sahifa (rolega qarab manzili boshqacha) ────
  {
    label: 'Bosh sahifa',
    href: '/dashboard',
    icon: LayoutDashboard,
    forRoles: ['student'],
    mobileShow: true,
  },
  {
    label: 'Bosh sahifa',
    href: '/teacher/students',
    icon: LayoutDashboard,
    forRoles: ['teacher', 'admin'],
    mobileShow: true,
  },
  // ── Student only ───────────────────────────────────
  {
    label: 'Darslar',
    href: '/tracks',
    icon: GraduationCap,
    forRoles: ['student'],
    mobileShow: true,
  },
  {
    label: "Lug'at",
    href: '/vocabulary',
    icon: BookOpen,
    forRoles: ['student'],
    mobileShow: true,
  },
  {
    label: 'Testlar',
    href: '/quizzes',
    icon: ClipboardCheck,
    forRoles: ['student'],
    mobileShow: false,
  },
  {
    label: "O'yinlar",
    href: '/games',
    icon: Gamepad2,
    forRoles: ['student'],
    mobileShow: true,
  },
  {
    label: 'Grammar',
    href: '/grammar',
    icon: Brain,
    forRoles: ['student'],
    mobileShow: false,
  },
  {
    label: 'Natijalarim',
    href: '/my-progress',
    icon: BarChart2,
    forRoles: ['student'],
    mobileShow: false,
    dividerBefore: true,
  },
  {
    label: 'Yutuqlar',
    href: '/achievements',
    icon: Award,
    forRoles: ['student'],
    mobileShow: false,
  },
  {
    label: 'Sertifikatlarim',
    href: '/certificates',
    icon: Award,
    forRoles: ['student'],
    mobileShow: false,
  },
  {
    label: 'Reytinglar',
    href: '/leaderboard',
    icon: Trophy,
    forRoles: ['student'],
    mobileShow: false,
  },
  // ── Teacher & Admin only ───────────────────────────
  {
    label: 'Vazifalar',
    href: '/teacher/submissions',
    icon: Inbox,
    forRoles: ['teacher', 'admin'],
    mobileShow: true,
  },
  {
    label: 'Materiallar',
    href: '/tracks',
    icon: GraduationCap,
    forRoles: ['teacher', 'admin'],
    mobileShow: false,
  },
];