import { api } from './api';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types/auth';

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register/', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login/', payload);
    return data;
  },

  logout: async (refresh: string): Promise<void> => {
    await api.post('/auth/logout/', { refresh });
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me/');
    return data;
  },
};