import { api } from '../api';

export interface WordMatchQuestion {
  id: number;
  word: string;
  translation_uz: string;
  options: string[];
}

export interface WordMatchWordsResponse {
  questions: WordMatchQuestion[];
}

export interface WordMatchResultResponse {
  xp_earned: number;
  correct_count: number;
  total_count: number;
}

export const gameApi = {
  getWordMatchWords: async (params?: {
    count?: number;
    cefr_level?: string;
  }): Promise<WordMatchWordsResponse> => {
    const { data } = await api.get<WordMatchWordsResponse>('/vocabulary/game/words/', { params });
    return data;
  },

  submitWordMatchResult: async (payload: {
    correct_count: number;
    total_count: number;
    time_spent_seconds: number;
  }): Promise<WordMatchResultResponse> => {
    const { data } = await api.post<WordMatchResultResponse>('/vocabulary/game/result/', payload);
    return data;
  },
};