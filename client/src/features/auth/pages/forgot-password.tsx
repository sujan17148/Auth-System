import { Loader, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import TaskInput from '@/components/ui/task-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import {
  ForgotPasswordSchema,
  requestPasswordReset,
  type ForgotPasswordPayload,
} from '@/features/api/auth';
import { extractError } from '@/utility/extractError';
import { toast } from 'sonner';

const defaultForgotPasswordData: ForgotPasswordPayload = {
  email: '',
};

export default function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: defaultForgotPasswordData,
  });

  const submitForgotPasswordForm = async (data: ForgotPasswordPayload) => {
    setError(null);
    try {
      await requestPasswordReset(data);
      toast.success('Request to reset password has been sent');
      navigate('/auth/reset-password', { state: { email: data.email } });
    } catch (err) {
      setError(extractError(err) || 'something went wrong');
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
      <div className="min-w-sm px-5">
        <div className="mb-6 flex justify-center">
          <div className="gradient-primary flex h-12 w-12 items-center justify-center rounded-xl">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        <h1 className="mb-1 text-center text-2xl font-bold">Forgot your password?</h1>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          Enter your email and we'll send you a password reset code.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Request Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(submitForgotPasswordForm)}>
          <TaskInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" />
                Sending...
              </div>
            ) : (
              'Send Reset Code'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
