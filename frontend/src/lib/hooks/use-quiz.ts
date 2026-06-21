import { useQuery } from '@tanstack/react-query';
import { quizApi } from '@/lib/api/quiz';

export function useAllQuizzes(params?: {
  track?: string;
  level?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['all-quizzes', params?.track, params?.level, params?.search],
    queryFn: () => quizApi.getAllQuizzes(params),
  });
}