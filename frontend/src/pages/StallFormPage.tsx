import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorState, ForbiddenView, Loading } from '../components/States';
import { useToast } from '../components/Toast';
import { PERMISSION_TEST_MODE, useAuth } from '../context/AuthContext';
import type { ApiError } from '../lib/api';
import type { StallInput } from '../lib/types';
import { stallService } from '../services/stallService';

const EMPTY: StallInput = { name: '', category: '', location: '', description: '' };

function validate(v: StallInput): Record<string, string> {
  const e: Record<string, string> = {};
  if (!v.name.trim()) e.name = 'Nama warung wajib diisi.';
  else if (v.name.trim().length < 3) e.name = 'Nama warung minimal 3 karakter.';
  else if (v.name.trim().length > 100) e.name = 'Nama warung maksimal 100 karakter.';
  if (v.category.length > 50) e.category = 'Kategori maksimal 50 karakter.';
  if (v.location.length > 100) e.location = 'Lokasi maksimal 100 karakter.';
  if (v.description.length > 1000) e.description = 'Deskripsi maksimal 1000 karakter.';
  return e;
}

export default function StallFormPage() {
  const { id } = useParams();
  const editing = id !== undefined;
  const stallId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();

  const [values, setValues] = useState<StallInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ message: string; status?: number } | null>(null);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState<{ message: string; status?: number } | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    stallService
      .get(stallId)
      .then((s) => {
        if (cancelled) return;
        if (user?.role === 'owner' && s.ownerId !== user.id && !PERMISSION_TEST_MODE) setBlocked(true);
        setValues({ name: s.name, category: s.category ?? '', location: s.location ?? '', description: s.description ?? '' });
      })
      .catch((e: ApiError) => !cancelled && setLoadError({ message: e.message, status: e.status }))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [editing, stallId, user]);

  const set = (k: keyof StallInput) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((cur) => ({ ...cur, [k]: '' }));
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    const local = validate(values);
    setErrors(local);
    if (Object.keys(local).length) return;

    setSaving(true);
    try {
      const saved = editing
        ? await stallService.update(stallId, values)
        : await stallService.create(values);
      push('success', editing ? 'Perubahan warung disimpan.' : 'Warung baru ditambahkan.');
      const target = saved.id || (editing ? stallId : 0);
      navigate(target ? `/stalls/${target}` : '/');
    } catch (e) {
      const err = e as ApiError;
      setErrors((cur) => ({ ...cur, ...err.fieldErrors }));
      setFormError({ message: err.message, status: err.status });
      if (err.status === 403) push('error', '403: backend menolak aksi ini untuk peran Anda.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Memuat data warung…" />;
  if (loadError) {
    return loadError.status === 404
      ? <ErrorState message="Warung yang akan diubah tidak ditemukan." />
      : <ErrorState message={loadError.message} />;
  }
  if (blocked) return <ForbiddenView message="Anda hanya dapat mengubah warung milik Anda sendiri." />;

  return (
    <section className="form-wrap">
      <Link to={editing ? `/stalls/${stallId}` : '/'} className="back">Batal</Link>
      <h1>{editing ? 'Ubah warung' : 'Tambah warung'}</h1>

      {formError && (
        <div className="alert" role="alert">
          {formError.status ? <strong>Error {formError.status}. </strong> : null}{formError.message}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="form">
        <Field label="Nama warung" error={errors.name}>
          <input value={values.name} onChange={set('name')} maxLength={100} aria-invalid={!!errors.name} />
        </Field>
        <div className="two">
          <Field label="Kategori" error={errors.category} hint="Contoh: Makanan berat, Minuman">
            <input value={values.category} onChange={set('category')} aria-invalid={!!errors.category} />
          </Field>
          <Field label="Lokasi" error={errors.location} hint="Contoh: Kantin Teknik, lantai 1">
            <input value={values.location} onChange={set('location')} aria-invalid={!!errors.location} />
          </Field>
        </div>
        <Field label="Deskripsi" error={errors.description}>
          <textarea rows={5} maxLength={1000} value={values.description} onChange={set('description')} />
        </Field>
        <div className="row-end">
          <button className="btn btn-solid" disabled={saving}>
            {saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Tambah warung'}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className={`field${error ? ' field-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error ? <em>{error}</em> : hint ? <small>{hint}</small> : null}
    </label>
  );
}
