import ForgotPassword from '@/features/auth/pages/forgot-password';
import HomePage from '@/features/auth/pages/home';
import Login from '@/features/auth/pages/login';
import Register from '@/features/auth/pages/register';
import ResetPassword from '@/features/auth/pages/reset-password';
import VerifyEmail from '@/features/auth/pages/verifyEmail';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="auth">
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
}

export default App;
