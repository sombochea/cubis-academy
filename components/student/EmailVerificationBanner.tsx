'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Trans } from '@lingui/react/macro';

interface EmailVerificationBannerProps {
  userEmail: string;
}

export function EmailVerificationBanner({ userEmail }: EmailVerificationBannerProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const handleSendCode = async () => {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }

      // For development, show the code
      if (data.devCode) {
        setDevCode(data.devCode);
      }

      setShowDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }

      setSuccess(true);
      setTimeout(() => {
        setShowDialog(false);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-yellow-800">
              <Trans>Email Verification Required</Trans>
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              <Trans>Please verify your email address</Trans> ({userEmail}) <Trans>to enroll in courses and access all features.</Trans>
            </p>
            <Button
              onClick={handleSendCode}
              disabled={isSending}
              className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
              size="sm"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Sending...</Trans>
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  <Trans>Verify Email</Trans>
                </>
              )}
            </Button>
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#007FFF]" />
              <Trans>Verify Your Email</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>Enter the 6-digit code sent to</Trans> <strong>{userEmail}</strong>
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-600">
                <Trans>Email Verified Successfully!</Trans>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <Trans>Redirecting...</Trans>
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4 py-4">
              {devCode && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-semibold">
                    Development Mode - Your code: {devCode}
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">
                  <Trans>Verification Code</Trans> <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  disabled={isLoading}
                  required
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-gray-500">
                  <Trans>Enter the 6-digit code from your email</Trans>
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={isLoading}
                >
                  <Trans>Cancel</Trans>
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <Trans>Verifying...</Trans>
                    </>
                  ) : (
                    <Trans>Verify Email</Trans>
                  )}
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSending}
                  className="text-sm text-[#007FFF] hover:text-[#0066CC] disabled:opacity-50"
                >
                  {isSending ? <Trans>Sending...</Trans> : <Trans>Resend Code</Trans>}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
