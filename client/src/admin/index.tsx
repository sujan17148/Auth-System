import {
  changeUserStatus,
  fetchUsers,
  fetchUserSession,
  fetchUserSummary,
  type User,
} from '@/admin/api/dashboard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import LoadingState from '@/components/ui/loading-state';
import type { MetricsCardProps } from '@/components/ui/metrics-card';
import MetricsCard from '@/components/ui/metrics-card';
import Modal from '@/components/ui/modal';
import { RowActionsMenu, type RowAction } from '@/components/ui/row-action-menu';
import { SessionCard } from '@/components/ui/session-card';
import { TableEmptyState } from '@/components/ui/table-states';
import { ADMIN_QUERY_KEYS } from '@/constants/queryKeys';
import { useAuthContext } from '@/context/auth-context';
import { queryClient } from '@/services/queryClient';
import { formatDate } from '@/utility/formatDate';
import { padIndex } from '@/utility/pad-index';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BadgeCheck, Monitor, UserCheck, Users, UserX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const invalidateUsers = () =>
  queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users.root });

export default function AdminDashboardPage() {
  const { currentUser } = useAuthContext();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState<boolean>(false);

  const {
    data: usersSummary,
    isLoading: isUsersSummaryLoading,
    error: usersSummaryError,
  } = useQuery({
    queryKey: ADMIN_QUERY_KEYS.users.summary,
    queryFn: fetchUserSummary,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: users,
    isLoading: isUsersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ADMIN_QUERY_KEYS.users.list,
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['user-sessions', selectedUser?.id],
    queryFn: () => fetchUserSession(selectedUser!.id),
    enabled: isSessionsModalOpen && !!selectedUser,
  });

  const handleClose = () => {
    setIsSessionsModalOpen(false);
    setSelectedUser(null);
  };

  const changeUserStatusMutation = useMutation({
    mutationFn: changeUserStatus,

    onSuccess: (_, variables) => {
      invalidateUsers();

      toast.success(`User ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
    },

    onError: (_, variables) => {
      toast.error(`Failed to ${variables.isActive ? 'activate' : 'deactivate'} user`);
    },
  });

  if (isUsersLoading || isUsersSummaryLoading) return <LoadingState className="min-h-50" />;
  if (usersSummaryError) return <ErrorState error={usersSummaryError} />;
  if (usersError) return <ErrorState error={usersError} />;

  const summary: MetricsCardProps[] = [
    {
      title: 'Total Users',
      value: usersSummary?.totalUsers ?? 0,
      description: 'All registered users',
      icon: Users,
      iconClass: 'bg-indigo-500/20 text-indigo-700',
    },
    {
      title: 'Active Users',
      value: usersSummary?.activeUsers ?? 0,
      description: 'Users with active accounts',
      icon: UserCheck,
      iconClass: 'bg-green-500/20 text-green-700',
    },
    {
      title: 'Inactive Users',
      value: usersSummary?.inactiveUsers ?? 0,
      description: 'Users whose accounts are deactivated',
      icon: UserX,
      iconClass: 'bg-amber-500/20 text-amber-700',
    },
    {
      title: 'Verified Users',
      value: usersSummary?.verifiedUsers ?? 0,
      description: 'Users with verified email addresses',
      icon: BadgeCheck,
      iconClass: 'bg-emerald-500/20 text-emerald-700',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          Welcome back,
          {currentUser && <span className="capitalize ml-2">{currentUser.firstName} 👋</span>}
        </h1>

        <p className="text-muted-foreground mt-1">
          Monitor users, manage accounts, and keep track of platform activity from one place.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-5">
        {summary.map((stat) => (
          <MetricsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconClass={stat.iconClass}
          />
        ))}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Track your latest user sessions and next actions.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>User</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th className="text-right flex justify-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users &&
                  (users.length > 0 ? (
                    users.map((user, index) => {
                      const actionsDisabled = changeUserStatusMutation.isPending;
                      const actions: RowAction[] = [
                        {
                          key: 'view-sessions',
                          label: 'View Sessions',
                          icon: <Monitor className="h-4 w-4" />,
                          onSelect: () => {
                            setSelectedUser(user);
                            setIsSessionsModalOpen(true);
                          },
                        },
                        {
                          key: 'toggle-user-status',
                          label: user.isActive ? 'Deactivate User' : 'Activate User',
                          icon: user.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          ),
                          tone: user.isActive ? 'danger' : 'default',
                          disabled: actionsDisabled,
                          onSelect: () =>
                            changeUserStatusMutation.mutate({
                              userId: user.id,
                              isActive: !user.isActive,
                            }),
                        },
                      ];
                      return (
                        <tr key={user.id}>
                          <td>{padIndex(index + 1)}</td>

                          <td>
                            <div className="flex flex-col">
                              <span className="font-medium capitalize">
                                {user.firstName} {user.lastName ?? ''}
                              </span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </td>

                          <td className="font-medium">@{user.username}</td>

                          <td>
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>

                          <td>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>

                          <td>
                            <Badge variant={user.emailVerified ? 'default' : 'outline'}>
                              {user.emailVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </td>

                          <td>{formatDate(user.createdAt)}</td>

                          <td className="text-right">
                            <RowActionsMenu
                              actions={actions}
                              triggerAriaLabel={`Actions for user ${user.id}`}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <TableEmptyState label="No Users yet" />
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        title={`Sessions - ${selectedUser?.firstName} ${selectedUser?.lastName ?? ''}`}
        subtitle="View all active login sessions for this user."
        isOpen={isSessionsModalOpen}
        onClose={handleClose}
      >
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading sessions...</p>
          ) : sessions?.length ? (
            sessions.map((session) => <SessionCard key={session.id} session={session} />)
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No active sessions found.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
