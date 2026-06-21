import { api } from '../api';

export type SubmissionStatus =
  | 'submitted'
  | 'in_review'
  | 'graded'
  | 'returned';

export interface SubmissionListItem {
  id: number;
  student: number;
  student_name: string;
  student_username: string;
  assignment: number;
  assignment_title: string;
  status: SubmissionStatus;
  status_display: string;
  score: number | null;
  word_count: number;
  submitted_at: string | null;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================
// Teacher Dashboard
// ============================================================

export type ActivityStatus = 'active' | 'recent' | 'inactive' | 'never';

export interface TeacherDashboardStats {
  total_students: number;
  active_today: number;
  active_this_week: number;
  pending_submissions: number;
  average_streak: number;
}

export interface TeacherStudentItem {
  id: number;
  username: string;
  full_name: string;
  cefr_level: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active: string | null;
  activity_status: ActivityStatus;
  pending_submissions: number;
  completed_lessons: number;
}

export interface TeacherDashboardResponse {
  stats: TeacherDashboardStats;
  students: TeacherStudentItem[];
}

export const teacherApi = {
  getSubmissions: async (params?: {
    status?: SubmissionStatus;
    page?: number;
  }): Promise<PaginatedResponse<SubmissionListItem>> => {
    const { data } = await api.get<PaginatedResponse<SubmissionListItem>>(
      '/exercises/teacher/submissions/',
      { params },
    );
    return data;
  },

  getDashboard: async (params?: {
    level?: string;
    status?: 'active' | 'inactive' | 'pending';
  }): Promise<TeacherDashboardResponse> => {
    const { data } = await api.get<TeacherDashboardResponse>(
      '/progress/teacher/dashboard/',
      { params },
    );
    return data;
  },
};

import type {
  SubmissionDetail,
  FeedbackComment,
} from './assignments';

export interface GradePayload {
  score: number;
  feedback: string;
  strengths?: string;
  improvements?: string;
  status?: 'graded' | 'returned';
}

export const teacherSubmissionApi = {
  getSubmission: async (id: number): Promise<SubmissionDetail> => {
    const { data } = await api.get<SubmissionDetail>(
      `/exercises/submissions/${id}/`,
    );
    return data;
  },

  claim: async (id: number): Promise<SubmissionDetail> => {
    const { data } = await api.post<SubmissionDetail>(
      `/exercises/submissions/${id}/claim/`,
    );
    return data;
  },

  grade: async (
    id: number,
    payload: GradePayload,
  ): Promise<SubmissionDetail> => {
    const { data } = await api.post<SubmissionDetail>(
      `/exercises/submissions/${id}/grade/`,
      payload,
    );
    return data;
  },

  addComment: async (
    submissionId: number,
    payload: {
      quoted_text: string;
      start_offset?: number;
      end_offset?: number;
      comment: string;
      category?: string;
    },
  ): Promise<FeedbackComment> => {
    const { data } = await api.post<FeedbackComment>(
      `/exercises/submissions/${submissionId}/comments/`,
      payload,
    );
    return data;
  },
};