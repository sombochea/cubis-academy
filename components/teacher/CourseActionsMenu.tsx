"use client";

import { Trans } from "@lingui/react/macro";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronDown,
  BookOpen,
  Upload,
  FileText,
  Copy,
} from "lucide-react";
import Link from "next/link";

interface CourseActionsMenuProps {
  locale: string;
}

export function CourseActionsMenu({ locale }: CourseActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#007FFF] hover:bg-[#0066CC] text-white gap-2">
          <Plus className="w-4 h-4" />
          <Trans>Add Course</Trans>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <Trans>Course Actions</Trans>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link
            href={`/${locale}/teacher/courses/new`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>
              <Trans>Create New Course</Trans>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href={`/${locale}/teacher/courses/import`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>
              <Trans>Import Course</Trans>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href={`/${locale}/teacher/courses/templates`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>
              <Trans>Use Template</Trans>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href={`/${locale}/teacher/courses/duplicate`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>
              <Trans>Duplicate Course</Trans>
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
