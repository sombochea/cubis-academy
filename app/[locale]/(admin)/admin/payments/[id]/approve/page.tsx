'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function ApprovePaymentPage({ 
  params 
}: { 
  params: { locale: string; id: string } 
}) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setIsApproving(true);
    setError('');

    try {
      const response = await fetch(`/api/payments/${params.id}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve payment');
      }

      router.push(`/${params.locale}/admin/payments/${params.id}`);
      router.refresh();
    } catch (err) {
      setError('Failed to approve payment. Please try again.');
      setIsApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-100 p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#17224D] text-center mb-3">
          <Trans>Approve Payment</Trans>
        </h2>
        
        <p className="text-[#363942]/70 text-center mb-6">
          <Trans>Are you sure you want to approve this payment? This will mark the payment as completed and update the student's enrollment status.</Trans>
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isApproving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <Trans>Approving...</Trans>
              </span>
            ) : (
              <Trans>Yes, Approve Payment</Trans>
            )}
          </Button>

          <Link href={`/${params.locale}/admin/payments/${params.id}`}>
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
