'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trans } from '@lingui/react/macro';

interface DeleteCourseFormProps {
  courseId: string;
  locale: string;
}

export function DeleteCourseForm({ courseId, locale }: DeleteCourseFormProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course');
      }

      router.push(`/${locale}/admin/courses`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="confirmation">
          <Trans>Type DELETE to confirm</Trans>
        </Label>
        <Input
          id="confirmation"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="DELETE"
          className="font-mono"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={handleDelete}
          disabled={confirmation !== 'DELETE' || isDeleting}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          {isDeleting ? <Trans>Deleting...</Trans> : <Trans>Delete Course</Trans>}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/courses/${courseId}`)}
          disabled={isDeleting}
          className="flex-1"
        >
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </div>
  );
}
