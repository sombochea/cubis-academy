'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trans } from '@lingui/react/macro';

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  desc: z.string(),
  category: z.string(),
  teacherId: z.string(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  duration: z.string().regex(/^\d+$/, 'Duration must be a number'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  youtubeUrl: z.string(),
  zoomUrl: z.string(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  locale: string;
  teachers: Array<{ userId: string; name: string }>;
  initialData?: Partial<CourseFormData>;
  courseId?: string;
}

export function CourseForm({ locale, teachers, initialData, courseId }: CourseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      desc: initialData?.desc || '',
      category: initialData?.category || '',
      teacherId: initialData?.teacherId || '',
      price: initialData?.price || '0',
      duration: initialData?.duration || '0',
      level: (initialData?.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      youtubeUrl: initialData?.youtubeUrl || '',
      zoomUrl: initialData?.zoomUrl || '',
    },
    validators: {
      onChange: courseSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(false);

      try {
        const endpoint = courseId 
          ? `/api/admin/courses/${courseId}` 
          : '/api/admin/courses';
        
        const method = courseId ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save course');
        }

        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/admin/courses`);
          router.refresh();
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <Trans>Course saved successfully! Redirecting...</Trans>
        </div>
      )}

      <form.Field name="title">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Course Title</Trans> <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

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
              rows={4}
            />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form.Field name="category">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Category</Trans>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Web Development"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="teacherId">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Assign Teacher</Trans>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <Trans>No teacher assigned</Trans>
                  </SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.userId} value={teacher.userId}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form.Field name="price">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Price ($)</Trans> <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="duration">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Duration (hours)</Trans> <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="level">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Level</Trans> <span className="text-red-500">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as 'beginner' | 'intermediate' | 'advanced')}
              >
                <SelectTrigger>
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

      <form.Field name="youtubeUrl">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>YouTube URL</Trans>
            </Label>
            <Input
              id={field.name}
              type="url"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://youtube.com/..."
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="zoomUrl">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Zoom URL</Trans>
            </Label>
            <Input
              id={field.name}
              type="url"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://zoom.us/..."
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <div className="flex gap-4">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#007FFF] to-[#17224D] hover:shadow-xl"
            >
              {isSubmitting ? <Trans>Saving...</Trans> : <Trans>Save Course</Trans>}
            </Button>
          )}
        </form.Subscribe>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/courses`)}
          className="flex-1"
        >
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </form>
  );
}
