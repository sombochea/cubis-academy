'use client';

import Link from 'next/link';
import { Plus, FolderOpen, Tags, BookOpen } from 'lucide-react';
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

interface CourseManagementMenuProps {
  locale: string;
}

export function CourseManagementMenu({ locale }: CourseManagementMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-[#007FFF] to-[#17224D]">
          <Plus className="w-4 h-4" />
          <Trans>Actions</Trans>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <Trans>Courses</Trans>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/courses/new`} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            <Trans>Add Course</Trans>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/courses`} className="cursor-pointer">
            <BookOpen className="mr-2 h-4 w-4" />
            <Trans>View All Courses</Trans>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <Trans>Categories</Trans>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/categories/new`} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            <Trans>Add Category</Trans>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/categories`} className="cursor-pointer">
            <Tags className="mr-2 h-4 w-4" />
            <Trans>Manage Categories</Trans>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
