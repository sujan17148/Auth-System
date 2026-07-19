import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="grow flex items-center justify-center px-5">
      <div className="max-w-xl text-center">
        <div className="gradient-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight">Authentication System</h1>

        <p className="mb-8 text-muted-foreground">
          A secure authentication system built with React, Express, Prisma, PostgreSQL and JWT
          featuring email verification, password reset and role-based authentication.
        </p>
      </div>
    </main>
  );
}
