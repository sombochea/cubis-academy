'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Trans } from '@lingui/react/macro';

// Helper to extract error message
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.toString) return error.toString();
  return 'Invalid value';
};

const teacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string(),
  spec: z.string(),
  photo: z.string(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  locale: string;
  initialData?: Partial<TeacherFormData>;
  teacherId?: string;
}

export function TeacherForm({ locale, initialData, teacherId }: TeacherFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      password: '',
      bio: initialData?.bio || '',
      spec: initialData?.spec || '',
      photo: initialData?.photo || '',
    },
    validators: {
      onChange: teacherSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(false);

      try {
        const endpoint = teacherId 
          ? `/api/admin/teachers/${teacherId}` 
          : '/api/admin/teachers';
        
        const method = teacherId ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save teacher');
        }

        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/admin/teachers`);
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
          <Trans>Teacher saved successfully! Redirecting...</Trans>
        </div>
      )}

      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Full Name</Trans> <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Email</Trans> <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              disabled={!!teacherId}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="phone">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Phone</Trans>
            </Label>
            <Input
              id={field.name}
              type="tel"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      {!teacherId && (
        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Password</Trans> <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>
      )}

      <form.Field name="spec">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Specialization</Trans>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Web Development, UX/UI Design"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="bio">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Biography</Trans>
            </Label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={4}
              placeholder="Brief description about the teacher..."
            />
          </div>
        )}
      </form.Field>

      <form.Field name="photo">
        {(field) => (
          <div className="space-y-2">
            <Label>
              <Trans>Profile Photo</Trans>
            </Label>
            <ImageUpload
              currentImage={field.state.value}
              onUploadComplete={(fileUrl) => field.handleChange(fileUrl)}
              category="profile"
            />
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
              {isSubmitting ? <Trans>Saving...</Trans> : <Trans>Save Teacher</Trans>}
            </Button>
          )}
        </form.Subscribe>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/teachers`)}
          className="flex-1"
        >
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </form>
  );
}
