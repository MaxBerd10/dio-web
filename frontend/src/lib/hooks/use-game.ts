import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gameApi } from '@/lib/api/game';

export function useStartWordMatch() {
  return useMutation({
    mutationFn: (params?: { count?: number; cefr_level?: string }) =>
      gameApi.getWordMatchWords(params),
  });
}

export function useSubmitWordMatchResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { correct_count: number; total_count: number; time_spent_seconds: number }) =>
      gameApi.submitWordMatchResult(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useStartHangman() {
  return useMutation({
    mutationFn: (params?: { cefr_level?: string }) => gameApi.getHangmanWord(params),
  });
}

export function useSubmitHangmanResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      word_id: number;
      won: boolean;
      wrong_guesses: number;
      time_spent_seconds: number;
    }) => gameApi.submitHangmanResult(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}