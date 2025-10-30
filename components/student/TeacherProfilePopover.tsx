'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Award, ExternalLink } from 'lucide-react';

type TeacherProfile = {
  id: string;
  name: string;
  photo: string | null;
  bio: string | null;
  spec: string | null;
  courseCount: number;
};

interface TeacherProfilePopoverProps {
  teacher: TeacherProfile;
  locale: string;
  children: React.ReactNode;
}

export function TeacherProfilePopover({
  teacher,
  locale,
  children,
}: TeacherProfilePopoverProps) {
  const [open, setOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span 
          className="cursor-pointer hover:text-[#007FFF] transition-colors"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="start"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="relative">
          {/* Header with gradient */}
          <div className="h-20 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-t-lg"></div>

          {/* Profile Picture */}
          <div className="absolute top-10 left-6">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={teacher.photo || undefined} alt={teacher.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#007FFF] to-[#17224D] text-white text-lg font-bold">
                {getInitials(teacher.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content */}
          <div className="pt-14 px-6 pb-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#17224D] mb-1">
                {teacher.name}
              </h3>
              {teacher.spec && (
                <div className="flex items-center gap-1.5 text-sm text-[#363942]/70">
                  <Award className="w-4 h-4" />
                  <span>{teacher.spec}</span>
                </div>
              )}
            </div>

            {teacher.bio && (
              <p className="text-sm text-[#363942] mb-4 line-clamp-3">
                {teacher.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-[#F4F5F7] rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#007FFF]" />
                </div>
                <div>
                  <p className="text-xs text-[#363942]/70">
                    <Trans>Courses</Trans>
                  </p>
                  <p className="text-sm font-bold text-[#17224D]">
                    {teacher.courseCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#007FFF]" />
                </div>
                <div>
                  <p className="text-xs text-[#363942]/70">
                    <Trans>Instructor</Trans>
                  </p>
                  <p className="text-sm font-bold text-[#17224D]">
                    <Trans>Expert</Trans>
                  </p>
                </div>
              </div>
            </div>

            {/* View Profile Button */}
            <Link
              href={`/${locale}/student/instructors/${teacher.id}`}
              onClick={() => setOpen(false)}
            >
              <Button className="w-full gap-2" size="sm">
                <Trans>View Full Profile</Trans>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
