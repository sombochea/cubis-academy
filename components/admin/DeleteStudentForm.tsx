'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trans } from '@lingui/react/macro';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteStudentFormProps {
  locale: string;
  studentId: string;
  studentName: string;
}

export function DeleteStudentForm({ locale, studentId, studentName }: DeleteStudentFormProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete student');
      }

      router.push(`/${locale}/admin/students`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">
            <Trans>Warning</Trans>
          </p>
          <p>
            <Trans>Deleting this student will also remove all associated enrollments, payments, and records. This action cannot be undone.</Trans>
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <Trans>Deleting...</Trans>
            </>
          ) : (
            <Trans>Yes, Delete Student</Trans>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isDeleting}
        >
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </div>
  );
}
