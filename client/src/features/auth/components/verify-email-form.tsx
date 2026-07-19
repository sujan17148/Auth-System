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
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { APP_QUERY_KEYS } from '@/constants/queryKeys';
import { queryClient } from '@/services/queryClient';

interface VerifyEmailFormProps {
  email: string;
  onClose: () => void;
}

export function VerifyEmailForm({ email, onClose }: VerifyEmailFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailPayload>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: {
      email: email,
      otp: '',
    },
  });

  const submitVerifyEmailForm = async (data: VerifyEmailPayload) => {
    setError(null);
    try {
      const updatedUser = await verifyEmail(data);
      queryClient.setQueryData(APP_QUERY_KEYS.auth.me, updatedUser);
      onClose();
      toast.success('Email verified successfully');
    } catch (err) {
      reset({ otp: '' });
      setError(extractError(err) || 'something went wrong');
    }
  };

  const resendVerificationCode = async () => {
    setError(null);
    try {
      await requestVerifyEmail({ email: email });
      toast.success('Email verification request sent  successfully');
    } catch (err) {
      setError(extractError(err) || 'something went wrong');
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(submitVerifyEmailForm)}>
        <div className="space-y-1 text-center">
          <p className="text-sm text-muted-foreground">We've sent a verification code to</p>

          <p className="font-medium">{email}</p>
        </div>

        <TaskInput
          label="Verification Code"
          placeholder="Enter the 4-digit code"
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
    </>
  );
}
