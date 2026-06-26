import { api } from '../api';

export interface Certificate {
  id: number;
  course_title: string;
  course_icon: string;
  certificate_number: string;
  issued_at: string;
}

export const certificateApi = {
  getMyCertificates: async (): Promise<Certificate[]> => {
    const { data } = await api.get<Certificate[]>('/progress/certificates/');
    return data;
  },

  downloadCertificate: async (id: number): Promise<Blob> => {
    const { data } = await api.get(`/progress/certificates/${id}/download/`, {
      responseType: 'blob',
    });
    return data;
  },
};