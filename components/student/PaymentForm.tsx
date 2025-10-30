'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

interface PaymentFormProps {
  locale: string;
}

type EnrollmentDetails = {
  totalAmount: string;
  paidAmount: string;
  courseTitle: string;
  courseCategory: string | null;
};

export function PaymentForm({ locale }: PaymentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [enrollmentDetails, setEnrollmentDetails] = useState<EnrollmentDetails | null>(null);

  // Get URL parameters
  const enrollmentId = searchParams.get('enrollmentId');
  const courseId = searchParams.get('courseId');
  const urlAmount = searchParams.get('amount');
  const courseName = searchParams.get('courseName');

  // Fetch enrollment details if enrollmentId is provided
  useEffect(() => {
    if (enrollmentId) {
      setFetchingDetails(true);
      fetch(`/api/enrollments/${enrollmentId}/payment-details`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error('Failed to fetch enrollment details:', data.error);
          } else {
            setEnrollmentDetails(data);
          }
        })
        .catch((err) => {
          console.error('Error fetching enrollment details:', err);
        })
        .finally(() => {
          setFetchingDetails(false);
        });
    }
  }, [enrollmentId]);

  const [formData, setFormData] = useState({
    enrollmentId: enrollmentId || '',
    courseId: courseId || '',
    amount: urlAmount || '',
    method: '',
    notes: '',
    proofFile: null as File | null,
  });

  const paymentMethods = [
    { value: 'bank_transfer', label: <Trans>Bank Transfer</Trans> },
    { value: 'cash', label: <Trans>Cash</Trans> },
    { value: 'mobile_payment', label: <Trans>Mobile Payment</Trans> },
    { value: 'credit_card', label: <Trans>Credit Card</Trans> },
    { value: 'paypal', label: <Trans>PayPal</Trans> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate amount
      const amount = Number(formData.amount);
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Create FormData for file upload
      const submitData = new FormData();
      if (formData.enrollmentId) {
        submitData.append('enrollmentId', formData.enrollmentId);
      }
      if (formData.courseId) {
        submitData.append('courseId', formData.courseId);
      }
      submitData.append('amount', formData.amount);
      submitData.append('method', formData.method);
      submitData.append('notes', formData.notes);
      if (formData.proofFile) {
        submitData.append('proof', formData.proofFile);
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment submission failed');
      }

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push(`/${locale}/student/payments?success=true`);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, WebP, and PDF files are allowed');
        return;
      }

      setFormData((prev) => ({ ...prev, proofFile: file }));
      setError('');
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-[#17224D] mb-2">
          <Trans>Payment Submitted Successfully!</Trans>
        </h3>
        <p className="text-[#363942]/70 mb-4">
          <Trans>
            Your payment has been submitted for review. You'll be notified once it's processed.
          </Trans>
        </p>
        <p className="text-sm text-[#363942]/70">
          <Trans>Redirecting to payment history...</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Payment Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-[#17224D] mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <Trans>Payment Details</Trans>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="text-sm font-semibold text-[#17224D]">
                <Trans>Amount</Trans> *
              </Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
              {urlAmount && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <Trans>
                      Suggested amount: ${urlAmount}. You can pay any amount (partial payment is
                      allowed).
                    </Trans>
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="method" className="text-sm font-semibold text-[#17224D]">
                <Trans>Payment Method</Trans> *
              </Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, method: value }))}
                required
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Proof */}
            <div>
              <Label htmlFor="proof" className="text-sm font-semibold text-[#17224D]">
                <Trans>Payment Proof</Trans>
              </Label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="proof"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-[#363942]/40" />
                      <p className="mb-2 text-sm text-[#363942]">
                        <span className="font-semibold">
                          <Trans>Click to upload</Trans>
                        </span>{' '}
                        <Trans>or drag and drop</Trans>
                      </p>
                      <p className="text-xs text-[#363942]/70">
                        <Trans>PNG, JPG, WebP, PDF (MAX. 10MB)</Trans>
                      </p>
                    </div>
                    <input
                      id="proof"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {formData.proofFile && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">{formData.proofFile.name}</span>
                    <span className="text-xs text-blue-600 ml-auto">
                      {(formData.proofFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-semibold text-[#17224D]">
                <Trans>Notes</Trans>{' '}
                <span className="text-[#363942]/70">
                  (<Trans>Optional</Trans>)
                </span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this payment..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-2 min-h-[100px]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    <Trans>Payment Failed</Trans>
                  </p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.amount || !formData.method}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <Trans>Submitting Payment...</Trans>
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-5 w-5" />
                  <Trans>Submit Payment</Trans>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#17224D] mb-4">
            <Trans>Payment Summary</Trans>
          </h3>

          {/* Course Info */}
          {(enrollmentDetails || courseName) && (
            <div className="mb-4 p-4 bg-[#F4F5F7] rounded-lg">
              <h4 className="font-semibold text-[#17224D] mb-1">
                {enrollmentDetails?.courseTitle || decodeURIComponent(courseName || '')}
              </h4>
              {enrollmentDetails?.courseCategory && (
                <p className="text-xs text-[#363942]/70">{enrollmentDetails.courseCategory}</p>
              )}
            </div>
          )}

          {/* Enrollment Payment Details */}
          {fetchingDetails ? (
            <div className="mb-4 p-4 bg-[#F4F5F7] rounded-lg text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#007FFF]" />
              <p className="text-xs text-[#363942]/70">
                <Trans>Loading payment details...</Trans>
              </p>
            </div>
          ) : (
            enrollmentDetails && (
              <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-blue-900">
                    <Trans>Course Payment Status</Trans>
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-800">
                      <Trans>Original Amount:</Trans>
                    </span>
                    <span className="text-sm font-bold text-blue-900">
                      ${Number(enrollmentDetails.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-800">
                      <Trans>Already Paid:</Trans>
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      ${Number(enrollmentDetails.paidAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-xs font-semibold text-blue-900">
                      <Trans>Amount Due:</Trans>
                    </span>
                    <span className="text-sm font-bold text-orange-600">
                      $
                      {(
                        Number(enrollmentDetails.totalAmount) -
                        Number(enrollmentDetails.paidAmount)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(Number(enrollmentDetails.paidAmount) / Number(enrollmentDetails.totalAmount)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-700 text-center mt-1">
                    {enrollmentDetails && Number(enrollmentDetails.totalAmount) > 0
                      ? ((Number(enrollmentDetails.paidAmount) / Number(enrollmentDetails.totalAmount)) * 100).toFixed(1)
                      : '0'}
                    %{' '}
                    <Trans>paid</Trans>
                  </p>
                </div>
              </div>
            )
          )}

          {/* Current Payment */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[#363942]/70">
                <Trans>This Payment:</Trans>
              </span>
              <span className="font-bold text-[#007FFF] text-lg">
                ${Number(formData.amount || 0).toFixed(2)}
              </span>
            </div>

            {formData.method && (
              <div className="flex justify-between items-center">
                <span className="text-[#363942]/70">
                  <Trans>Payment Method:</Trans>
                </span>
                <span className="font-medium capitalize">{formData.method.replace('_', ' ')}</span>
              </div>
            )}

            {/* New Balance After Payment */}
            {enrollmentDetails && formData.amount && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#363942]/70">
                    <Trans>After This Payment:</Trans>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#363942]/70">
                    <Trans>Total Paid:</Trans>
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    ${(Number(enrollmentDetails.paidAmount) + Number(formData.amount)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#363942]/70">
                    <Trans>Remaining:</Trans>
                  </span>
                  <span className="text-sm font-semibold text-orange-600">
                    $
                    {Math.max(
                      0,
                      Number(enrollmentDetails.totalAmount) -
                        Number(enrollmentDetails.paidAmount) -
                        Number(formData.amount)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Info Messages */}
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Trans>
                  Your payment will be reviewed by our team. You'll receive a confirmation email
                  once it's processed.
                </Trans>
              </p>
            </div>
            {enrollmentId && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-semibold mb-1">
                  <Trans>💡 Partial Payments Allowed</Trans>
                </p>
                <p className="text-xs text-green-700">
                  <Trans>
                    You can pay any amount now and make additional payments later until the full
                    course fee is paid.
                  </Trans>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
