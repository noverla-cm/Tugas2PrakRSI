import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import StallDetailPage from './pages/StallDetailPage';
import StallFormPage from './pages/StallFormPage';
import StallListPage from './pages/StallListPage';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<StallListPage />} />
          <Route path="/stalls/:id" element={<StallDetailPage />} />
          <Route path="/stalls/new" element={<ProtectedRoute roles={['admin', 'owner']}><StallFormPage /></ProtectedRoute>} />
          <Route path="/stalls/:id/edit" element={<ProtectedRoute roles={['admin', 'owner']}><StallFormPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
