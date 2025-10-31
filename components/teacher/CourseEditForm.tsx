'use client';

import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { Trans } from '@lingui/react/macro';
import {
  BookOpen,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  MapPin,
  Monitor,
  Youtube,
  Video,
  Tag,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CourseCategory {
  id: string;
  name: string;
  slug: string;
}

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  desc: z.any().transform(val => val?.toString() || ''),
  category: z.any().transform(val => val?.toString() || ''),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.any().transform(val => val?.toString() || ''),
  duration: z.any().transform(val => val?.toString() || ''),
  deliveryMode: z.enum(['online', 'face_to_face', 'hybrid']),
  location: z.any().transform(val => val?.toString() || ''),
  youtubeUrl: z.any().transform(val => val?.toString() || '').refine(
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
  zoomUrl: z.any().transform(val => val?.toString() || '').refine(
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

type CourseFormData = z.infer<typeof courseSchema>;

interface Course {
  id: string;
  title: string;
  desc: string | null;
  category: string | null;
  categoryId: string | null;
  categorySlug: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: string | null;
  duration: string | null;
  deliveryMode: 'online' | 'face_to_face' | 'hybrid' | null;
  location: string | null;
  youtubeUrl: string | null;
  zoomUrl: string | null;
  isActive: boolean;
}

interface CourseEditFormProps {
  course: Course;
  categories: CourseCategory[];
  locale: string;
}

const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'Invalid value';
};

export function CourseEditForm({ course, categories, locale }: CourseEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      title: course.title,
      desc: course.desc || '',
      category: course.categorySlug || course.category || '',
      level: course.level,
      price: course.price || '',
      duration: course.duration || '',
      deliveryMode: course.deliveryMode || 'online' as const,
      location: course.location || '',
      youtubeUrl: course.youtubeUrl || '',
      zoomUrl: course.zoomUrl || '',
      isActive: course.isActive,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(false);

      // Validate before submitting
      const validation = courseSchema.safeParse(value);
      if (!validation.success) {
        // Show all validation errors for debugging
        const errorMessages = validation.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        console.error('Validation errors:', validation.error.issues);
        console.log('Form values:', value);
        setError(`Validation failed: ${errorMessages}`);
        return;
      }

      try {
        const response = await fetch(`/api/teacher/courses/${course.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update course');
        }

        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/teacher/courses/${course.id}`);
          router.refresh();
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update course. Please try again.');
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="p-6 sm:p-8 space-y-8"
    >
      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">
            <Trans>Course updated successfully!</Trans>
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-[#17224D]">
            <Trans>Basic Information</Trans>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <form.Field name="title">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                    <Trans>Course Title</Trans> <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Full-Stack Web Development"
                      className="pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors"
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">
                      {getErrorMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="md:col-span-2">
            <form.Field name="desc">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                    <Trans>Description</Trans>
                  </Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Describe what students will learn in this course..."
                    rows={4}
                    className="resize-none border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors"
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="category">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#17224D]">
                  <Trans>Category</Trans>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger className="w-full !h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors">
                    <SelectValue placeholder="Select category" />
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

          <form.Field name="level">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#17224D]">
                  <Trans>Level</Trans> <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as 'beginner' | 'intermediate' | 'advanced')}
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

          <form.Field name="price">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                  <Trans>Price ($)</Trans>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                  <Input
                    id={field.name}
                    type="number"
                    step="0.01"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="0.00"
                    className="pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors"
                  />
                </div>
              </div>
            )}
          </form.Field>

          <form.Field name="duration">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                  <Trans>Duration</Trans>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., 8 weeks, 40 hours"
                    className="pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors"
                  />
                </div>
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-[#17224D]">
            <Trans>Delivery Settings</Trans>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="deliveryMode">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#17224D]">
                  <Trans>Delivery Mode</Trans>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as 'online' | 'face_to_face' | 'hybrid')}
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

          <form.Field name="location">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                  <Trans>Location</Trans>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Physical location (if applicable)"
                    className="pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors"
                  />
                </div>
              </div>
            )}
          </form.Field>

          <form.Field name="youtubeUrl">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                  <Trans>YouTube URL</Trans>
                </Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                  <Input
                    id={field.name}
                    type="url"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors"
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="zoomUrl">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                  <Trans>Zoom URL</Trans>
                </Label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                  <Input
                    id={field.name}
                    type="url"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://zoom.us/..."
                    className="pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors"
                  />
                </div>
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
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-[#17224D]">
            <Trans>Status</Trans>
          </h3>
        </div>

        <form.Field name="isActive">
          {(field) => (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-0.5">
                <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D] cursor-pointer">
                  <Trans>Course is active and visible to students</Trans>
                </Label>
                <p className="text-xs text-[#363942]/70">
                  <Trans>Inactive courses will not be visible in the course catalog</Trans>
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

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={form.state.isSubmitting}
          className="h-11"
        >
          <Trans>Cancel</Trans>
        </Button>
        
        <form.Subscribe selector={(state) => [state.isSubmitting]}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 h-11 bg-gradient-to-r from-[#007FFF] to-[#17224D]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <Trans>Saving...</Trans>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <Trans>Save Changes</Trans>
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
