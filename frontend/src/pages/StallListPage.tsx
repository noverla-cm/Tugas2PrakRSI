import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { StallCard } from '../components/StallCard';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import type { Stall, StallPage } from '../lib/types';
import { stallService } from '../services/stallService';

const LIMIT = 9;

export default function StallListPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const search = params.get('search') ?? '';
  const category = params.get('category') ?? '';

  const [searchInput, setSearchInput] = useState(search);
  const [categoryInput, setCategoryInput] = useState(category);
  const [data, setData] = useState<StallPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [toDelete, setToDelete] = useState<Stall | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { canCreate, canEdit, canDelete } = useAuth();
  const { push } = useToast();

  const update = useCallback((next: Record<string, string>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) (v ? p.set(k, v) : p.delete(k));
    setParams(p, { replace: true });
  }, [params, setParams]);

  // Pencarian/filter dikirim ke backend setelah user berhenti mengetik
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search || categoryInput !== category) {
        update({ search: searchInput.trim(), category: categoryInput.trim(), page: '' });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, categoryInput, search, category, update]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    stallService
      .list({ page, limit: LIMIT, search: search || undefined, category: category || undefined })
      .then((res) => !cancelled && setData(res))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [page, search, category, reload]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const categories = useMemo(
    () => Array.from(new Set((data?.items ?? []).map((s) => s.category).filter(Boolean) as string[])),
    [data],
  );
  const filtered = !!(search || category);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await stallService.remove(toDelete.id);
      push('success', `Warung "${toDelete.name}" berhasil dihapus.`);
      setToDelete(null);
      if (data && data.items.length === 1 && page > 1) update({ page: String(page - 1) });
      else setReload((n) => n + 1);
    } catch (e: any) {
      push('error', `${e.status ? `[${e.status}] ` : ''}${e.message}`);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Warung di kantin</h1>
          <p className="lead">Lihat warung, kategori, dan rating dari pembeli lain.</p>
        </div>
        {canCreate && <Link className="btn btn-solid" to="/stalls/new">Tambah warung</Link>}
      </div>

      <div className="toolbar" role="search">
        <label>
          <span>Cari nama warung</span>
          <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Contoh: bakso" />
        </label>
        <label>
          <span>Kategori</span>
          <input list="kategori" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="Semua kategori (cocok persis, mis. Bakso)" />
          <datalist id="kategori">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        {filtered && (
          <button className="btn btn-ghost" onClick={() => { setSearchInput(''); setCategoryInput(''); update({ search: '', category: '', page: '' }); }}>
            Hapus filter
          </button>
        )}
      </div>

      {loading && <Loading label="Memuat daftar warung…" />}
      {!loading && error && <ErrorState message={error} onRetry={() => setReload((n) => n + 1)} />}
      {!loading && !error && data && data.items.length === 0 && (
        <EmptyState
          title={filtered ? 'Tidak ada warung yang cocok' : 'Belum ada warung'}
          hint={filtered ? 'Coba kata kunci atau kategori lain.' : canCreate ? 'Tambahkan warung pertama.' : 'Data warung belum tersedia.'}
          action={canCreate && !filtered ? <Link className="btn btn-solid" to="/stalls/new">Tambah warung</Link> : undefined}
        />
      )}
      {!loading && !error && data && data.items.length > 0 && (
        <>
          <div className="grid">
            {data.items.map((s) => (
              <StallCard key={s.id} stall={s} canEdit={canEdit(s)} canDelete={canDelete} onDelete={setToDelete} />
            ))}
          </div>
          <nav className="pager" aria-label="Halaman">
            <button className="btn" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Sebelumnya</button>
            <span>Halaman {page} dari {totalPages} ({data.total} warung)</span>
            <button className="btn" disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) })}>Berikutnya</button>
          </nav>
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Hapus warung?"
        message={`Warung "${toDelete?.name ?? ''}" beserta menu dan ulasannya akan dihapus permanen dari database.`}
        confirmLabel="Hapus warung"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
