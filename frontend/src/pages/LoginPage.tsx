import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../lib/api';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useToast();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    const e: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Masukkan alamat email yang valid.';
    if (!password) e.password = 'Password wajib diisi.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      await login(email.trim(), password);
      push('success', 'Berhasil masuk.');
      navigate(from, { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.fieldErrors ?? {});
      setFormError(apiErr.status === 401 ? 'Email atau password salah.' : apiErr.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth">
      <h1>Masuk</h1>
      <p className="lead">Masuk untuk mengelola warung atau melihat akun Anda.</p>
      {formError && <div className="alert" role="alert">{formError}</div>}
      <form className="form" onSubmit={onSubmit} noValidate>
        <label className={`field${errors.email ? ' field-error' : ''}`}>
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <em>{errors.email}</em>}
        </label>
        <label className={`field${errors.password ? ' field-error' : ''}`}>
          <span>Password</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <em>{errors.password}</em>}
        </label>
        <button className="btn btn-solid btn-block" disabled={busy}>{busy ? 'Memproses…' : 'Masuk'}</button>
      </form>
      <p className="alt">Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>
    </section>
  );
}
