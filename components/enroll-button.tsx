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

  const handleEnroll = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to enroll');
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
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
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
