import { Eye, EyeOff, Loader, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import TaskInput from '@/components/ui/task-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import {
  resetPassword,
  ResetPasswordSchema,
  type ResetPasswordPayload,
} from '@/features/auth/api/auth';
import { toast } from 'sonner';
import { extractError } from '@/utility/extractError';

const defaultResetPasswordData: ResetPasswordPayload = {
  email: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailState = location.state?.email ?? '';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordPayload>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { ...defaultResetPasswordData, email: emailState },
  });

  const submitResetPasswordForm = async (data: ResetPasswordPayload) => {
    try {
      await resetPassword(data);
      toast.success('Password reset successfull');
      navigate('/auth/login');
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

        <h1 className="mb-1 text-center text-2xl font-bold">Reset your password</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Reset Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(submitResetPasswordForm)}>
          <div className="space-y-1 text-center">
            <p className="text-sm text-muted-foreground">We've sent a verification code to</p>

            <p className="font-medium text-sm">{emailState}</p>
          </div>

          <TaskInput
            label="Verification Code"
            placeholder="1234"
            {...register('otp')}
            error={errors.otp?.message}
          />

          <div className="relative">
            <TaskInput
              label="New Password"
              type={isPasswordVisible ? 'text' : 'password'}
              {...register('newPassword')}
              error={errors.newPassword?.message}
            />

            <button
              type="button"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              className="absolute right-2 top-8"
            >
              {isPasswordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>

          <div className="relative">
            <TaskInput
              label="Confirm Password"
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <button
              type="button"
              onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
              className="absolute right-2 top-8"
            >
              {isConfirmPasswordVisible ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" />
                Resetting...
              </div>
            ) : (
              'Reset Password'
            )}
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
