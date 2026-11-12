import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../lib/types';
import { ForbiddenView, Loading } from './States';
import { useToast } from './Toast';

export function ProtectedRoute({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { push } = useToast();
  const mustLogin = !loading && !user;

  useEffect(() => {
    if (mustLogin) push('info', 'Halaman ini hanya untuk pengguna yang sudah login.');
  }, [mustLogin, push]);

  if (loading) return <Loading label="Memeriksa sesi…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <ForbiddenView />;
  return <>{children}</>;
}
