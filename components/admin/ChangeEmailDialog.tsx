'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trans } from '@lingui/react/macro';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ChangeEmailDialogProps {
  userId: string;
  currentEmail: string;
  userName: string;
  userRole: 'teacher' | 'student';
  locale: string;
}

export function ChangeEmailDialog({
  userId,
  currentEmail,
  userName,
  userRole,
  locale,
}: ChangeEmailDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [markVerified, setMarkVerified] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!newEmail || !confirmEmail) {
      setError('Please fill in all fields');
      return;
    }

    if (newEmail === currentEmail) {
      setError('New email must be different from current email');
      return;
    }

    if (newEmail !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/${userRole}s/${userId}/change-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, markVerified }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change email');
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        router.refresh();
        // Reset form
        setNewEmail('');
        setConfirmEmail('');
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewEmail('');
    setConfirmEmail('');
    setMarkVerified(true);
    setError(null);
    setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-white text-[#007FFF] rounded-lg hover:bg-white/90 transition-colors font-semibold flex items-center gap-2 border border-gray-200">
          <Mail className="w-4 h-4" />
          <Trans>Change Email</Trans>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#007FFF]" />
            <Trans>Change Email Address</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Update email address for</Trans> <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-600">
                <Trans>Email changed successfully!</Trans>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label><Trans>Current Email</Trans></Label>
            <Input value={currentEmail} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail">
              <Trans>New Email Address</Trans> <span className="text-red-500">*</span>
            </Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new.email@example.com"
              disabled={isLoading || success}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmEmail">
              <Trans>Confirm New Email</Trans> <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmEmail"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="new.email@example.com"
              disabled={isLoading || success}
              required
            />
          </div>

          <div className="flex items-center space-x-2 p-3 bg-[#F4F5F7] rounded-lg">
            <Checkbox
              id="markVerified"
              checked={markVerified}
              onCheckedChange={(checked) => setMarkVerified(checked === true)}
              disabled={isLoading || success}
            />
            <Label htmlFor="markVerified" className="cursor-pointer font-normal">
              <Trans>Mark email as verified</Trans>
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              disabled={isLoading || success}
              className="bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Changing...</Trans>
                </>
              ) : (
                <Trans>Change Email</Trans>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
