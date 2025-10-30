'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface EnrollButtonProps {
  courseId: string;
  courseName: string;
  price: string;
  isFree: boolean;
  locale: string;
}

export function EnrollButton({ courseId, courseName, price, isFree, locale }: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleEnroll = async () => {
    setLoading(true);
    setError('');
    setErrorCode(null);

    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to enroll');
        setErrorCode(data.code || null);
        setLoading(false);
        return;
      }

      // For free courses, redirect to enrollments page
      if (isFree) {
        router.push(`/${locale}/student/enrollments?enrolled=true`);
        router.refresh();
      } else {
        // For paid courses, redirect to payment page
        router.push(`/${locale}/student/payments/new?courseId=${courseId}&amount=${price}&courseName=${encodeURIComponent(courseName)}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className={`mb-4 p-4 rounded-lg border ${
          errorCode === 'EMAIL_NOT_VERIFIED' 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
              errorCode === 'EMAIL_NOT_VERIFIED' ? 'text-yellow-600' : 'text-red-600'
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                errorCode === 'EMAIL_NOT_VERIFIED' ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {errorCode === 'EMAIL_NOT_VERIFIED' ? (
                  <Trans>Email Verification Required</Trans>
                ) : (
                  <Trans>Enrollment Failed</Trans>
                )}
              </p>
              <p className={`text-sm mt-1 ${
                errorCode === 'EMAIL_NOT_VERIFIED' ? 'text-yellow-700' : 'text-red-600'
              }`}>
                {error}
              </p>
              {errorCode === 'EMAIL_NOT_VERIFIED' && (
                <button
                  onClick={() => router.push(`/${locale}/student`)}
                  className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                >
                  <Trans>Go to Dashboard to Verify Email</Trans>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <Trans>Enrolling...</Trans>
          </>
        ) : isFree ? (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            <Trans>Enroll for Free</Trans>
          </>
        ) : (
          <Trans>Enroll Now - ${Number(price).toFixed(2)}</Trans>
        )}
      </Button>

      <p className="text-xs text-[#363942]/70 text-center mt-2">
        {isFree ? (
          <Trans>Start learning immediately after enrollment</Trans>
        ) : (
          <Trans>You'll be redirected to payment after enrollment</Trans>
        )}
      </p>
    </div>
  );
}
