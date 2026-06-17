import { useQuery } from '@tanstack/react-query';
import { vocabularyApi } from '@/lib/api/vocabulary';

export function useLessonWords(lessonId: number | null) {
  return useQuery({
    queryKey: ['lesson-words', lessonId],
    queryFn: () => vocabularyApi.getLessonWords(lessonId!),
    enabled: lessonId !== null,
  });
}


import { grammarApi } from '@/lib/api/grammar';

export function useLessonGrammar(lessonId: number | null) {
  return useQuery({
    queryKey: ['lesson-grammar', lessonId],
    queryFn: () => grammarApi.getLessonGrammar(lessonId!),
    enabled: lessonId !== null,
  });
}


import { quizApi } from '@/lib/api/quiz';

export function useLessonQuizzes(lessonId: number | null) {
  return useQuery({
    queryKey: ['lesson-quizzes', lessonId],
    queryFn: () => quizApi.getLessonQuizzes(lessonId!),
    enabled: lessonId !== null,
  });
}


import { assignmentsApi } from '@/lib/api/assignments';

export function useLessonAssignments(lessonId: number | null) {
  return useQuery({
    queryKey: ['lesson-assignments', lessonId],
    queryFn: () => assignmentsApi.getLessonAssignments(lessonId!),
    enabled: lessonId !== null,
  });
}

export function useSubmission(submissionId: number | null) {
  return useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => assignmentsApi.getSubmission(submissionId!),
    enabled: submissionId !== null,
  });
}