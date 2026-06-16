import { api } from '../api';

export type TrackCode = 'general' | 'cefr' | 'ielts';

export interface Track {
  code: TrackCode;
  name: string;
  description: string;
  icon: string;
  course_count: number;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  track: TrackCode;
  cefr_level: string;
  ielts_skill: string;
  icon: string;
  color: string;
  cover_image: string | null;
  order: number;
  module_count: number;
  lesson_count: number;
}

export interface Module {
  id: number;
  title: string;
  slug: string;
  description: string;
  order: number;
  lesson_count: number;
}

export interface LessonSummary {
  id: number;
  title: string;
  slug: string;
  lesson_type: string;
  description: string;
  estimated_minutes: number;
  xp_reward: number;
  order: number;
  is_premium: boolean;
}

export interface ModuleWithLessons extends Module {
  lessons: LessonSummary[];
}

export interface CourseWithModules extends Omit<Course, 'module_count' | 'lesson_count'> {
  modules: Module[];
}

export interface LessonDetail {
  id: number;
  title: string;
  slug: string;
  lesson_type: string;
  description: string;
  content: string;
  video_url: string;
  audio_url: string;
  estimated_minutes: number;
  xp_reward: number;
  order: number;
  is_premium: boolean;
  track: TrackCode;
  cefr_level: string;
  module_title: string;
  course_title: string;
  word_count: number;
  grammar_topic_count: number;
  quiz_count: number;
  assignment_count: number;
}

export const contentApi = {
  getTracks: async (): Promise<Track[]> => {
    const { data } = await api.get<Track[]>('/content/tracks/');
    return data;
  },

  getCourses: async (params?: {
    track?: TrackCode;
    cefr_level?: string;
    ielts_skill?: string;
  }) => {
    const { data } = await api.get<{ results: Course[]; count: number }>(
      '/content/courses/',
      { params },
    );
    return data;
  },

  getCourse: async (id: number): Promise<CourseWithModules> => {
    const { data } = await api.get<CourseWithModules>(`/content/courses/${id}/`);
    return data;
  },

  getModule: async (id: number): Promise<ModuleWithLessons> => {
    const { data } = await api.get<ModuleWithLessons>(`/content/modules/${id}/`);
    return data;
  },

  getLesson: async (id: number): Promise<LessonDetail> => {
    const { data } = await api.get<LessonDetail>(`/content/lessons/${id}/`);
    return data;
  },
};