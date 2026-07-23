import { useAuthContext } from '@/context/auth-context';
import ChangePasswordSection from '@/features/settings/change-paassword-section';
import { ProfileCard } from '@/features/settings/profile-card';
import ProfileInfoSection from '@/features/settings/profile-info-section';

export default function SettingsPage() {
  const { currentUser } = useAuthContext();
  if (!currentUser) return null;
  return (
    <div className="max-w-5xl px-3 mx-auto space-y-4 w-full">
      <ProfileCard user={currentUser} />
      <ProfileInfoSection />
      <ChangePasswordSection />
    </div>
  );
}
