import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/auth-context';
import UserDropDown from '@/components/layout/user-dropdown';

export default function Header() {
  const { isAuthenticated } = useAuthContext();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-3">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight transition-colors hover:text-primary"
        >
          AuthSystem
        </Link>

        {isAuthenticated ? (
          <UserDropDown />
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/auth/login">Login</Link>
            </Button>

            <Button asChild>
              <Link to="/auth/register">Create Account</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
