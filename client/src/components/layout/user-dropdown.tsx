import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthContext } from '@/context/auth-context';

import { Home, LayoutDashboard, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  variant?: 'destructive';
  onSelect?: () => void;
  to?: string;
}

export default function UserDropDown() {
  const location = useLocation();
  const { signOut, currentUser } = useAuthContext();
  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'Admin';
  const isDashboard = location.pathname.startsWith('/app');

  const menuItems: MenuItem[] = [
    {
      label: isDashboard ? 'Home' : 'Dashboard',
      icon: isDashboard ? <Home className="size-4" /> : <LayoutDashboard className="size-4" />,
      to: isDashboard ? '/' : isAdmin ? '/app/admin' : '/app/',
    },
    // {
    //   label: 'Settings',
    //   icon: <Settings className="size-4" />,
    //   to: '/settings',
    // },
    {
      label: 'Logout',
      icon: <LogOut className="size-4 mr-2" />,
      variant: 'destructive',
      onSelect: signOut,
    },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer ">
          <Avatar className="size-10 uppercase font-bold flex items-center justify-center">
            <User />
          </Avatar>
          <div className="md:flex flex-col leading-tight hidden">
            <span className="text-sm font-medium capitalize">
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{currentUser.email}</span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {menuItems.map((item, idx) => {
          if (item.to) {
            return (
              <DropdownMenuItem asChild key={idx}>
                <Link to={item.to} className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem
              key={idx}
              onClick={item.onSelect}
              className={
                item.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''
              }
            >
              <div className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
