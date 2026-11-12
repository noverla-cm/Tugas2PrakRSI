import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export function Navbar() {
  const { user, canCreate, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    push('success', 'Anda sudah keluar.');
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">Kantin Review</Link>
        <nav className="nav-links" aria-label="Menu utama">
          <NavLink to="/" end>Warung</NavLink>
          {canCreate && <NavLink to="/stalls/new">Tambah warung</NavLink>}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <Link to="/profile" className="user-chip">
                <span>{user.name || user.email}</span>
                <span className={`role role-${user.role}`}>{user.role}</span>
              </Link>
              <button className="btn btn-ghost" onClick={onLogout}>Keluar</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">Masuk</Link>
              <Link className="btn btn-solid" to="/register">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
