'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trans } from '@lingui/react/macro';
import { Loader2, Upload, User, AlertTriangle, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarGradient, getInitials } from '@/lib/avatar-utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  photo: z.string().optional(),
  // Student-specific fields
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: any;
  roleData: any;
  locale: string;
}

const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'Invalid value';
};

export function ProfileForm({ user, roleData }: ProfileFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photo || roleData?.photo || null);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [pendingValues, setPendingValues] = useState<ProfileFormData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const form = useForm({
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      photo: user.photo || roleData?.photo || '',
      // Student-specific fields
      dob: roleData?.dob || '',
      gender: roleData?.gender || '',
      address: roleData?.address || '',
    },
    validators: {
      onChange: profileSchema as any,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(false);

      // Check if email is being changed
      if (value.email !== user.email) {
        setPendingValues(value);
        setShowEmailConfirm(true);
        return;
      }

      await submitProfile(value);
    },
  });

  const handlePhotoUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'profile');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      form.setFieldValue('photo', data.fileUrl);
      setPhotoPreview(data.fileUrl);
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const submitProfile = async (value: ProfileFormData) => {
    try {
      console.log('📤 Submitting profile with data:', value);
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      console.log('✅ Profile updated successfully');
      
      // Update session with new data
      await updateSession({
        name: value.name,
        email: value.email,
        picture: value.photo,
      });
      
      console.log('✅ Session updated');
      
      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('❌ Profile update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEmailConfirm = async () => {
    if (!pendingValues) return;

    setShowEmailConfirm(false);
    setIsSendingCode(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/request-email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: pendingValues.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setShowVerifyCode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPendingValues(null);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!pendingValues || !verificationCode) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/verify-email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          name: pendingValues.name,
          phone: pendingValues.phone,
          photo: pendingValues.photo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      setSuccess(true);
      setShowVerifyCode(false);
      setPendingValues(null);
      setVerificationCode('');

      setTimeout(() => {
        router.refresh();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      {/* Email Change Confirmation Dialog */}
      <AlertDialog open={showEmailConfirm} onOpenChange={setShowEmailConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <Trans>Confirm Email Change</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>You are about to change your email from</Trans>
              <br />
              <strong className="text-[#17224D]">{user.email}</strong>
              <br />
              <Trans>to</Trans>
              <br />
              <strong className="text-[#17224D]">{pendingValues?.email}</strong>
              <br />
              <br />
              <Trans>
                We will send a 6-digit verification code to your new email address. You must enter
                this code to complete the change.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingValues(null);
                setShowEmailConfirm(false);
              }}
            >
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmailConfirm}
              disabled={isSendingCode}
              className="bg-gradient-to-r from-[#007FFF] to-[#17224D]"
            >
              {isSendingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Sending...</Trans>
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  <Trans>Send Verification Code</Trans>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verification Code Dialog */}
      <AlertDialog open={showVerifyCode} onOpenChange={setShowVerifyCode}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#007FFF]" />
              <Trans>Enter Verification Code</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                We sent a 6-digit code to <strong>{pendingValues?.email}</strong>. Please check
                your email and enter the code below.
              </Trans>
              <br />
              <br />
              <Trans>(Check server logs for the code during development)</Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest font-mono"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowVerifyCode(false);
                setPendingValues(null);
                setVerificationCode('');
              }}
            >
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="bg-gradient-to-r from-[#007FFF] to-[#17224D]"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Verifying...</Trans>
                </>
              ) : (
                <Trans>Verify & Change Email</Trans>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <Trans>Profile updated successfully!</Trans>
          </div>
        )}

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>
            <Trans>Profile Photo</Trans>
          </Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-gray-200 shadow-md">
              <AvatarImage src={photoPreview || undefined} />
              <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(user.id)} text-white font-semibold text-lg`}>
                {getInitials(form.state.values.name)}
              </AvatarFallback>
            </Avatar>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }}
                disabled={isUploading}
              />
              <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      <Trans>Uploading...</Trans>
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">
                      <Trans>Change Photo</Trans>
                    </span>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

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
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600">
                  {getErrorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Email Address</Trans> <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600">
                  {getErrorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                <Trans>Phone Number</Trans>
              </Label>
              <Input
                id={field.name}
                type="tel"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="+855 12 345 678"
              />
            </div>
          )}
        </form.Field>

        {/* Student-specific fields */}
        {user.role === 'student' && (
          <>
            <form.Field name="dob">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    <Trans>Date of Birth</Trans>
                  </Label>
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

            <form.Field name="gender">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    <Trans>Gender</Trans>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">
                        <Trans>Male</Trans>
                      </SelectItem>
                      <SelectItem value="female">
                        <Trans>Female</Trans>
                      </SelectItem>
                      <SelectItem value="other">
                        <Trans>Other</Trans>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="address">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    <Trans>Address</Trans>
                  </Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter your full address"
                    rows={3}
                  />
                </div>
              )}
            </form.Field>
          </>
        )}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-gradient-to-r from-[#007FFF] to-[#17224D]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Saving...</Trans>
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  <Trans>Update Profile</Trans>
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </>
  );
}
