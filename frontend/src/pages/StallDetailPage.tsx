import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorState, Loading } from '../components/States';
import { stripeFor } from '../components/StallCard';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import type { Stall } from '../lib/types';
import { stallService } from '../services/stallService';

export default function StallDetailPage() {
  const { id } = useParams();
  const stallId = Number(id);
  const navigate = useNavigate();
  const { canEdit, canDelete } = useAuth();
  const { push } = useToast();

  const [stall, setStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [reload, setReload] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!Number.isInteger(stallId) || stallId <= 0) {
      setError({ message: 'ID warung tidak valid.', status: 404 });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    stallService
      .get(stallId)
      .then((s) => !cancelled && setStall(s))
      .catch((e) => !cancelled && setError({ message: e.message, status: e.status }))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [stallId, reload]);

  const remove = async () => {
    setDeleting(true);
    try {
      await stallService.remove(stallId);
      push('success', 'Warung berhasil dihapus.');
      navigate('/');
    } catch (e: any) {
      push('error', `${e.status ? `[${e.status}] ` : ''}${e.message}`);
      setConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading label="Memuat detail warung…" />;
  if (error) {
    return error.status === 404 ? (
      <div className="state state-error" role="alert">
        <h3>Warung tidak ditemukan</h3>
        <p>{error.message}</p>
        <Link className="btn" to="/">Kembali ke daftar warung</Link>
      </div>
    ) : (
      <ErrorState message={error.message} onRetry={() => setReload((n) => n + 1)} />
    );
  }
  if (!stall) return null;

  return (
    <section className="detail" style={{ '--stripe': stripeFor(stall.category) } as CSSProperties}>
      <Link to="/" className="back">Kembali ke daftar</Link>
      <div className="detail-board">
        <div className="detail-top">
          <div>
            <h1>{stall.name}</h1>
            <p className="meta">{stall.category ?? 'Tanpa kategori'}{stall.location ? `, ${stall.location}` : ''}</p>
          </div>
          {stall.avgRating !== null && (
            <div className="rating rating-lg">
              <strong>{stall.avgRating.toFixed(1)}</strong>
              {stall.reviewCount !== null && <small>{stall.reviewCount} ulasan</small>}
            </div>
          )}
        </div>
        <h2>Tentang warung</h2>
        <p className="desc-full">{stall.description || 'Pemilik belum menambahkan deskripsi.'}</p>
        <dl className="facts">
          <div><dt>ID warung</dt><dd>{stall.id}</dd></div>
          <div><dt>ID pemilik</dt><dd>{stall.ownerId || '-'}</dd></div>
          {stall.createdAt && <div><dt>Terdaftar</dt><dd>{new Date(stall.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</dd></div>}
        </dl>
        {(canEdit(stall) || canDelete) && (
          <div className="row-end">
            {canEdit(stall) && <Link className="btn btn-solid" to={`/stalls/${stall.id}/edit`}>Ubah warung</Link>}
            {canDelete && <button className="btn btn-danger-outline" onClick={() => setConfirm(true)}>Hapus warung</button>}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        title="Hapus warung?"
        message={`Warung "${stall.name}" akan dihapus permanen dari database.`}
        confirmLabel="Hapus warung"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      />
    </section>
  );
}
