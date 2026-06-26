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

export interface HangmanWordResponse {
  id: number;
  word: string;
  translation_uz: string;
  length: number;
}

export interface HangmanResultResponse {
  xp_earned: number;
  won: boolean;
}

export interface ScrambleWordResponse {
  id: number;
  scrambled: string[];
  translation_uz: string;
  length: number;
}

export interface ScrambleResultResponse {
  xp_earned: number;
  won: boolean;
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

  getHangmanWord: async (params?: { cefr_level?: string }): Promise<HangmanWordResponse> => {
    const { data } = await api.get<HangmanWordResponse>('/vocabulary/game/hangman/word/', { params });
    return data;
  },

  submitHangmanResult: async (payload: {
    word_id: number;
    won: boolean;
    wrong_guesses: number;
    time_spent_seconds: number;
  }): Promise<HangmanResultResponse> => {
    const { data } = await api.post<HangmanResultResponse>('/vocabulary/game/hangman/result/', payload);
    return data;
  },

  getScrambleWord: async (params?: { cefr_level?: string }): Promise<ScrambleWordResponse> => {
    const { data } = await api.get<ScrambleWordResponse>('/vocabulary/game/scramble/word/', { params });
    return data;
  },

  submitScrambleResult: async (payload: {
    word_id: number;
    answer: string;
    hints_used: number;
    time_spent_seconds: number;
  }): Promise<ScrambleResultResponse> => {
    const { data } = await api.post<ScrambleResultResponse>('/vocabulary/game/scramble/result/', payload);
    return data;
  },
};