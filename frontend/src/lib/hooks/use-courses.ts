import { useQuery } from '@tanstack/react-query';
import { contentApi, type TrackCode } from '@/lib/api/content';

export function useCourses(params: {
  track?: TrackCode;
  cefr_level?: string;
  ielts_skill?: string;
}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => contentApi.getCourses(params),
    enabled: !!params.track,
  });
}

export function useCourse(id: number | null) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => contentApi.getCourse(id!),
    enabled: id !== null,
  });
}

export function useModule(id: number | null) {
  return useQuery({
    queryKey: ['module', id],
    queryFn: () => contentApi.getModule(id!),
    enabled: id !== null,
  });
}

export function useLesson(id: number | null) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => contentApi.getLesson(id!),
    enabled: id !== null,
  });
}