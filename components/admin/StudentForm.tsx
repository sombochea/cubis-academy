'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Trans } from '@lingui/react/macro';
import { Loader2 } from 'lucide-react';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  photo: z.string().optional(),
});

interface StudentFormProps {
  locale: string;
  studentId?: string;
  initialData?: {
    name: string;
    email: string;
    phone: string;
    password: string;
    dob: string;
    gender: string;
    address: string;
    photo: string;
  };
}

export function StudentForm({ locale, studentId, initialData }: StudentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState(initialData?.photo || '');
  const isEditing = !!studentId;

  const form = useForm({
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      password: '',
      dob: '',
      gender: '',
      address: '',
      photo: '',
    },
    validators: {
      onChange: isEditing 
        ? studentSchema.omit({ password: true }).extend({ 
            password: z.string().optional().or(z.literal(''))
          })
        : studentSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const url = isEditing 
          ? `/api/admin/students/${studentId}`
          : '/api/admin/students';
        
        const method = isEditing ? 'PUT' : 'POST';
        
        // Remove empty password when editing
        const submitData = { ...value, photo: photoUrl };
        if (isEditing && (!submitData.password || submitData.password.trim() === '')) {
          delete submitData.password;
        }
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save student');
        }

        router.push(`/${locale}/admin/students`);
        router.refresh();
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label><Trans>Profile Photo</Trans></Label>
        <ImageUpload
          currentImage={photoUrl}
          onUploadComplete={(url) => setPhotoUrl(url)}
          category="profile"
        />
      </div>

      {/* Name */}
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
              <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Email */}
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
              disabled={isEditing}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Phone */}
      <form.Field name="phone">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}><Trans>Phone Number</Trans></Label>
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

      {/* Password */}
      <form.Field name="password">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Password</Trans> {!isEditing && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              placeholder={isEditing ? 'Leave blank to keep current password' : ''}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Date of Birth */}
      <form.Field name="dob">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}><Trans>Date of Birth</Trans></Label>
            <Input
              id={field.name}
              type="date"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      {/* Gender */}
      <form.Field name="gender">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}><Trans>Gender</Trans></Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male"><Trans>Male</Trans></SelectItem>
                <SelectItem value="female"><Trans>Female</Trans></SelectItem>
                <SelectItem value="other"><Trans>Other</Trans></SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      {/* Address */}
      <form.Field name="address">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}><Trans>Address</Trans></Label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </form.Field>

      {/* Submit Button */}
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Saving...</Trans>
                </>
              ) : isEditing ? (
                <Trans>Update Student</Trans>
              ) : (
                <Trans>Create Student</Trans>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              <Trans>Cancel</Trans>
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
