import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Brain,
  Trophy,
  ClipboardCheck,
  BarChart2,
  Award,
  Inbox,
  Gamepad2,
  Medal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  forRoles?: UserRole[];
  /** Pastki tab bar (mobil) */
  mobilePrimary?: boolean;
  /** "Yana" menyusida (mobil) */
  mobileMore?: boolean;
  dividerBefore?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  // ── Student ────────────────────────────────────────
  {
    label: 'Bosh',
    href: '/dashboard',
    icon: LayoutDashboard,
    forRoles: ['student'],
    mobilePrimary: true,
  },
  {
    label: 'Darslar',
    href: '/tracks',
    icon: GraduationCap,
    forRoles: ['student'],
    mobilePrimary: true,
  },
  {
    label: "Lug'at",
    href: '/vocabulary',
    icon: BookOpen,
    forRoles: ['student'],
    mobilePrimary: true,
  },
  {
    label: "O'yinlar",
    href: '/games',
    icon: Gamepad2,
    forRoles: ['student'],
    mobilePrimary: true,
  },
  {
    label: 'Testlar',
    href: '/quizzes',
    icon: ClipboardCheck,
    forRoles: ['student'],
    mobileMore: true,
  },
  {
    label: 'Grammar',
    href: '/grammar',
    icon: Brain,
    forRoles: ['student'],
    mobileMore: true,
  },
  {
    label: 'Natijalarim',
    href: '/my-progress',
    icon: BarChart2,
    forRoles: ['student'],
    mobileMore: true,
    dividerBefore: true,
  },
  {
    label: 'Yutuqlar',
    href: '/achievements',
    icon: Medal,
    forRoles: ['student'],
    mobileMore: true,
  },
  {
    label: 'Sertifikatlar',
    href: '/certificates',
    icon: Award,
    forRoles: ['student'],
    mobileMore: true,
  },
  {
    label: 'Reyting',
    href: '/leaderboard',
    icon: Trophy,
    forRoles: ['student'],
    mobileMore: true,
  },
  // ── Teacher & Admin ────────────────────────────────
  {
    label: 'Bosh',
    href: '/teacher/students',
    icon: LayoutDashboard,
    forRoles: ['teacher', 'admin'],
    mobilePrimary: true,
  },
  {
    label: 'Vazifalar',
    href: '/teacher/submissions',
    icon: Inbox,
    forRoles: ['teacher', 'admin'],
    mobilePrimary: true,
  },
  {
    label: 'Materiallar',
    href: '/tracks',
    icon: GraduationCap,
    forRoles: ['teacher', 'admin'],
    mobilePrimary: true,
  },
];

export function navItemsForRole(role: UserRole) {
  return NAV_ITEMS.filter((item) => !item.forRoles || item.forRoles.includes(role));
}

export function primaryMobileNav(role: UserRole) {
  return navItemsForRole(role).filter((item) => item.mobilePrimary);
}

export function moreMobileNav(role: UserRole) {
  return navItemsForRole(role).filter((item) => item.mobileMore);
}

export function desktopNav(role: UserRole) {
  return navItemsForRole(role).filter((item) => !item.mobileMore || item.mobilePrimary);
}
