'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface CourseFeedbackFormProps {
  enrollmentId: string;
  courseId: string;
  existingFeedback?: {
    id: string;
    rating: number;
    comment: string | null;
    isAnonymous: boolean;
  } | null;
  locale: string;
}

export function CourseFeedbackForm({
  enrollmentId,
  courseId,
  existingFeedback,
  locale,
}: CourseFeedbackFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [isAnonymous, setIsAnonymous] = useState(existingFeedback?.isAnonymous || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/course-feedback', {
        method: existingFeedback ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          courseId,
          rating,
          comment: comment.trim() || null,
          isAnonymous,
          feedbackId: existingFeedback?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          <Trans>Thank you for your feedback!</Trans>
        </h3>
        <p className="text-sm text-green-700">
          <Trans>Your feedback helps us improve our courses.</Trans>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <Label className="text-sm font-semibold text-[#17224D] mb-3 block">
          <Trans>Rate this course</Trans> *
        </Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-[#363942]">
              {rating} <Trans>out of 5</Trans>
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <Label htmlFor="comment" className="text-sm font-semibold text-[#17224D]">
          <Trans>Your feedback</Trans> <span className="text-[#363942]/70">(<Trans>Optional</Trans>)</span>
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this course..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-2 min-h-[120px]"
        />
      </div>

      {/* Anonymous */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
        />
        <label
          htmlFor="anonymous"
          className="text-sm text-[#363942] cursor-pointer"
        >
          <Trans>Submit anonymously</Trans>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              <Trans>Error</Trans>
            </p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <Trans>Submitting...</Trans>
          </>
        ) : existingFeedback ? (
          <Trans>Update Feedback</Trans>
        ) : (
          <Trans>Submit Feedback</Trans>
        )}
      </Button>
    </form>
  );
}
