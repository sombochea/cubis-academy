'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { 
  BookOpen, 
  Play,
  Video,
  ExternalLink,
  TrendingUp,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TeacherProfilePopover } from './TeacherProfilePopover';

type Enrollment = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseDesc: string | null;
  courseCategory: string | null;
  courseLevel: 'beginner' | 'intermediate' | 'advanced';
  coursePrice: string;
  courseDuration: string | null;
  youtubeUrl: string | null;
  zoomUrl: string | null;
  teacherId: string | null;
  teacherName: string | null;
  teacherPhoto: string | null;
  teacherBio: string | null;
  teacherSpec: string | null;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  enrolled: Date;
  completed: Date | null;
};

interface MyCoursesGridProps {
  enrollments: Enrollment[];
  locale: string;
  teacherCourseCountsMap?: Map<string, number>;
}

export function MyCoursesGrid({ enrollments, locale, teacherCourseCountsMap = new Map() }: MyCoursesGridProps) {
  // Split enrollments into sections
  const { inProgress, completed } = useMemo(() => {
    const inProgress = enrollments.filter(e => e.status === 'active');
    const completed = enrollments.filter(e => e.status === 'completed' || e.status === 'dropped');
    return { inProgress, completed };
  }, [enrollments]);

  return (
    <div className="space-y-8">
      {/* In Progress Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#007FFF]" />
          <h3 className="text-xl font-semibold text-[#17224D]">
            <Trans>In Progress</Trans>
          </h3>
          <span className="text-sm text-[#363942]/70">({inProgress.length})</span>
        </div>
        
        {inProgress.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <BookOpen className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
            <p className="text-[#363942]/70 mb-4">
              <Trans>No courses in progress</Trans>
            </p>
            <Link href={`/${locale}/student/courses`}>
              <Button size="sm">
                <Trans>Browse Courses</Trans>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} locale={locale} teacherCourseCountsMap={teacherCourseCountsMap} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Section */}
      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-semibold text-[#17224D]">
              <Trans>Completed</Trans>
            </h3>
            <span className="text-sm text-[#363942]/70">({completed.length})</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} locale={locale} teacherCourseCountsMap={teacherCourseCountsMap} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({ enrollment, locale, teacherCourseCountsMap }: { enrollment: Enrollment; locale: string; teacherCourseCountsMap: Map<string, number> }) {
  const levelConfig = {
    beginner: { label: <Trans>Beginner</Trans>, color: 'bg-green-100 text-green-700' },
    intermediate: { label: <Trans>Intermediate</Trans>, color: 'bg-yellow-100 text-yellow-700' },
    advanced: { label: <Trans>Advanced</Trans>, color: 'bg-red-100 text-red-700' },
  };

  const level = levelConfig[enrollment.courseLevel];
  const isCompleted = enrollment.status === 'completed';
  const isDropped = enrollment.status === 'dropped';

  return (
    <Link href={`/${locale}/student/enrollments/${enrollment.id}`}>
      <div className="group bg-white rounded-lg border border-gray-200 hover:border-[#007FFF] transition-all hover:shadow-md p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#17224D] text-base mb-1 line-clamp-2 group-hover:text-[#007FFF] transition-colors">
              {enrollment.courseTitle}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {enrollment.courseCategory && (
                <span className="text-xs text-[#363942]/70 capitalize">
                  {enrollment.courseCategory}
                </span>
              )}
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${level.color}`}>
                {level.label}
              </span>
            </div>
          </div>
          {isCompleted && (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
          )}
          {isDropped && (
            <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
          )}
        </div>

        {/* Instructor */}
        {enrollment.teacherName && enrollment.teacherId && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <User className="w-3.5 h-3.5 text-[#007FFF]" />
            <TeacherProfilePopover
              teacher={{
                id: enrollment.teacherId,
                name: enrollment.teacherName,
                photo: enrollment.teacherPhoto,
                bio: enrollment.teacherBio,
                spec: enrollment.teacherSpec,
                courseCount: teacherCourseCountsMap.get(enrollment.teacherId) || 0,
              }}
              locale={locale}
            >
              <span className="text-xs font-medium text-[#363942] hover:text-[#007FFF] transition-colors cursor-pointer">
                {enrollment.teacherName}
              </span>
            </TeacherProfilePopover>
          </div>
        )}

        {/* Progress */}
        {!isCompleted && !isDropped && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#363942]/70">
                <Trans>Progress</Trans>
              </span>
              <span className="text-xs font-semibold text-[#007FFF]">
                {enrollment.progress}%
              </span>
            </div>
            <Progress value={enrollment.progress} className="h-1.5" />
          </div>
        )}

        {/* Material Links */}
        {(enrollment.youtubeUrl || enrollment.zoomUrl) && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {enrollment.youtubeUrl && (
              <a
                href={enrollment.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                title="Watch on YouTube"
              >
                <Play className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </a>
            )}
            {enrollment.zoomUrl && (
              <a
                href={enrollment.zoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                title="Join Zoom"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Zoom</span>
              </a>
            )}
            <div className="ml-auto">
              <ExternalLink className="w-3.5 h-3.5 text-[#363942]/40 group-hover:text-[#007FFF] transition-colors" />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
