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
  total_lessons: number;
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
  lesson_progress_pct: number;
  is_unassigned: boolean;
}

export interface TeacherDashboardResponse {
  stats: TeacherDashboardStats;
  students: TeacherStudentItem[];
}

// ============================================================
// Teacher — Student Detail
// ============================================================

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudentDetailQuiz {
  id: number;
  title: string;
  attempted: boolean;
  best_score: number | null;
  passed: boolean;
}

export interface StudentDetailAssignment {
  id: number;
  title: string;
  status: SubmissionStatus | null;
  status_display: string;
  score: number | null;
}

export interface StudentDetailLesson {
  id: number;
  title: string;
  lesson_type: string;
  status: LessonStatus;
  completion_percentage: number;
  xp_earned: number;
  quizzes: StudentDetailQuiz[];
  assignments: StudentDetailAssignment[];
}

export interface StudentDetailModule {
  id: number;
  title: string;
  lessons: StudentDetailLesson[];
}

export interface StudentDetailCourse {
  id: number;
  title: string;
  track: 'general' | 'cefr' | 'ielts';
  modules: StudentDetailModule[];
}

export interface TeacherStudentDetailResponse {
  student: {
    id: number;
    username: string;
    full_name: string;
    cefr_level: string;
  };
  courses: StudentDetailCourse[];
}

// ============================================================
// Teacher — Difficult Topics
// ============================================================

export interface DifficultTopicItem {
  question_id: number;
  question_text: string;
  quiz_title: string;
  lesson_title: string;
  total_attempts: number;
  wrong_count: number;
  wrong_rate: number;
}

export interface DifficultTopicsResponse {
  topics: DifficultTopicItem[];
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
    assignment?: 'mine' | 'unassigned';
  }): Promise<TeacherDashboardResponse> => {
    const { data } = await api.get<TeacherDashboardResponse>(
      '/progress/teacher/dashboard/',
      { params },
    );
    return data;
  },

  getStudentDetail: async (
    studentId: number,
  ): Promise<TeacherStudentDetailResponse> => {
    const { data } = await api.get<TeacherStudentDetailResponse>(
      `/progress/teacher/students/${studentId}/`,
    );
    return data;
  },

  assignStudentToMe: async (
    studentId: number,
  ): Promise<{ detail: string; student_id: number }> => {
    const { data } = await api.post(
      `/progress/teacher/students/${studentId}/assign/`,
    );
    return data;
  },

  getDifficultTopics: async (limit?: number): Promise<DifficultTopicsResponse> => {
    const { data } = await api.get<DifficultTopicsResponse>('/progress/teacher/difficult-topics/', {
      params: { limit },
    });
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