import Header from '@/components/layout/header';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col gap-5">
      <Header />
      <Outlet />
    </div>
  );
}
