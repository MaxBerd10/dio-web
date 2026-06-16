import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Brain,
  Trophy,
  ClipboardCheck,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  forRoles?: Array<'student' | 'teacher' | 'admin'>;
  mobileShow?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Bosh sahifa',
    href: '/dashboard',
    icon: LayoutDashboard,
    mobileShow: true,
  },
  {
    label: 'Darslar',
    href: '/tracks',
    icon: GraduationCap,
    mobileShow: true,
  },
  {
    label: 'Lug\'at',
    href: '/vocabulary',
    icon: BookOpen,
    mobileShow: true,
  },
  {
    label: 'Grammar',
    href: '/grammar',
    icon: Brain,
  },
  {
    label: 'Reytinglar',
    href: '/leaderboard',
    icon: Trophy,
    mobileShow: true,
  },
  {
    label: 'Vazifalar',
    href: '/teacher/submissions',
    icon: ClipboardCheck,
    forRoles: ['teacher', 'admin'],
    mobileShow: true,
  },
];