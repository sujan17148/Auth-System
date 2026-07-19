import AdminDashboardPage from '@/admin';
import PublicLayout from '@/components/layout/public-layout';
import { useAuthContext } from '@/context/auth-context';
import ForgotPassword from '@/features/auth/pages/forgot-password';
import HomePage from '@/features/auth/pages/home';
import Login from '@/features/auth/pages/login';
import Register from '@/features/auth/pages/register';
import ResetPassword from '@/features/auth/pages/reset-password';
import UserDashboardPage from '@/features/user';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

function App() {
  const { isLoading } = useAuthContext();

  if (isLoading) {
    return <h1>loading...</h1>;
  }

  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route path="app">
          <Route element={<ProtectedRoute />}>
            <Route index element={<UserDashboardPage />} />
          </Route>

          <Route path="admin" element={<ProtectedRoute requireAdmin />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
        </Route>

        <Route index element={<HomePage />} />
        <Route path="auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

function ProtectedRoute({ requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuthContext();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  if (requireAdmin && !isAdmin) return <Navigate to="/auth/login" replace />;

  return <Outlet />;
}
