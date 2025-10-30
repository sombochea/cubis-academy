'use client';

import { useRef } from 'react';
import { Trans } from '@lingui/react/macro';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import {
  Download,
  Printer,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

type Payment = {
  id: string;
  studentId: string;
  enrollmentId: string | null;
  courseId: string | null;
  courseTitle: string | null;
  courseCategory: string | null;
  amount: string;
  method: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  txnId: string | null;
  proofUrl: string | null;
  notes: string | null;
  created: Date;
  totalAmount: string | null;
  paidAmount: string | null;
};

interface PaymentReceiptProps {
  payment: Payment;
  locale: string;
}

export function PaymentReceipt({ payment, locale }: PaymentReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt-${payment.txnId || payment.id.slice(0, 8)}`,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-emerald-500';
      case 'pending':
        return 'from-yellow-500 to-orange-500';
      case 'failed':
        return 'from-red-500 to-pink-500';
      case 'refunded':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6" />;
      case 'pending':
        return <Clock className="w-6 h-6" />;
      case 'failed':
        return <XCircle className="w-6 h-6" />;
      case 'refunded':
        return <DollarSign className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  return (
    <div>
      {/* Action Button */}
      <div className="flex justify-end mb-6 print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          <Trans>Print / Download PDF</Trans>
        </Button>
      </div>

      {/* Modern Screen View */}
      <div ref={printRef}>
        {/* Screen View - Modern & Colorful */}
        <div className="print:hidden">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header with Gradient */}
            <div className={`bg-gradient-to-r ${getStatusColor(payment.status)} p-8 text-white`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">CUBIS Academy</h1>
                  <p className="text-white/90">
                    <Trans>Payment Receipt</Trans>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm mb-1">
                    <Trans>Receipt #</Trans>
                  </p>
                  <p className="font-mono text-lg font-bold">
                    {payment.txnId || payment.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                {getStatusIcon(payment.status)}
                <span className="font-semibold uppercase tracking-wide">
                  <Trans>{payment.status}</Trans>
                </span>
              </div>
            </div>

            {/* Amount Display */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
              <div className="text-center">
                <p className="text-sm text-[#363942]/70 mb-2">
                  <Trans>Amount Paid</Trans>
                </p>
                <p className="text-6xl font-bold text-[#17224D] mb-2">
                  ${Number(payment.amount).toFixed(2)}
                </p>
                <p className="text-sm text-[#363942]/70">
                  {new Date(payment.created).toLocaleDateString()} •{' '}
                  {new Date(payment.created).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {payment.method && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#363942]/70 mb-1">
                        <Trans>Payment Method</Trans>
                      </p>
                      <p className="font-semibold text-[#17224D] capitalize">
                        {payment.method.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#363942]/70 mb-1">
                      <Trans>Payment Date</Trans>
                    </p>
                    <p className="font-semibold text-[#17224D]">
                      {new Date(payment.created).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-[#363942]/70">
                      {new Date(payment.created).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {payment.courseTitle && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#363942]/70 mb-1">
                        <Trans>Course</Trans>
                      </p>
                      <p className="font-semibold text-[#17224D]">{payment.courseTitle}</p>
                      {payment.courseCategory && (
                        <p className="text-sm text-[#363942]/70">{payment.courseCategory}</p>
                      )}
                    </div>
                  </div>
                )}

                {payment.txnId && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#363942]/70 mb-1">
                        <Trans>Transaction ID</Trans>
                      </p>
                      <p className="font-mono text-sm text-[#17224D]">{payment.txnId}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Progress (if enrollment) */}
              {payment.enrollmentId && payment.totalAmount && payment.paidAmount && (
                <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-semibold text-[#17224D] mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <Trans>Course Payment Summary</Trans>
                  </h4>
                  <div className="space-y-3">
                    {/* Original Course Fee */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#363942]/70">
                        <Trans>Original Course Fee:</Trans>
                      </span>
                      <span className="font-bold text-[#17224D]">
                        ${Number(payment.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    {/* This Payment */}
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-blue-300">
                      <span className="text-sm font-semibold text-blue-900">
                        <Trans>This Payment:</Trans>
                      </span>
                      <span className="font-bold text-blue-600 text-lg">
                        ${Number(payment.amount).toFixed(2)}
                      </span>
                    </div>

                    {/* Before and After */}
                    <div className="pt-3 border-t border-blue-200 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#363942]/70">
                          <Trans>Paid Before This:</Trans>
                        </span>
                        <span className="font-semibold text-[#363942]">
                          ${(Number(payment.paidAmount) - Number(payment.amount)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-green-700">
                          <Trans>Total Paid (After):</Trans>
                        </span>
                        <span className="font-bold text-green-600">
                          ${Number(payment.paidAmount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-orange-700">
                          <Trans>Balance Due:</Trans>
                        </span>
                        <span className="font-bold text-orange-600">
                          ${(Number(payment.totalAmount) - Number(payment.paidAmount)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all"
                          style={{
                            width: `${payment.totalAmount && Number(payment.totalAmount) > 0 ? (Number(payment.paidAmount) / Number(payment.totalAmount)) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-700 text-center mt-2">
                        {payment.totalAmount && Number(payment.totalAmount) > 0
                          ? ((Number(payment.paidAmount) / Number(payment.totalAmount)) * 100).toFixed(1)
                          : '0'}
                        %{' '}
                        <Trans>paid</Trans>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {payment.notes && (
                <div className="mt-6 p-4 bg-[#F4F5F7] rounded-lg">
                  <p className="text-sm font-semibold text-[#17224D] mb-2">
                    <Trans>Notes</Trans>
                  </p>
                  <p className="text-sm text-[#363942]">{payment.notes}</p>
                </div>
              )}

              {/* Payment Proof */}
              {payment.proofUrl && (
                <div className="mt-6">
                  <a
                    href={payment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#17224D]">
                        <Trans>Payment Proof Attached</Trans>
                      </p>
                      <p className="text-xs text-[#363942]/70">
                        <Trans>Click to view</Trans>
                      </p>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#F4F5F7] border-t border-gray-200">
              <p className="text-xs text-[#363942]/70 text-center">
                <Trans>
                  This is an official receipt from CUBIS Academy. For any questions, please contact
                  our support team.
                </Trans>
              </p>
              <p className="text-xs text-[#363942]/70 text-center mt-2">
                <Trans>Generated on</Trans> {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Print View - Simple & Clean */}
        <div className="hidden print:block bg-white p-8">
          {/* Header */}
          <div className="border-b-2 border-gray-900 pb-4 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CUBIS ACADEMY</h1>
                <p className="text-sm text-gray-600">Payment Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">Receipt No.</p>
                <p className="font-mono text-sm font-bold">
                  {payment.txnId || payment.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="inline-block px-3 py-1 border-2 border-gray-900">
              <span className="text-xs font-bold uppercase">{payment.status}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center py-6 border-b border-gray-300 mb-6">
            <p className="text-xs text-gray-500 uppercase mb-2">Amount Paid</p>
            <p className="text-4xl font-bold text-gray-900">${Number(payment.amount).toFixed(2)}</p>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Date</p>
                <p className="text-sm font-medium">{new Date(payment.created).toLocaleDateString()}</p>
                <p className="text-xs text-gray-600">{new Date(payment.created).toLocaleTimeString()}</p>
              </div>
              {payment.method && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Method</p>
                  <p className="text-sm font-medium capitalize">{payment.method.replace('_', ' ')}</p>
                </div>
              )}
            </div>

            {payment.courseTitle && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase mb-1">Course</p>
                <p className="text-sm font-medium">{payment.courseTitle}</p>
                {payment.courseCategory && <p className="text-xs text-gray-600">{payment.courseCategory}</p>}
              </div>
            )}

            {payment.txnId && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase mb-1">Transaction ID</p>
                <p className="text-sm font-mono">{payment.txnId}</p>
              </div>
            )}
          </div>

          {/* Payment Progress */}
          {payment.enrollmentId && payment.totalAmount && payment.paidAmount && (
            <div className="border-t-2 border-gray-900 pt-4 mb-6">
              <p className="text-xs text-gray-500 uppercase mb-3">Course Payment Summary</p>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Total Course Fee:</td>
                    <td className="py-2 text-right font-semibold">${Number(payment.totalAmount).toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Total Paid:</td>
                    <td className="py-2 text-right font-semibold">${Number(payment.paidAmount).toFixed(2)}</td>
                  </tr>
                  <tr className="border-b-2 border-gray-900">
                    <td className="py-2 font-bold">Balance Due:</td>
                    <td className="py-2 text-right font-bold">
                      ${(Number(payment.totalAmount) - Number(payment.paidAmount)).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="border-t border-gray-200 pt-4 mb-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Notes</p>
              <p className="text-sm">{payment.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-gray-900 pt-4 mt-8">
            <p className="text-xs text-gray-600 text-center">
              This is an official receipt from CUBIS Academy.
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              For inquiries: support@cubisacademy.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
