import { api } from '../api';

export interface GrammarExample {
  id: number;
  sentence: string;
  translation: string;
  highlight: string;
  is_incorrect: boolean;
  audio_url: string;
  order: number;
}

export interface GrammarRule {
  id: number;
  title: string;
  formula: string;
  explanation: string;
  explanation_uz: string;
  tips: string;
  common_mistakes: string;
  order: number;
  examples: GrammarExample[];
}

export interface GrammarTopic {
  id: number;
  title: string;
  slug: string;
  category: string;
  category_display: string;
  cefr_level: string;
  short_description: string;
  description: string;
  icon: string;
  order: number;
  rules: GrammarRule[];
}

export interface LessonGrammarItem {
  id: number;
  topic: GrammarTopic;
  order: number;
  is_main_topic: boolean;
}

export const grammarApi = {
  getLessonGrammar: async (lessonId: number): Promise<LessonGrammarItem[]> => {
    const { data } = await api.get<LessonGrammarItem[]>(
      `/grammar/lessons/${lessonId}/`,
    );
    return data;
  },
  getTopic: async (id: number): Promise<GrammarTopic> => {
    const { data } = await api.get<GrammarTopic>(`/grammar/topics/${id}/`);
    return data;
  },
};