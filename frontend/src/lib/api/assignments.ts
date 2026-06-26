import { api } from '../api';

export interface FeedbackComment {
  id: number;
  author: number;
  author_name: string;
  quoted_text: string;
  start_offset: number | null;
  end_offset: number | null;
  comment: string;
  category: string;
  category_display: string;
  created_at: string;
}

export interface UserSubmissionSummary {
  id: number;
  status: 'draft' | 'submitted' | 'in_review' | 'graded' | 'returned';
  score: number | null;
  submitted_at: string | null;
}

export interface Assignment {
  id: number;
  title: string;
  assignment_type: string;
  assignment_type_display: string;
  instructions: string;
  rubric: string;
  image_url: string | null;
  min_words: number | null;
  max_words: number | null;
  time_limit_minutes: number | null;
  xp_reward: number;
  order: number;
  user_submission: UserSubmissionSummary | null;
}

export interface SubmissionDetail {
  id: number;
  assignment: number;
  assignment_title: string;
  student: number;
  student_name: string;
  student_username: string;
  content: string;
  audio_file: string | null;
  attachment: string | null;
  word_count: number;
  status: 'draft' | 'submitted' | 'in_review' | 'graded' | 'returned';
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewer: number | null;
  reviewer_name: string | null;
  score: number | null;
  feedback: string;
  strengths: string;
  improvements: string;
  comments: FeedbackComment[];
  created_at: string;
  updated_at: string;
}

export const assignmentsApi = {
  getLessonAssignments: async (lessonId: number): Promise<Assignment[]> => {
    const { data } = await api.get<Assignment[]>(
      `/exercises/lessons/${lessonId}/assignments/`,
    );
    return data;
  },

  getAssignment: async (id: number): Promise<Assignment> => {
    const { data } = await api.get<Assignment>(`/exercises/assignments/${id}/`);
    return data;
  },

  getSubmission: async (id: number): Promise<SubmissionDetail> => {
    const { data } = await api.get<SubmissionDetail>(
      `/exercises/submissions/${id}/`,
    );
    return data;
  },

  submitAssignment: async (
    assignmentId: number,
    payload: { content: string },
  ): Promise<SubmissionDetail> => {
    const { data } = await api.post<SubmissionDetail>(
      `/exercises/assignments/${assignmentId}/submit/`,
      payload,
    );
    return data;
  },
};