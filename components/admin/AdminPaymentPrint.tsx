"use client";

import { useRef } from "react";
import { Trans } from "@lingui/react/macro";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatDateLong, formatDateTimeLong } from "@/lib/utils/date";

type Payment = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentSuid: string;
  enrollmentId: string;
  courseTitle: string | null;
  amount: string;
  method: string | null;
  status: string;
  txnId: string | null;
  created: Date;
};

interface AdminPaymentPrintProps {
  payment: Payment;
  locale: string;
}

export function AdminPaymentPrint({ payment, locale }: AdminPaymentPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt-${payment.txnId || payment.id.slice(0, 8)}`,
  });

  return (
    <>
      <Button
        onClick={handlePrint}
        variant="outline"
        className="w-full hover:bg-[#007FFF]/5 hover:border-[#007FFF]/30 hover:text-[#007FFF] transition-colors"
      >
        <Printer className="mr-2 h-4 w-4" />
        <Trans>Print Receipt</Trans>
      </Button>

      {/* Hidden print content */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white">
          {/* Header */}
          <div className="border-b-2 border-[#007FFF] pb-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[#17224D] mb-2">
                  CUBIS Academy
                </h1>
                <p className="text-[#363942]/70">
                  <Trans>Payment Receipt</Trans>
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    payment.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : payment.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Trans>{payment.status}</Trans>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-[#363942]/70">
                <Trans>Receipt #:</Trans>{" "}
                <span className="font-mono font-semibold text-[#17224D]">
                  {payment.txnId || payment.id.slice(0, 13)}
                </span>
              </p>
            </div>
          </div>

          {/* Student Information */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#363942]/70 uppercase mb-3">
              <Trans>Student Information</Trans>
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-[#17224D] mb-1">
                {payment.studentName}
              </p>
              <p className="text-sm text-[#363942]/70">
                {payment.studentEmail}
              </p>
              <p className="text-sm text-[#363942]/70 font-mono">
                <Trans>Student ID:</Trans> {payment.studentSuid}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#363942]/70 uppercase mb-3">
              <Trans>Payment Details</Trans>
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#363942]/70">
                      <Trans>Description</Trans>
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-[#363942]/70">
                      <Trans>Amount</Trans>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#17224D]">
                        {payment.courseTitle || <Trans>General Payment</Trans>}
                      </p>
                      <p className="text-sm text-[#363942]/70">
                        <Trans>Payment Date:</Trans>{" "}
                        {formatDateLong(payment.created, locale) || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-2xl font-bold text-[#17224D]">
                        ${Number(payment.amount).toFixed(2)}
                      </p>
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-[#17224D]">
                      <Trans>Total Amount</Trans>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-2xl font-bold text-[#007FFF]">
                        ${Number(payment.amount).toFixed(2)}
                      </p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-[#363942]/70 uppercase mb-1">
                <Trans>Payment Method</Trans>
              </p>
              <p className="text-sm font-semibold text-[#17224D] capitalize">
                {payment.method || "-"}
              </p>
            </div>
            {payment.txnId && (
              <div>
                <p className="text-xs text-[#363942]/70 uppercase mb-1">
                  <Trans>Transaction ID</Trans>
                </p>
                <p className="text-sm font-mono">{payment.txnId}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-xs text-[#363942]/70 text-center mb-2">
              <Trans>This is an official receipt from CUBIS Academy.</Trans>
            </p>
            <p className="text-xs text-[#363942]/70 text-center font-mono mb-2">
              <Trans>Enrollment ID:</Trans> {payment.enrollmentId}
            </p>
            <p className="text-xs text-[#363942]/70 text-center">
              <Trans>Generated on:</Trans>{" "}
              {formatDateTimeLong(new Date(), locale)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
