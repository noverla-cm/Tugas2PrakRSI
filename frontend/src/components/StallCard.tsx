import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { Stall } from '../lib/types';

const STRIPES = ['#C8321E', '#E9A820', '#1F4D3A', '#2F7F8F', '#7A4B8C', '#B5651D'];
export const stripeFor = (c: string | null) => {
  const s = c ?? '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return STRIPES[h % STRIPES.length];
};

interface Props {
  stall: Stall;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (s: Stall) => void;
}

export function StallCard({ stall, canEdit, canDelete, onDelete }: Props) {
  return (
    <article className="card" style={{ '--stripe': stripeFor(stall.category) } as CSSProperties}>
      <Link to={`/stalls/${stall.id}`} className="card-main">
        <div className="card-head">
          <h3>{stall.name}</h3>
          {stall.avgRating !== null && (
            <div className="rating" aria-label={`Rating ${stall.avgRating.toFixed(1)} dari 5`}>
              <strong>{stall.avgRating.toFixed(1)}</strong>
              {stall.reviewCount !== null && <small>{stall.reviewCount} ulasan</small>}
            </div>
          )}
        </div>
        <p className="meta">{stall.category ?? 'Tanpa kategori'}{stall.location ? `, ${stall.location}` : ''}</p>
        {stall.description && <p className="desc">{stall.description}</p>}
      </Link>
      {(canEdit || canDelete) && (
        <div className="card-actions">
          {canEdit && <Link className="btn btn-sm" to={`/stalls/${stall.id}/edit`}>Ubah</Link>}
          {canDelete && <button className="btn btn-sm btn-danger-outline" onClick={() => onDelete(stall)}>Hapus</button>}
        </div>
      )}
    </article>
  );
}
