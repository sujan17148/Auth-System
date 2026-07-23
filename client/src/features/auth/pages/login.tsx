import { Eye, EyeOff, Loader, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import TaskInput from '@/components/ui/task-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchCurrentUser, login, LoginSchema, type LoginPayload } from '@/features/api/auth';
import { extractError } from '@/utility/extractError';
import { toast } from 'sonner';
import { APP_QUERY_KEYS } from '@/constants/queryKeys';
import { queryClient } from '@/services/queryClient';
import { LoginWithGithubButton, LoginWithGoogleButton } from '@/components/ui/oauth-buttons';

const defaultLoginFormData: LoginPayload = {
  identifier: '',
  password: '',
};

export default function Login() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: defaultLoginFormData,
  });

  const submitLoginForm = async (data: LoginPayload) => {
    setError(null);
    try {
      await login(data);
      const currentUser = await fetchCurrentUser();
      queryClient.setQueryData(APP_QUERY_KEYS.auth.me, currentUser);
      reset();
      const isAdmin = currentUser.role === 'ADMIN';
      navigate(isAdmin ? '/app/admin' : '/app');
      toast.success('Login successfull');
      navigate('/');
    } catch (err) {
      reset({ password: '' });
      setError(extractError(err));
    }
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center">
      <div className="px-5 min-w-sm">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-display font-bold text-center mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Log in to your account</p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Unable to Login</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(submitLoginForm)}>
          <TaskInput
            label="Email"
            placeholder="you@example.com"
            {...register('identifier')}
            error={errors.identifier?.message}
          />
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
              className="absolute top-8 right-2"
            >
              {isPasswordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>

          <div className="flex items-center justify-end">
            <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex gap-2 items-center">
                <Loader className="animate-spin" />
                Submitting...
              </div>
            ) : (
              'Log in'
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <LoginWithGoogleButton />
          <LoginWithGithubButton />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
