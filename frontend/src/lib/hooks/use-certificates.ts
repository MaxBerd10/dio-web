import { useQuery } from '@tanstack/react-query';
import { certificateApi } from '@/lib/api/certificates';

export function useMyCertificates() {
  return useQuery({
    queryKey: ['my-certificates'],
    queryFn: certificateApi.getMyCertificates,
  });
}