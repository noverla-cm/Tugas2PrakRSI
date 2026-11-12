import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="state state-error">
      <h3>Halaman tidak ditemukan</h3>
      <p>Alamat yang Anda buka tidak tersedia.</p>
      <Link className="btn" to="/">Kembali ke daftar warung</Link>
    </div>
  );
}
