import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import TaskInput from '@/components/ui/task-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import {
  ChangePasswordSchema,
  type ChangePasswordFormData,
  changePassword,
  type ChangePasswordPayload,
} from '@/features/api/profile';
import { extractError } from '@/utility/extractError';
import { toast } from 'sonner';

import { useState } from 'react';
import { Loader } from 'lucide-react';

export default function ChangePasswordSection() {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),

    onSuccess: () => {
      reset();
      setError(null);
      toast.success('Password changed successfully');
    },

    onError: (err) => {
      setError(extractError(err));
    },
  });

  const submitPassword = (data: ChangePasswordFormData) => {
    setError(null);
    changePasswordMutation.mutate({ newPassword: data.newPassword, oldPassword: data.oldPassword });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="text-lg font-semibold mb-4">Change Password</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Unable to change password</AlertTitle>

          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(submitPassword)}>
        <TaskInput
          label="Current Password"
          type="password"
          {...register('oldPassword')}
          error={errors.oldPassword?.message}
        />

        <TaskInput
          label="New Password"
          type="password"
          {...register('newPassword')}
          error={errors.newPassword?.message}
        />

        <TaskInput
          label="Confirm New Password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button disabled={changePasswordMutation.isPending}>
          {changePasswordMutation.isPending ? (
            <div className="flex items-center gap-2">
              <Loader className="animate-spin size-4" />
              Saving...
            </div>
          ) : (
            'Change Password'
          )}
        </Button>
      </form>
    </div>
  );
}
