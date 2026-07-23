import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CurrentUser } from '@/features/auth/api/auth';

interface ProfileCardProps {
  user: CurrentUser;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>

      <CardContent className="flex items-center gap-5">
        <div className="size-16 rounded-full border flex items-center justify-center">
          <User className="size-8 text-muted-foreground" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold capitalize">
            {user.firstName} {user.lastName ?? ''}
          </h2>

          <p className="text-sm text-muted-foreground">{user.email}</p>

          <Badge className="mt-2">{user.role}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
