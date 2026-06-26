import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  assignment?: 'mine' | 'unassigned';
}) {
  return useQuery({
    queryKey: [
      'teacher-dashboard',
      params?.level,
      params?.status,
      params?.assignment,
    ],
    queryFn: () => teacherApi.getDashboard(params),
  });
}

export function useTeacherStudentDetail(studentId: number | null) {
  return useQuery({
    queryKey: ['teacher-student-detail', studentId],
    queryFn: () => teacherApi.getStudentDetail(studentId!),
    enabled: studentId !== null,
  });
}

export function useAssignStudentToMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: number) => teacherApi.assignStudentToMe(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
    },
  });
}


export function useDifficultTopics(limit?: number) {
  return useQuery({
    queryKey: ['teacher-difficult-topics', limit],
    queryFn: () => teacherApi.getDifficultTopics(limit),
  });
}