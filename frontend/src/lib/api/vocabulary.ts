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