import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler, tokenStore } from '../lib/api';
import type { Role, Stall, User } from '../lib/types';
import { authService, type RegisterInput } from '../services/authService';
import { useToast } from '../components/Toast';

// Mode uji: tampilkan tombol Ubah/Hapus untuk semua yang login supaya 403 backend bisa dibuktikan.
export const PERMISSION_TEST_MODE = import.meta.env.VITE_PERMISSION_TEST_MODE === 'true';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  canCreate: boolean;
  canEdit: (stall: Stall) => boolean;
  canDelete: boolean;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tokenStore.get());
  const { push } = useToast();

  // Pulihkan sesi saat halaman dibuka ulang: validasi token lewat GET /auth/me
  useEffect(() => {
    if (!tokenStore.get()) return;
    authService
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      push('info', 'Sesi Anda berakhir. Silakan login kembali.');
    });
    return () => setUnauthorizedHandler(null);
  }, [push]);

  const login = useCallback(async (email: string, password: string) => {
    const token = await authService.login(email, password);
    tokenStore.set(token);
    try {
      setUser(await authService.me());
    } catch (e) {
      tokenStore.clear();
      throw e;
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await authService.register(input);
  }, []);

  const logout = useCallback(() => {
    // JWT bersifat stateless: sesi diakhiri dengan menghapus token di sisi klien.
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(() => {
    const role = user?.role;
    return {
      user,
      loading,
      login,
      register,
      logout,
      canCreate: role === 'admin' || role === 'owner',
      canEdit: (s) =>
        !!user && (PERMISSION_TEST_MODE || role === 'admin' || (role === 'owner' && s.ownerId === user.id)),
      canDelete: !!user && (PERMISSION_TEST_MODE || role === 'admin'),
      hasRole: (...roles) => !!role && roles.includes(role),
    };
  }, [user, loading, login, register, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
