'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { 
  BookOpen, 
  Clock, 
  DollarSign, 
  User,
  Search,
  Filter,
  Grid3x3,
  List
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TeacherProfilePopover } from './TeacherProfilePopover';

type Course = {
  id: string;
  title: string;
  desc: string | null;
  category: string | null;
  price: string;
  duration: number | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  teacherId: string | null;
  teacherName: string | null;
  teacherPhoto: string | null;
  teacherBio: string | null;
  teacherSpec: string | null;
};

interface CoursesGridProps {
  courses: Course[];
  locale: string;
  teacherCourseCountsMap?: Map<string, number>;
}

export function CoursesGrid({ courses, locale, teacherCourseCountsMap = new Map() }: CoursesGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(courses.map(c => c.category).filter(Boolean));
    return Array.from(cats);
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Search filter
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && course.category !== categoryFilter) {
        return false;
      }

      // Level filter
      if (levelFilter !== 'all' && course.level !== levelFilter) {
        return false;
      }

      // Price filter
      if (priceFilter === 'free' && Number(course.price) > 0) {
        return false;
      }
      if (priceFilter === 'paid' && Number(course.price) === 0) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery, categoryFilter, levelFilter, priceFilter]);

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <Trans>All Categories</Trans>
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat!}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <Trans>All Levels</Trans>
              </SelectItem>
              <SelectItem value="beginner">
                <Trans>Beginner</Trans>
              </SelectItem>
              <SelectItem value="intermediate">
                <Trans>Intermediate</Trans>
              </SelectItem>
              <SelectItem value="advanced">
                <Trans>Advanced</Trans>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Price Filter */}
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <Trans>All Prices</Trans>
              </SelectItem>
              <SelectItem value="free">
                <Trans>Free</Trans>
              </SelectItem>
              <SelectItem value="paid">
                <Trans>Paid</Trans>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-[#363942]/70">
          <Trans>Showing {filteredCourses.length} of {courses.length} courses</Trans>
        </div>
      </div>

      {/* Courses Grid/List */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <BookOpen className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#17224D] mb-2">
            <Trans>No courses found</Trans>
          </h3>
          <p className="text-[#363942]/70">
            <Trans>Try adjusting your filters to see more results</Trans>
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} locale={locale} teacherCourseCountsMap={teacherCourseCountsMap} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseListItem key={course.id} course={course} locale={locale} teacherCourseCountsMap={teacherCourseCountsMap} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, locale, teacherCourseCountsMap }: { course: Course; locale: string; teacherCourseCountsMap: Map<string, number> }) {
  const isFree = Number(course.price) === 0;

  return (
    <Link href={`/${locale}/student/courses/${course.id}`}>
      <div className="group bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-[#007FFF] hover:shadow-xl transition-all cursor-pointer">
        {/* Course Header - Clean Design */}
        <div className="relative p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            {isFree ? (
              <span className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold shadow-sm">
                <Trans>FREE</Trans>
              </span>
            ) : (
              <div className="text-right">
                <div className="text-xs text-[#363942]/60 mb-0.5">
                  <Trans>Price</Trans>
                </div>
                <div className="text-2xl font-bold text-[#007FFF]">
                  ${Number(course.price).toFixed(2)}
                </div>
              </div>
            )}
          </div>
          
          {/* Level Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
              course.level === 'beginner'
                ? 'bg-green-500 text-white'
                : course.level === 'intermediate'
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              <Trans>{course.level}</Trans>
            </span>
            {course.category && (
              <span className="text-xs text-[#363942]/70 font-medium">
                {course.category}
              </span>
            )}
          </div>
        </div>

        {/* Course Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-[#17224D] mb-2 line-clamp-2 group-hover:text-[#007FFF] transition-colors">
            {course.title}
          </h3>

          {course.desc && (
            <p className="text-sm text-[#363942]/70 mb-4 line-clamp-2">
              {course.desc}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-4 text-xs text-[#363942]/70">
            {course.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{course.duration}h</span>
              </span>
            )}
          </div>

          {/* Instructor */}
          {course.teacherName && course.teacherId && (
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 bg-[#007FFF]/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-[#007FFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#363942]/60 mb-0.5">
                  <Trans>Instructor</Trans>
                </div>
                <TeacherProfilePopover
                  teacher={{
                    id: course.teacherId,
                    name: course.teacherName,
                    photo: course.teacherPhoto,
                    bio: course.teacherBio,
                    spec: course.teacherSpec,
                    courseCount: teacherCourseCountsMap.get(course.teacherId) || 0,
                  }}
                  locale={locale}
                >
                  <span 
                    className="text-sm font-semibold text-[#17224D] hover:text-[#007FFF] transition-colors cursor-pointer truncate block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {course.teacherName}
                  </span>
                </TeacherProfilePopover>
              </div>
              <svg 
                className="w-5 h-5 text-[#363942]/30 group-hover:text-[#007FFF] group-hover:translate-x-1 transition-all flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function CourseListItem({ course, locale, teacherCourseCountsMap }: { course: Course; locale: string; teacherCourseCountsMap: Map<string, number> }) {
  const isFree = Number(course.price) === 0;

  return (
    <Link href={`/${locale}/student/courses/${course.id}`}>
      <div className="group bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-[#007FFF] hover:shadow-lg transition-all cursor-pointer flex items-center gap-6">
        {/* Course Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <BookOpen className="w-10 h-10 text-white" />
        </div>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-[#17224D] mb-2 group-hover:text-[#007FFF] transition-colors">
                {course.title}
              </h3>
              {course.desc && (
                <p className="text-sm text-[#363942]/70 line-clamp-2 mb-3">
                  {course.desc}
                </p>
              )}
            </div>
            {isFree ? (
              <span className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold ml-4 flex-shrink-0">
                <Trans>FREE</Trans>
              </span>
            ) : (
              <div className="text-right ml-4 flex-shrink-0">
                <div className="text-xs text-[#363942]/60 mb-0.5">
                  <Trans>Price</Trans>
                </div>
                <div className="text-2xl font-bold text-[#007FFF]">
                  ${Number(course.price).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              course.level === 'beginner'
                ? 'bg-green-500 text-white'
                : course.level === 'intermediate'
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              <Trans>{course.level}</Trans>
            </span>
            {course.category && (
              <span className="text-[#363942]/70 font-medium">{course.category}</span>
            )}
            {course.duration && (
              <span className="flex items-center gap-1.5 text-[#363942]/70">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{course.duration}h</span>
              </span>
            )}
            {course.teacherName && course.teacherId && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#007FFF]/10 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#007FFF]" />
                </div>
                <TeacherProfilePopover
                  teacher={{
                    id: course.teacherId,
                    name: course.teacherName,
                    photo: course.teacherPhoto,
                    bio: course.teacherBio,
                    spec: course.teacherSpec,
                    courseCount: teacherCourseCountsMap.get(course.teacherId) || 0,
                  }}
                  locale={locale}
                >
                  <span 
                    className="text-sm font-semibold text-[#17224D] hover:text-[#007FFF] transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {course.teacherName}
                  </span>
                </TeacherProfilePopover>
              </div>
            )}
          </div>
        </div>

        {/* Arrow Icon */}
        <svg 
          className="w-6 h-6 text-[#363942]/30 group-hover:text-[#007FFF] group-hover:translate-x-1 transition-all flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
