import { useEffect, useState } from 'react';
import { ErrorState, Loading } from '../components/States';
import type { User } from '../lib/types';
import { authService } from '../services/authService';

const ACCESS: Record<string, string[]> = {
  admin: ['Melihat daftar dan detail warung', 'Menambah warung', 'Mengubah semua warung', 'Menghapus warung'],
  owner: ['Melihat daftar dan detail warung', 'Menambah warung', 'Mengubah warung miliknya sendiri'],
  customer: ['Melihat daftar dan detail warung'],
};

export default function ProfilePage() {
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  // Data diambil langsung dari GET /auth/me
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authService
      .me()
      .then((u) => !cancelled && setMe(u))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [reload]);

  if (loading) return <Loading label="Memuat informasi akun…" />;
  if (error) return <ErrorState message={error} onRetry={() => setReload((n) => n + 1)} />;
  if (!me) return null;

  return (
    <section className="auth">
      <h1>Akun saya</h1>
      <dl className="facts facts-col">
        <div><dt>Nama</dt><dd>{me.name}</dd></div>
        <div><dt>Email</dt><dd>{me.email}</dd></div>
        <div><dt>ID pengguna</dt><dd>{me.id}</dd></div>
        <div><dt>Peran</dt><dd><span className={`role role-${me.role}`}>{me.role}</span></dd></div>
      </dl>
      <h2>Hak akses peran ini</h2>
      <ul className="access">
        {(ACCESS[me.role] ?? []).map((a) => <li key={a}>{a}</li>)}
      </ul>
    </section>
  );
}
