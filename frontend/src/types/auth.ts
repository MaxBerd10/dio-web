export type UserRole = 'student' | 'teacher' | 'admin';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LearningGoal = 'general' | 'ielts' | 'cefr' | 'both';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar: string | null;
  bio: string;
  phone: string;
  role: UserRole;
  cefr_level: CEFRLevel | '';
  learning_goal: LearningGoal;
  target_ielts_score: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  full_name: string;
  password: string;
  password_confirm: string;
  role?: UserRole;
  cefr_level?: CEFRLevel;
  learning_goal?: LearningGoal;
  target_ielts_score?: number;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}