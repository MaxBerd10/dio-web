import { api } from '../api';

export interface QuizChoice {
  id: number;
  text: string;
  match_pair: string;
  order: number;
  is_correct?: boolean;
}

export interface QuizQuestion {
  id: number;
  question_type:
    | 'multiple_choice'
    | 'multiple_select'
    | 'true_false'
    | 'fill_blank'
    | 'matching'
    | 'short_answer';
  question_type_display: string;
  text: string;
  image: string | null;
  audio_url: string;
  correct_answer_text?: string;
  explanation?: string;
  points: number;
  order: number;
  choices: QuizChoice[];
}

export interface QuizSummary {
  id: number;
  title: string;
  description: string;
  passing_score: number;
  time_limit_seconds: number | null;
  max_attempts: number;
  xp_reward: number;
  order: number;
  question_count: number;
  user_attempts: number;
  best_score: number | null;
}

export interface QuizStartResponse {
  attempt_id: number;
  quiz: {
    id: number;
    title: string;
    description: string;
    passing_score: number;
    time_limit_seconds: number | null;
    max_attempts: number;
    xp_reward: number;
    shuffle_questions: boolean;
    question_count: number;
  };
  questions: QuizQuestion[];
  started_at: string;
  time_limit_seconds: number | null;
}

export interface AnswerResult {
  response_id: number;
  is_correct: boolean;
  points_earned: number;
}

export interface QuizSubmitResponse {
  attempt_id: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  xp_earned: number;
  time_spent_seconds: number;
  show_correct_answers: boolean;
  results: Array<{
    question: QuizQuestion;
    user_answer: {
      is_correct: boolean;
      points_earned: number;
      selected_choice_ids: number[];
      text_answer: string;
    };
  }> | null;
}

export const quizApi = {
  getLessonQuizzes: async (lessonId: number): Promise<QuizSummary[]> => {
    const { data } = await api.get<QuizSummary[]>(
      `/exercises/lessons/${lessonId}/quizzes/`,
    );
    return data;
  },

  startQuiz: async (quizId: number): Promise<QuizStartResponse> => {
    const { data } = await api.post<QuizStartResponse>(
      `/exercises/quizzes/${quizId}/start/`,
    );
    return data;
  },

  submitAnswer: async (
    attemptId: number,
    payload: {
      question_id: number;
      selected_choice_ids?: number[];
      text_answer?: string;
      time_spent_seconds?: number;
    },
  ): Promise<AnswerResult> => {
    const { data } = await api.post<AnswerResult>(
      `/exercises/attempts/${attemptId}/answer/`,
      payload,
    );
    return data;
  },

  submitQuiz: async (attemptId: number): Promise<QuizSubmitResponse> => {
    const { data } = await api.post<QuizSubmitResponse>(
      `/exercises/attempts/${attemptId}/submit/`,
    );
    return data;
  },
};