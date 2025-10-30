'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trans } from '@lingui/react/macro';
import { User, Settings, LogOut, Shield } from 'lucide-react';

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  locale: string;
}

export function UserNav({ user, locale }: UserNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role?: string | null) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'teacher':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'student':
        return 'bg-gradient-to-br from-green-500 to-green-600';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const getRoleLabel = (role?: string | null) => {
    switch (role) {
      case 'admin':
        return <Trans>Admin</Trans>;
      case 'teacher':
        return <Trans>Teacher</Trans>;
      case 'student':
        return <Trans>Student</Trans>;
      default:
        return null;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#007FFF] focus:ring-offset-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#17224D]">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <Avatar className="h-10 w-10 border-2 border-gray-200 shadow-sm">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback className={`${getRoleColor(user.role)} text-white font-semibold text-sm`}>
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-[#17224D]">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 capitalize">{getRoleLabel(user.role)}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/${user.role}/profile`} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <Trans>My Profile</Trans>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/settings`} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <Trans>Settings</Trans>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link 
            href={`/${locale}/logout`} 
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <Trans>Sign Out</Trans>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
