"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trans } from "@lingui/react/macro";
import { User, Settings, LogOut, Shield, Copy, Check } from "lucide-react";
import {
  getAvatarGradient,
  getInitials,
  getRoleGradient,
  getRoleIcon,
} from "@/lib/avatar-utils";

interface UserNavProps {
  locale: string;
}

export function UserNav({ locale }: UserNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();

  // Get user from session (will update automatically when session updates)
  const sessionUser = session?.user as any;
  const user = sessionUser
    ? {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        image: sessionUser.image,
        role: sessionUser.role,
        suid: sessionUser.suid,
      }
    : null;

  if (!user) return null;

  const handleCopySuid = async () => {
    if (user.suid) {
      await navigator.clipboard.writeText(user.suid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get consistent gradients based on user ID
  const avatarGradient = getAvatarGradient(user.id);
  const roleGradient = getRoleGradient(user.role);
  const roleIcon = getRoleIcon(user.role);

  const getRoleLabel = (role?: string | null) => {
    switch (role) {
      case "admin":
        return <Trans>Admin</Trans>;
      case "teacher":
        return <Trans>Teacher</Trans>;
      case "student":
        return <Trans>Student</Trans>;
      default:
        return null;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#17224D]">{user.name}</p>
            {user.role === 'student' && user.suid ? (
              <p className="text-xs text-blue-600 font-mono font-semibold">{user.suid}</p>
            ) : (
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            )}
          </div>
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-gray-200 shadow-sm">
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || "User"}
              />
              <AvatarFallback
                className={`bg-gradient-to-br ${avatarGradient} text-white font-semibold text-sm`}
              >
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {/* Tiny role indicator dot */}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-br ${roleGradient} rounded-full border border-white shadow-sm`}
            />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-[#17224D]">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {user.role === 'student' && user.suid ? (
              <button
                onClick={handleCopySuid}
                className="flex items-center gap-1.5 mt-1 px-2 py-1 -mx-2 rounded hover:bg-gray-100 transition-colors group"
                title="Click to copy Student ID"
              >
                <Shield className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-mono text-blue-600 font-semibold">
                  {user.suid}
                </span>
                {copied ? (
                  <Check className="w-3 h-3 text-green-500 ml-auto" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 capitalize">
                  {getRoleLabel(user.role)}
                </span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href={`/${locale}/${user.role}/profile`}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <Trans>My Profile</Trans>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href={`/${locale}/${user.role}/settings`}
            className="cursor-pointer"
          >
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
