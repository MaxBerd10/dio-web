import { useQuery } from '@tanstack/react-query';
import { teacherApi, type SubmissionStatus } from '@/lib/api/teacher';

export function useTeacherSubmissions(status?: SubmissionStatus) {
  return useQuery({
    queryKey: ['teacher-submissions', status],
    queryFn: () => teacherApi.getSubmissions({ status }),
  });
}


import { teacherSubmissionApi } from '@/lib/api/teacher';

export function useSubmissionForReview(submissionId: number | null) {
  return useQuery({
    queryKey: ['teacher-submission', submissionId],
    queryFn: () => teacherSubmissionApi.getSubmission(submissionId!),
    enabled: submissionId !== null,
  });
}