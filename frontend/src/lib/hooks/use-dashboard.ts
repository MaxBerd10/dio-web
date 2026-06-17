import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/lib/api/progress';
import { contentApi } from '@/lib/api/content';
import { useAuthStore } from '@/store/auth';

export function useDashboard() {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: progressApi.getDashboard,
    enabled: isStudent, // faqat student uchun
  });
}

export function useStreak() {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';

  return useQuery({
    queryKey: ['streak'],
    queryFn: progressApi.getStreak,
    enabled: isStudent,
  });
}

export function useXP() {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';

  return useQuery({
    queryKey: ['xp'],
    queryFn: progressApi.getXP,
    enabled: isStudent,
  });
}

export function useLeaderboard(period: 'all' | 'weekly' = 'all') {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => progressApi.getLeaderboard(period),
  });
}

export function useTracks() {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: contentApi.getTracks,
  });
}