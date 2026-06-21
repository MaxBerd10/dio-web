import { useQuery } from '@tanstack/react-query';
import {
  teacherApi,
  teacherSubmissionApi,
  type SubmissionStatus,
} from '@/lib/api/teacher';

export function useTeacherSubmissions(status?: SubmissionStatus) {
  return useQuery({
    queryKey: ['teacher-submissions', status],
    queryFn: () => teacherApi.getSubmissions({ status }),
  });
}

export function useSubmissionForReview(submissionId: number | null) {
  return useQuery({
    queryKey: ['teacher-submission', submissionId],
    queryFn: () => teacherSubmissionApi.getSubmission(submissionId!),
    enabled: submissionId !== null,
  });
}

export function useTeacherDashboard(params?: {
  level?: string;
  status?: 'active' | 'inactive' | 'pending';
}) {
  return useQuery({
    queryKey: ['teacher-dashboard', params?.level, params?.status],
    queryFn: () => teacherApi.getDashboard(params),
  });
}