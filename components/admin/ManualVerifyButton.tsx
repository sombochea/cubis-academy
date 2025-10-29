'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ManualVerifyButtonProps {
  userId: string;
  userEmail: string;
  isVerified: boolean;
}

export function ManualVerifyButton({ userId, userEmail, isVerified }: ManualVerifyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify email');
      }

      router.refresh();
    } catch (error) {
      console.error('Verify error:', error);
      alert(error instanceof Error ? error.message : 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke verification');
      }

      router.refresh();
    } catch (error) {
      console.error('Revoke error:', error);
      alert(error instanceof Error ? error.message : 'Failed to revoke verification');
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <Trans>Revoke Verification</Trans>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Revoke Email Verification?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>Are you sure you want to revoke email verification for</Trans> <strong>{userEmail}</strong>?
              <br />
              <Trans>The user will need to verify their email again to enroll in courses.</Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trans>Revoke Verification</Trans>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-green-200 text-green-600 hover:bg-green-50"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <Trans>Verify Email</Trans>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Manually Verify Email?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>Are you sure you want to manually verify the email</Trans> <strong>{userEmail}</strong>?
            <br />
            <Trans>The user will be able to enroll in courses immediately.</Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleVerify}
            className="bg-green-600 hover:bg-green-700"
          >
            <Trans>Verify Email</Trans>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
