import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { useAuthContext } from '@/context/auth-context';
import { requestVerifyEmail } from '@/features/auth/api/auth';
import { VerifyEmailForm } from '@/features/auth/components/verify-email-form';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function UserDashboardPage() {
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const { currentUser } = useAuthContext();

  const isEmailVerified = currentUser?.emailVerified;

  const onOpen = () => {
    requestVerifyEmail({ email: currentUser!.email });
    setIsVerifyModalOpen(true);
  };

  return (
    <main className="grow max-w-5xl mx-auto px-3">
      {!isEmailVerified && (
        <Alert variant="destructive" className="mb-4 flex items-center justify-between">
          <div>
            <AlertTitle>Unverified Email</AlertTitle>
            <AlertDescription>
              You need to verify your email to start using our app.
            </AlertDescription>
          </div>

          <Button onClick={onOpen}>Verify Email</Button>
        </Alert>
      )}

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

      <Modal
        title="Verify your email"
        subtitle="Enter the verification code sent to your email."
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      >
        <VerifyEmailForm email={currentUser!.email} onClose={() => setIsVerifyModalOpen(false)} />
      </Modal>
    </main>
  );
}
