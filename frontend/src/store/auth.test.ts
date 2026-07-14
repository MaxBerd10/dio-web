import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockMe = vi.fn();
const mockLogout = vi.fn();

vi.mock('@/lib/auth-api', () => ({
  authApi: {
    me: () => mockMe(),
    logout: (refresh: string) => mockLogout(refresh),
  },
}));

const mockGetAccess = vi.fn();
const mockGetRefresh = vi.fn();
const mockClear = vi.fn();

vi.mock('@/lib/tokens', () => ({
  tokenStorage: {
    getAccess: () => mockGetAccess(),
    getRefresh: () => mockGetRefresh(),
    clear: () => mockClear(),
  },
}));

import { useAuthStore } from './auth';

const sampleUser = {
  id: 1,
  email: 'user@test.com',
  username: 'user1',
  full_name: 'Test User',
  avatar: null,
  bio: '',
  phone: '',
  role: 'student' as const,
  cefr_level: '' as const,
  learning_goal: 'general' as const,
  target_ielts_score: null,
  is_verified: false,
  created_at: '2026-01-01T00:00:00Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isHydrated: true,
    });
    vi.clearAllMocks();
  });

  it('fetchMe sets user when token exists', async () => {
    mockGetAccess.mockReturnValue('access-token');
    mockMe.mockResolvedValue(sampleUser);

    await useAuthStore.getState().fetchMe();

    expect(mockMe).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().user).toEqual(sampleUser);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('fetchMe clears user when no token', async () => {
    mockGetAccess.mockReturnValue(undefined);

    await useAuthStore.getState().fetchMe();

    expect(mockMe).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('fetchMe clears tokens on API failure', async () => {
    mockGetAccess.mockReturnValue('access-token');
    mockMe.mockRejectedValue(new Error('Unauthorized'));

    await useAuthStore.getState().fetchMe();

    expect(mockClear).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('logout clears session even if API fails', async () => {
    useAuthStore.setState({ user: sampleUser });
    mockGetRefresh.mockReturnValue('refresh-token');
    mockLogout.mockRejectedValue(new Error('Network error'));

    await useAuthStore.getState().logout();

    expect(mockLogout).toHaveBeenCalledWith('refresh-token');
    expect(mockClear).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
