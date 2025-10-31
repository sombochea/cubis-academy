'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Trans } from '@lingui/react/macro';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  BookOpen,
  DollarSign,
  Clock,
  Loader2,
  Save,
  Tag,
  BarChart3,
  Truck,
  MapPin,
  Youtube,
  Video,
  Power,
} from 'lucide-react';

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message;
  }
  return 'Invalid value';
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CourseCreateFormProps {
  categories: Category[];
  locale: string;
}

// Validation schema
const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  desc: z.string(),
  category: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.string(),
  duration: z.string(),
  deliveryMode: z.enum(['online', 'face_to_face', 'hybrid']),
  location: z.string(),
  youtubeUrl: z.string().refine(
    (val) => {
      if (!val || val === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid YouTube URL' }
  ),
  zoomUrl: z.string().refine(
    (val) => {
      if (!val || val === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid Zoom URL' }
  ),
  isActive: z.boolean(),
});

export function CourseCreateForm({ categories, locale }: CourseCreateFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const form = useForm({
    defaultValues: {
      title: '',
      desc: '',
      category: categories[0]?.slug || '',
      level: 'beginner' as const,
      price: '0',
      duration: '',
      deliveryMode: 'online' as const,
      location: '',
      youtubeUrl: '',
      zoomUrl: '',
      isActive: true,
    },
    validators: {
      onChange: courseSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setMessage(null);

        const response = await fetch('/api/teacher/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create course');
        }

        const data = await response.json();

        setMessage({
          type: 'success',
          text: 'Course created successfully!',
        });

        // Redirect to course details after 1.5 seconds
        setTimeout(() => {
          router.push(`/${locale}/teacher/courses/${data.courseId}`);
        }, 1500);
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Failed to create course',
        });
      }
    },
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="p-6 sm:p-8 space-y-8"
      >
        {/* Success/Error Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#17224D]">
              <Trans>Basic Information</Trans>
            </h2>
          </div>

          {/* Title */}
          <form.Field name="title">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#007FFF]" />
                  <Trans>Course Title</Trans> *
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Web Development Fundamentals"
                  className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Description */}
          <form.Field name="desc">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  <Trans>Description</Trans>
                </Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe what students will learn..."
                  rows={4}
                  className="border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors resize-none"
                />
              </div>
            )}
          </form.Field>

          {/* Category and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category */}
            <form.Field name="category">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Category</Trans>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger className="w-full !h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            {/* Level */}
            <form.Field name="level">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Level</Trans> *
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger className="w-full !h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
              )}
            </form.Field>
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Price */}
            <form.Field name="price">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Price (USD)</Trans>
                  </Label>
                  <Input
                    id={field.name}
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="0.00"
                    className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors"
                  />
                </div>
              )}
            </form.Field>

            {/* Duration */}
            <form.Field name="duration">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Duration</Trans>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., 8 weeks, 40 hours"
                    className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors"
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#17224D]">
              <Trans>Delivery Settings</Trans>
            </h2>
          </div>

          {/* Delivery Mode and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Delivery Mode */}
            <form.Field name="deliveryMode">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Delivery Mode</Trans>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger className="w-full !h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">
                        <Trans>Online</Trans>
                      </SelectItem>
                      <SelectItem value="face_to_face">
                        <Trans>Face-to-Face</Trans>
                      </SelectItem>
                      <SelectItem value="hybrid">
                        <Trans>Hybrid</Trans>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            {/* Location */}
            <form.Field name="location">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Location</Trans>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Room 301, Building A"
                    className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* YouTube and Zoom URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* YouTube URL */}
            <form.Field name="youtubeUrl">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-[#007FFF]" />
                    <Trans>YouTube URL</Trans>
                  </Label>
                  <Input
                    id={field.name}
                    type="url"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">
                      {getErrorMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Zoom URL */}
            <form.Field name="zoomUrl">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Zoom URL</Trans>
                  </Label>
                  <Input
                    id={field.name}
                    type="url"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://zoom.us/..."
                    className="h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">
                      {getErrorMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Power className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#17224D]">
              <Trans>Status</Trans>
            </h2>
          </div>

          {/* Active Status */}
          <form.Field name="isActive">
            {(field) => (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={field.name} className="text-base font-medium">
                    <Trans>Active Course</Trans>
                  </Label>
                  <p className="text-sm text-[#363942]/70 mt-1">
                    <Trans>Make this course visible to students</Trans>
                  </p>
                </div>
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/teacher/courses`)}
            className="h-11"
          >
            <Trans>Cancel</Trans>
          </Button>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="gap-2 h-11 bg-gradient-to-r from-[#007FFF] to-[#17224D] hover:from-[#0066CC] hover:to-[#17224D] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <Trans>Creating...</Trans>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <Trans>Create Course</Trans>
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
