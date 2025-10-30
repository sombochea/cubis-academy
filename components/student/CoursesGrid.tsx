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

type Course = {
  id: string;
  title: string;
  desc: string | null;
  category: string | null;
  price: string;
  duration: number | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  teacherName: string | null;
  teacherSpec: string | null;
};

interface CoursesGridProps {
  courses: Course[];
  locale: string;
}

export function CoursesGrid({ courses, locale }: CoursesGridProps) {
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
            <CourseCard key={course.id} course={course} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseListItem key={course.id} course={course} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, locale }: { course: Course; locale: string }) {
  const isFree = Number(course.price) === 0;

  return (
    <Link
      href={`/${locale}/student/courses/${course.id}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Course Header */}
      <div className="bg-gradient-to-br from-[#007FFF] to-[#17224D] p-6 text-white">
        <div className="flex items-start justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            course.level === 'beginner'
              ? 'bg-green-500/20 text-green-100'
              : course.level === 'intermediate'
              ? 'bg-yellow-500/20 text-yellow-100'
              : 'bg-red-500/20 text-red-100'
          }`}>
            <Trans>{course.level}</Trans>
          </span>
          {isFree ? (
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
              <Trans>FREE</Trans>
            </span>
          ) : (
            <span className="text-2xl font-bold">${Number(course.price).toFixed(2)}</span>
          )}
        </div>
        <h3 className="text-xl font-bold line-clamp-2">{course.title}</h3>
      </div>

      {/* Course Body */}
      <div className="p-6">
        <p className="text-sm text-[#363942]/70 mb-4 line-clamp-2">
          {course.desc || <Trans>No description available</Trans>}
        </p>

        <div className="space-y-2 mb-4">
          {course.category && (
            <div className="flex items-center gap-2 text-sm text-[#363942]">
              <BookOpen className="w-4 h-4 text-[#007FFF]" />
              <span>{course.category}</span>
            </div>
          )}
          {course.duration && (
            <div className="flex items-center gap-2 text-sm text-[#363942]">
              <Clock className="w-4 h-4 text-[#007FFF]" />
              <span>{course.duration}h</span>
            </div>
          )}
          {course.teacherName && (
            <div className="flex items-center gap-2 text-sm text-[#363942]">
              <User className="w-4 h-4 text-[#007FFF]" />
              <span>{course.teacherName}</span>
            </div>
          )}
        </div>

        <button className="w-full py-2 px-4 bg-[#007FFF] text-white rounded-lg hover:bg-[#007FFF]/90 transition-colors font-medium">
          <Trans>View Details</Trans>
        </button>
      </div>
    </Link>
  );
}

function CourseListItem({ course, locale }: { course: Course; locale: string }) {
  const isFree = Number(course.price) === 0;

  return (
    <Link
      href={`/${locale}/student/courses/${course.id}`}
      className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow flex items-center gap-6"
    >
      {/* Course Icon */}
      <div className="w-24 h-24 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-12 h-12 text-white" />
      </div>

      {/* Course Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#17224D] mb-1">{course.title}</h3>
            <p className="text-sm text-[#363942]/70 line-clamp-2">{course.desc}</p>
          </div>
          {isFree ? (
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold ml-4">
              <Trans>FREE</Trans>
            </span>
          ) : (
            <span className="text-2xl font-bold text-[#007FFF] ml-4">${Number(course.price).toFixed(2)}</span>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm text-[#363942]">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            course.level === 'beginner'
              ? 'bg-green-100 text-green-700'
              : course.level === 'intermediate'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            <Trans>{course.level}</Trans>
          </span>
          {course.category && <span>{course.category}</span>}
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration}h
            </span>
          )}
          {course.teacherName && (
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {course.teacherName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
