'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function DeleteEnrollmentPage({ 
  params 
}: { 
  params: { locale: string; id: string } 
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/enrollments/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete enrollment');
      }

      router.push(`/${params.locale}/admin/enrollments`);
      router.refresh();
    } catch (err) {
      setError('Failed to delete enrollment. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-100 p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#17224D] text-center mb-3">
          <Trans>Delete Enrollment</Trans>
        </h2>
        
        <p className="text-[#363942]/70 text-center mb-6">
          <Trans>Are you sure you want to delete this enrollment? This action cannot be undone and will also delete all associated scores and attendance records.</Trans>
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="destructive"
            className="w-full"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <Trans>Deleting...</Trans>
              </span>
            ) : (
              <Trans>Yes, Delete Enrollment</Trans>
            )}
          </Button>

          <Link href={`/${params.locale}/admin/enrollments`}>
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <Trans>Cancel</Trans>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
