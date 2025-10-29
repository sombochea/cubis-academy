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
import { Trans } from '@lingui/react/macro';
import { Key, Copy, Mail, Loader2, RefreshCw, CheckCircle } from 'lucide-react';

interface ResetPasswordDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'teacher' | 'student';
  locale: string;
}

export function ResetPasswordDialog({
  userId,
  userName,
  userEmail,
  userRole,
  locale,
}: ResetPasswordDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePassword = async () => {
    setIsGenerating(true);
    setError(null);
    setEmailSent(false);

    try {
      const response = await fetch(`/api/admin/${userRole}s/${userId}/reset-password`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate password');
      }

      const data = await response.json();
      setNewPassword(data.password);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/${userRole}s/${userId}/send-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewPassword('');
    setError(null);
    setEmailSent(false);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-white text-[#007FFF] rounded-lg hover:bg-white/90 transition-colors font-semibold flex items-center gap-2 border border-gray-200">
          <Key className="w-4 h-4" />
          <Trans>Reset Password</Trans>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#007FFF]" />
            <Trans>Reset Password</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Generate a new password for</Trans> <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {emailSent && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-600">
                <Trans>Password sent to email successfully!</Trans>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label><Trans>Email Address</Trans></Label>
            <Input value={userEmail} disabled className="bg-gray-50" />
          </div>

          {!newPassword ? (
            <Button
              onClick={handleGeneratePassword}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Generating...</Trans>
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <Trans>Generate New Password</Trans>
                </>
              )}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label><Trans>New Password</Trans></Label>
                <div className="flex gap-2">
                  <Input
                    value={newPassword}
                    readOnly
                    className="font-mono bg-[#F4F5F7] font-semibold text-[#007FFF]"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPassword}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-[#363942]/70">
                  <Trans>Copy this password and share it securely with the user</Trans>
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendEmail}
                  disabled={isSending || emailSent}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <Trans>Sending...</Trans>
                    </>
                  ) : emailSent ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <Trans>Sent</Trans>
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      <Trans>Send via Email</Trans>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGeneratePassword}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            <Trans>Close</Trans>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
