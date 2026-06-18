import { useQuery } from '@tanstack/react-query';
import { vocabularySRSApi } from '@/lib/api/vocabulary';

export function useReviewQueue(limit: number = 20) {
  return useQuery({
    queryKey: ['review-queue', limit],
    queryFn: () => vocabularySRSApi.getQueue(limit),
    staleTime: 0, // har safar yangi
  });
}

export function useVocabularyStats() {
  return useQuery({
    queryKey: ['vocabulary-stats'],
    queryFn: vocabularySRSApi.getStats,
  });
}