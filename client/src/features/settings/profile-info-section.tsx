import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import TaskInput from '@/components/ui/task-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { extractError } from '@/utility/extractError';
import { APP_QUERY_KEYS } from '@/constants/queryKeys';
import { queryClient } from '@/services/queryClient';

import { toast } from 'sonner';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import { useAuthContext } from '@/context/auth-context';
import {
  updateProfile,
  UpdateProfileSchema,
  type UpdateProfileFormData,
} from '@/features/api/profile';

export default function ProfileInfoSection() {
  const { currentUser } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      username: currentUser?.username ?? '',
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,

    onSuccess: (data) => {
      queryClient.setQueryData(APP_QUERY_KEYS.auth.me, data); 
      toast.success('Profile updated successfully');
      setError(null);
    },

    onError: (err) => {
      setError(extractError(err));
    },
  });

  const submitProfile = (data: UpdateProfileFormData) => {
    setError(null);

    updateProfileMutation.mutate({
      username: data.username.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName?.trim() || '',
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Unable to update profile</AlertTitle>

          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit(submitProfile)}>
        <TaskInput label="Username" {...register('username')} error={errors.username?.message} />

        <TaskInput label="Email" value={currentUser?.email ?? ''} readOnly />

        <TaskInput
          label="First Name"
          {...register('firstName')}
          error={errors.firstName?.message}
        />

        <TaskInput label="Last Name" {...register('lastName')} error={errors.lastName?.message} />

        <div className="col-span-2">
          <Button disabled={isSubmitting || updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin size-4" />
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
