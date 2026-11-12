import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../lib/api';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((cur) => ({ ...cur, [k]: '' }));
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Nama minimal 3 karakter.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Masukkan alamat email yang valid.';
    if (form.password.length < 8) e.password = 'Password minimal 8 karakter.';
    else if (form.password.length > 72) e.password = 'Password maksimal 72 karakter.';
    if (form.confirm !== form.password) e.confirm = 'Konfirmasi password tidak sama.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      push('success', 'Registrasi berhasil. Silakan masuk.');
      navigate('/login', { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors((cur) => ({ ...cur, ...apiErr.fieldErrors }));
      setFormError(apiErr.status === 409 ? 'Email sudah terdaftar.' : apiErr.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth">
      <h1>Buat akun</h1>
      <p className="lead">Akun baru berperan sebagai pembeli (customer) yang dapat melihat warung.</p>
      {formError && <div className="alert" role="alert">{formError}</div>}
      <form className="form" onSubmit={onSubmit} noValidate>
        <label className={`field${errors.name ? ' field-error' : ''}`}>
          <span>Nama lengkap</span>
          <input value={form.name} onChange={set('name')} autoComplete="name" />
          {errors.name && <em>{errors.name}</em>}
        </label>
        <label className={`field${errors.email ? ' field-error' : ''}`}>
          <span>Email</span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          {errors.email && <em>{errors.email}</em>}
        </label>
        <div className="two">
          <label className={`field${errors.password ? ' field-error' : ''}`}>
            <span>Password</span>
            <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
            {errors.password && <em>{errors.password}</em>}
          </label>
          <label className={`field${errors.confirm ? ' field-error' : ''}`}>
            <span>Ulangi password</span>
            <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
            {errors.confirm && <em>{errors.confirm}</em>}
          </label>
        </div>
        <button className="btn btn-solid btn-block" disabled={busy}>{busy ? 'Memproses…' : 'Daftar'}</button>
      </form>
      <p className="alt">Sudah punya akun? <Link to="/login">Masuk</Link></p>
    </section>
  );
}
