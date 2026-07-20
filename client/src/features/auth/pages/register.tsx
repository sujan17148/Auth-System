import { Eye, EyeOff, Loader, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import TaskInput from '@/components/ui/task-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import {
  login,
  registerUser,
  RegisterUserSchema,
  type RegisterUserPayload,
} from '@/features/auth/api/auth';
import { toast } from 'sonner';
import { extractError } from '@/utility/extractError';
import { queryClient } from '@/services/queryClient';
import { APP_QUERY_KEYS } from '@/constants/queryKeys';
import LoginWithGoogleButton from '@/components/ui/login-with-google-button';

const defaultRegisterFormData: RegisterUserPayload = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserPayload>({
    resolver: zodResolver(RegisterUserSchema),
    defaultValues: defaultRegisterFormData,
  });

  const submitRegisterForm = async (data: RegisterUserPayload) => {
    setError(null);
    try {
      const newUser = await registerUser(data);
      queryClient.setQueryData(APP_QUERY_KEYS.auth.me, newUser);
      await login({ identifier: data.email, password: data.password });
      reset();
      const isAdmin = newUser.role === 'Admin';
      navigate(isAdmin ? '/app/admin' : '/app');
      toast.success('Registration successfull');
    } catch (err) {
      reset({ password: '' });
      setError(extractError(err));
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

        <h1 className="mb-3 text-center text-2xl font-bold">Create your account</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Registration Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(submitRegisterForm)}>
          <div className="grid grid-cols-2 gap-4">
            <TaskInput
              label="First Name"
              {...register('firstName')}
              error={errors.firstName?.message}
            />

            <TaskInput
              label="Last Name"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>

          <TaskInput
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <TaskInput label="Username" {...register('username')} error={errors.username?.message} />

          <div className="relative">
            <TaskInput
              label="Password"
              type={isPasswordVisible ? 'text' : 'password'}
              {...register('password')}
              error={errors.password?.message}
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

          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" />
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <LoginWithGoogleButton />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
