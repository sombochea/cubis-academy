'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EnrollButtonProps {
  courseId: string;
  courseName: string;
  price: string;
}

export default function EnrollButton({ courseId, courseName, price }: EnrollButtonProps) {
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

      // Redirect to payment page
      router.push(`/student/payments/new?courseId=${courseId}&amount=${price}&courseName=${encodeURIComponent(courseName)}`);
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
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                errorCode === 'EMAIL_NOT_VERIFIED' ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {errorCode === 'EMAIL_NOT_VERIFIED' ? 'Email Verification Required' : 'Enrollment Failed'}
              </p>
              <p className={`text-sm mt-1 ${
                errorCode === 'EMAIL_NOT_VERIFIED' ? 'text-yellow-700' : 'text-red-600'
              }`}>
                {error}
              </p>
              {errorCode === 'EMAIL_NOT_VERIFIED' && (
                <button
                  onClick={() => router.push('/student')}
                  className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                >
                  Go to Dashboard to Verify Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enrolling...' : `Enroll Now - $${price}`}
      </button>
      <p className="text-sm text-gray-500 text-center mt-2">
        You'll be redirected to payment after enrollment
      </p>
    </div>
  );
}
