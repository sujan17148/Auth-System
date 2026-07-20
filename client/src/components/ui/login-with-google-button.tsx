import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';
import { FcGoogle } from 'react-icons/fc';

export default function LoginWithGoogleButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full mt-4"
      onClick={() => {
        window.location.href = `${config.apiUrl}/oauth/google`;
      }}
    >
      <FcGoogle /> Continue with Google
    </Button>
  );
}
