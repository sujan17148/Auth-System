import { Loader, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import TaskInput from '@/components/ui/task-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import {
  requestVerifyEmail,
  verifyEmail,
  VerifyEmailSchema,
  type VerifyEmailPayload,
} from '@/features/auth/api/auth';
import { extractError } from '@/utility/extractError';
import { toast } from 'sonner';

const defaultVerifyEmailData: VerifyEmailPayload = {
  email: '',
  otp: '',
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailState = location.state?.email ?? '';
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailPayload>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: { ...defaultVerifyEmailData, email: emailState },
  });

  const submitVerifyEmailForm = async (data: VerifyEmailPayload) => {
    setError(null);
    try {
      await verifyEmail(data);
      toast.success('Email verified successfully,Login to continue');
      navigate('/auth/login');
    } catch (err) {
      reset({ otp: '' });
      setError(extractError(err) || 'something went wrong');
    }
  };

  const resendVerificationCode = async () => {
    setError(null);
    try {
      const response = await requestVerifyEmail({ email: emailState });
      console.log(response);
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

        <h1 className="mb-1 text-center text-2xl font-bold">Verify your email</h1>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          Enter the verification code we sent to your email.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(submitVerifyEmailForm)}>
          <TaskInput
            readOnly
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <TaskInput
            label="Verification Code"
            placeholder="1234"
            {...register('otp')}
            error={errors.otp?.message}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" />
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={resendVerificationCode}
            disabled={isSubmitting}
          >
            Resend Code
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Back to{' '}
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
