import { Button } from '@/components/ui/button';
import { Home, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <TriangleAlert className="h-8 w-8 text-muted-foreground" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-wider text-primary">404 Error</p>

        <h1 className="mt-2 text-4xl font-display font-bold">Page not found</h1>

        <p className="mt-4 text-muted-foreground">
          Sorry, the page you're looking for doesn't exist or may have been moved.
        </p>

        <Button asChild className="mt-8">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
