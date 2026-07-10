import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/auth.store';

describe('auth store', () => {
  it('stores and clears a session', () => {
    useAuthStore.getState().setSession({ token: 'jwt-token', refreshToken: 'refresh-token' });

    expect(useAuthStore.getState().token).toBe('jwt-token');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-token');

    useAuthStore.getState().clearSession(true);

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isSessionExpired).toBe(true);
  });
});
