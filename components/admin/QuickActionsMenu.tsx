'use client';

import Link from 'next/link';
import { Plus, Users, BookOpen, DollarSign, GraduationCap, Zap } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface QuickActionsMenuProps {
  locale: string;
}

export function QuickActionsMenu({ locale }: QuickActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="w-4 h-4" />
          <Trans>Quick Actions</Trans>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <Trans>Create New</Trans>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/teachers/new`} className="cursor-pointer">
            <GraduationCap className="mr-2 h-4 w-4" />
            <Trans>Add Teacher</Trans>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/students/new`} className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            <Trans>Add Student</Trans>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/courses/new`} className="cursor-pointer">
            <BookOpen className="mr-2 h-4 w-4" />
            <Trans>Add Course</Trans>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <Trans>View</Trans>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/students`} className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            <Trans>View Students</Trans>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/teachers`} className="cursor-pointer">
            <GraduationCap className="mr-2 h-4 w-4" />
            <Trans>View Teachers</Trans>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/courses`} className="cursor-pointer">
            <BookOpen className="mr-2 h-4 w-4" />
            <Trans>View Courses</Trans>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/payments`} className="cursor-pointer">
            <DollarSign className="mr-2 h-4 w-4" />
            <Trans>View Payments</Trans>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
