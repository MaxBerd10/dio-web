import { api } from '../api';

export interface Word {
  id: number;
  word: string;
  translation_uz: string;
  translation_ru: string;
  part_of_speech: string;
  part_of_speech_display: string;
  pronunciation: string;
  audio_url: string;
  example_sentence: string;
  example_translation: string;
  cefr_level: string;
  image: string | null;
  notes: string;
  frequency_rank: number | null;
}

export interface LessonWord {
  id: number;
  word: Word;
  order: number;
  is_key_word: boolean;
}

export const vocabularyApi = {
  getLessonWords: async (lessonId: number): Promise<LessonWord[]> => {
    const { data } = await api.get<LessonWord[]>(
      `/vocabulary/lessons/${lessonId}/words/`,
    );
    return data;
  },
};



// ============================================================
// SRS — Spaced Repetition System
// ============================================================

export interface ReviewQueueItem {
  progress_id: number;
  word: Word;
  status: 'new' | 'learning' | 'review' | 'mastered';
  repetitions: number;
  is_new: boolean;
}

export interface ReviewQueue {
  count: number;
  due_count: number;
  new_count: number;
  items: ReviewQueueItem[];
}

export interface VocabularyStats {
  total: number;
  new: number;
  learning: number;
  review: number;
  mastered: number;
  due_now: number;
}

export interface ReviewSubmitPayload {
  word_id: number;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface ReviewSubmitResponse {
  status: string;
  repetitions: number;
  next_review_at: string | null;
  easiness_factor: number;
  interval_days: number;
  xp_earned?: number;
  streak?: { current_streak: number; longest_streak: number };
}

// Mavjud vocabularyApi'ga qo'sh:
export const vocabularySRSApi = {
  getQueue: async (limit?: number): Promise<ReviewQueue> => {
    const { data } = await api.get<ReviewQueue>('/vocabulary/review/queue/', {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  submitReview: async (
    payload: ReviewSubmitPayload,
  ): Promise<ReviewSubmitResponse> => {
    const { data } = await api.post<ReviewSubmitResponse>(
      '/vocabulary/review/submit/',
      payload,
    );
    return data;
  },

  getStats: async (): Promise<VocabularyStats> => {
    const { data } = await api.get<VocabularyStats>('/vocabulary/stats/');
    return data;
  },
};