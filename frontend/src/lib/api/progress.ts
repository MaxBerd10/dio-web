import { api } from '../api';

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_started_date: string | null;
  freeze_count: number;
  updated_at: string;
}

export interface UserXP {
  total_xp: number;
  level: number;
  daily_xp: number;
  weekly_xp: number;
  next_level_xp: number;
  progress_to_next_level: number;
  last_xp_earned_at: string | null;
  updated_at: string;
}

export interface DashboardSummary {
  streak: Streak;
  xp: UserXP;
  words_total: number;
  words_due_now: number;
  words_mastered: number;
  lessons_completed: number;
  lessons_in_progress: number;
  quizzes_passed: number;
  achievements_earned: number;
  achievements_total: number;
  daily_goal_xp: number;
  daily_goal_met: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  full_name: string;
  avatar: string | null;
  level: number;
  xp: number;
  current_streak: number;
}

export interface Leaderboard {
  period: 'all' | 'weekly';
  entries: LeaderboardEntry[];
}

export const progressApi = {
  getDashboard: async (): Promise<DashboardSummary> => {
    const { data } = await api.get<DashboardSummary>('/progress/dashboard/');
    return data;
  },

  getStreak: async (): Promise<Streak> => {
    const { data } = await api.get<Streak>('/progress/streak/');
    return data;
  },

  getXP: async (): Promise<UserXP> => {
    const { data } = await api.get<UserXP>('/progress/xp/');
    return data;
  },

  getLeaderboard: async (period: 'all' | 'weekly' = 'all'): Promise<Leaderboard> => {
    const { data } = await api.get<Leaderboard>('/progress/leaderboard/', {
      params: { period },
    });
    return data;
  },

  startLesson: async (lessonId: number) => {
    const { data } = await api.post(`/progress/lessons/${lessonId}/`, {
      action: 'start',
    });
    return data;
  },

  completeLesson: async (lessonId: number) => {
    const { data } = await api.post(`/progress/lessons/${lessonId}/`, {
      action: 'complete',
    });
    return data;
  },
};