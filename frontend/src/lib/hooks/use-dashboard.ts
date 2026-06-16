import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/lib/api/progress';
import { contentApi } from '@/lib/api/content';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: progressApi.getDashboard,
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: progressApi.getStreak,
  });
}

export function useXP() {
  return useQuery({
    queryKey: ['xp'],
    queryFn: progressApi.getXP,
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