'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trans } from '@lingui/react/macro';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

// Schema for users with existing password
const passwordSchemaWithCurrent = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Schema for OAuth users setting password for first time
const passwordSchemaWithoutCurrent = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordChangeFormProps {
  locale: string;
  hasPassword?: boolean; // If false, user is OAuth-only and setting password for first time
}

const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'Invalid value';
};

export function PasswordChangeForm({ locale, hasPassword = true }: PasswordChangeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [revokedSessions, setRevokedSessions] = useState<number>(0);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Use different schema based on whether user has existing password
  const schema = hasPassword ? passwordSchemaWithCurrent : passwordSchemaWithoutCurrent;

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(false);
      setRevokedSessions(0);

      try {
        const response = await fetch('/api/profile/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to change password');
        }

        setSuccess(true);
        setRevokedSessions(data.revokedSessions || 0);
        form.reset();
        
        // Keep success message visible longer
        setTimeout(() => {
          setSuccess(false);
          setRevokedSessions(0);
        }, 5000);
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
      className="space-y-4"
    >
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm space-y-2">
          <p className="font-semibold">
            <Trans>Password changed successfully!</Trans>
          </p>
          {revokedSessions > 0 && (
            <p className="text-xs">
              <Trans>
                {revokedSessions} other session{revokedSessions !== 1 ? 's' : ''} logged out for security. 
                A notification email has been sent.
              </Trans>
            </p>
          )}
          {revokedSessions === 0 && (
            <p className="text-xs">
              <Trans>A notification email has been sent to your email address.</Trans>
            </p>
          )}
        </div>
      )}

      {hasPassword && (
        <form.Field name="currentPassword">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Current Password</Trans> <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id={field.name}
                  type={showCurrent ? 'text' : 'password'}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>
      )}

      {!hasPassword && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <Trans>You signed in with Google. Set a password to enable password login.</Trans>
        </div>
      )}

      <form.Field name="newPassword">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>New Password</Trans> <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id={field.name}
                type={showNew ? 'text' : 'password'}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
            )}
            <p className="text-xs text-gray-500">
              <Trans>Minimum 6 characters</Trans>
            </p>
          </div>
        )}
      </form.Field>

      <form.Field name="confirmPassword">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              <Trans>Confirm New Password</Trans> <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id={field.name}
                type={showConfirm ? 'text' : 'password'}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{getErrorMessage(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full bg-gradient-to-r from-green-500 to-green-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <Trans>Changing...</Trans>
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                <Trans>Change Password</Trans>
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
