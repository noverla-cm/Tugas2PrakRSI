import { api, toApiError } from '../lib/api';
import type { Role, User } from '../lib/types';

// Bentuk respons auth bisa berbeda antar implementasi; semua penyesuaian ada di file ini.
export function normalizeUser(raw: any): User {
  const u = raw?.user ?? raw ?? {};
  return {
    id: Number(u.id ?? u.userId),
    name: String(u.name ?? u.username ?? ''),
    email: String(u.email ?? ''),
    role: String(u.role ?? 'customer').toLowerCase() as Role,
  };
}

export function extractToken(body: any): string | undefined {
  return (
    body?.token ?? body?.accessToken ?? body?.access_token ??
    body?.data?.token ?? body?.data?.accessToken ?? body?.data?.access_token
  );
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  async register(input: RegisterInput) {
    try {
      const { data } = await api.post('/auth/register', input);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async login(email: string, password: string): Promise<string> {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = extractToken(data);
      if (!token) throw new Error('Respons login dari backend tidak berisi token.');
      return token;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async me(): Promise<User> {
    try {
      const { data } = await api.get('/auth/me');
      return normalizeUser(data?.data ?? data);
    } catch (e) {
      throw toApiError(e);
    }
  },
};
