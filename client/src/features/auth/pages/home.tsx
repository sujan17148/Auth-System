import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Button asChild>
          <Link to="auth/login">Login</Link>
        </Button>

        <Button asChild variant="secondary">
          <Link to="auth/register">Register</Link>
        </Button>

        <Button asChild variant="outline">
          <Link to="auth/verify-email">Verify Email</Link>
        </Button>
      </div>
    </main>
  );
}
