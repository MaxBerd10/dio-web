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
  // ── Student & Teacher ──────────────────────────────
  {
    label: 'Bosh sahifa',
    href: '/dashboard',
    icon: LayoutDashboard,
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
    label: "O'quvchilar",
    href: '/teacher/students',
    icon: Users,
    forRoles: ['teacher', 'admin'],
    mobileShow: false,
  },
  {
    label: 'Materiallar',
    href: '/tracks',
    icon: GraduationCap,
    forRoles: ['teacher', 'admin'],
    mobileShow: false,
  },
];