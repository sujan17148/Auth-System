import type { UserSession } from '@/admin/api/dashboard';
import { formatDate } from '@/utility/formatDate';
import { parseUserAgent } from '@/utility/parseUserAgent';

interface SessionCardProps {
  session: UserSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const { browser, os } = parseUserAgent(session.userAgent);

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div>
        <h3 className="font-medium">Device Info</h3>
        <p className="text-sm text-muted-foreground">Browser : {browser}</p>
        <p className="text-sm text-muted-foreground">Os : {os}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium">IP Address</p>
          <p className="text-muted-foreground">{session.ipAddress ?? 'Unknown'}</p>
        </div>

        <div>
          <p className="font-medium">Last Activity</p>
          <p className="text-muted-foreground">{formatDate(session.lastActivity)}</p>
        </div>

        <div>
          <p className="font-medium">Expires At</p>
          <p className="text-muted-foreground">{formatDate(session.expiresAt)}</p>
        </div>
      </div>
    </div>
  );
}
