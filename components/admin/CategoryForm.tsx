'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trans } from '@lingui/react/macro';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  locale: string;
  initialData?: Partial<CategoryFormData>;
  categoryId?: string;
}

const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'Invalid value';
};

export function CategoryForm({ locale, initialData, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      icon: initialData?.icon || '',
      color: initialData?.color || '#007FFF',
    },
    validators: {
      onChange: categorySchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(false);

      try {
        const endpoint = categoryId 
          ? `/api/admin/categories/${categoryId}` 
          : '/api/admin/categories';
        
        const method = categoryId ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save category');
        }

        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/admin/categories`);
          router.refresh();
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    form.setFieldValue('name', name);
    if (!categoryId) { // Only auto-generate for new categories
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setFieldValue('slug', slug);
    }
  };

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
          <Trans>Category saved successfully! Redirecting...</Trans>
        </div>
      )}

      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Category Name</Trans> <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Web Development"
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="slug">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Slug</Trans> <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., web-development"
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              <Trans>URL-friendly identifier (lowercase, hyphens only)</Trans>
            </p>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="description">
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
              rows={3}
              placeholder="Brief description of this category..."
            />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form.Field name="icon">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Icon (Emoji)</Trans>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="📚"
                maxLength={2}
              />
              <p className="text-xs text-gray-500">
                <Trans>Single emoji character</Trans>
              </p>
            </div>
          )}
        </form.Field>

        <form.Field name="color">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Color</Trans>
              </Label>
              <div className="flex gap-2">
                <Input
                  id={field.name}
                  type="color"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="#007FFF"
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex gap-4">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#007FFF] to-[#17224D] hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Saving...</Trans>
                </>
              ) : (
                <Trans>Save Category</Trans>
              )}
            </Button>
          )}
        </form.Subscribe>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/categories`)}
          className="flex-1"
        >
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </form>
  );
}
