import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Loading({ label = 'Memuat data…' }: { label?: string }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="state">
      <div className="state-plate" aria-hidden="true">Kosong</div>
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state-error" role="alert">
      <h3>Data gagal dimuat</h3>
      <p>{message}</p>
      {onRetry && <button className="btn" onClick={onRetry}>Coba lagi</button>}
    </div>
  );
}

export function ForbiddenView({ message }: { message?: string }) {
  return (
    <div className="state state-error" role="alert">
      <h3>403 – Akses ditolak</h3>
      <p>{message ?? 'Peran akun Anda tidak diizinkan membuka halaman ini.'}</p>
      <Link className="btn" to="/">Kembali ke daftar warung</Link>
    </div>
  );
}
