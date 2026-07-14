import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookies = vi.hoisted(() => new Map<string, string>());

vi.mock('js-cookie', () => ({
  default: {
    get: (key: string) => cookies.get(key),
    set: (key: string, value: string) => {
      cookies.set(key, value);
    },
    remove: (key: string) => {
      cookies.delete(key);
    },
  },
}));

import { tokenStorage } from './tokens';

describe('tokenStorage', () => {
  beforeEach(() => {
    cookies.clear();
  });

  it('stores and retrieves access and refresh tokens', () => {
    tokenStorage.set('access-token', 'refresh-token');
    expect(tokenStorage.getAccess()).toBe('access-token');
    expect(tokenStorage.getRefresh()).toBe('refresh-token');
  });

  it('clears both tokens', () => {
    tokenStorage.set('access-token', 'refresh-token');
    tokenStorage.clear();
    expect(tokenStorage.getAccess()).toBeUndefined();
    expect(tokenStorage.getRefresh()).toBeUndefined();
  });
});
