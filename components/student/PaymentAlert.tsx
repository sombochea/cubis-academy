'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { AlertTriangle, X, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

type OverdueEnrollment = {
  id: string;
  courseTitle: string;
  totalAmount: string;
  paidAmount: string;
  enrolled: Date;
  daysSinceEnrollment: number;
};

interface PaymentAlertProps {
  overdueEnrollments: OverdueEnrollment[];
  locale: string;
}

export function PaymentAlert({ overdueEnrollments, locale }: PaymentAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || overdueEnrollments.length === 0) {
    return null;
  }

  const totalOutstanding = overdueEnrollments.reduce(
    (sum, e) => sum + (Number(e.totalAmount) - Number(e.paidAmount)),
    0
  );

  const urgentEnrollments = overdueEnrollments.filter((e) => e.daysSinceEnrollment > 7);

  return (
    <div
      className={`rounded-xl border-2 p-6 mb-6 ${
        urgentEnrollments.length > 0 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            urgentEnrollments.length > 0 ? 'bg-red-500' : 'bg-orange-500'
          }`}
        >
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3
              className={`text-lg font-bold ${
                urgentEnrollments.length > 0 ? 'text-red-900' : 'text-orange-900'
              }`}
            >
              {urgentEnrollments.length > 0 ? (
                <Trans>Urgent: Payment Overdue</Trans>
              ) : (
                <Trans>Payment Reminder</Trans>
              )}
            </h3>
            <button
              onClick={() => setDismissed(true)}
              className={`p-1 rounded-lg transition-colors ${
                urgentEnrollments.length > 0
                  ? 'hover:bg-red-200 text-red-600'
                  : 'hover:bg-orange-200 text-orange-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p
            className={`mb-4 ${
              urgentEnrollments.length > 0 ? 'text-red-800' : 'text-orange-800'
            }`}
          >
            <Trans>
              You have {overdueEnrollments.length} course(s) with outstanding balance of $
              {totalOutstanding.toFixed(2)}.
            </Trans>
            {urgentEnrollments.length > 0 && (
              <span className="block mt-1 font-semibold">
                <Trans>
                  {urgentEnrollments.length} course(s) enrolled over a week ago need immediate
                  attention.
                </Trans>
              </span>
            )}
          </p>

          <div className="space-y-3">
            {overdueEnrollments.map((enrollment) => {
              const remaining = Number(enrollment.totalAmount) - Number(enrollment.paidAmount);
              const isUrgent = enrollment.daysSinceEnrollment > 7;

              return (
                <div
                  key={enrollment.id}
                  className={`flex items-center justify-between bg-white rounded-lg p-4 border ${
                    isUrgent ? 'border-red-200' : 'border-orange-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-[#17224D]">{enrollment.courseTitle}</h4>
                      {isUrgent && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          <Trans>Urgent</Trans>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#363942]/70">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          <Trans>
                            Paid: ${Number(enrollment.paidAmount).toFixed(2)} / $
                            {Number(enrollment.totalAmount).toFixed(2)}
                          </Trans>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <Trans>{enrollment.daysSinceEnrollment} days since enrollment</Trans>
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-orange-500'}`}
                          style={{
                            width: `${(Number(enrollment.paidAmount) / Number(enrollment.totalAmount)) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-[#363942]/70 mt-1">
                        <Trans>
                          {((Number(enrollment.paidAmount) / Number(enrollment.totalAmount)) * 100).toFixed(1)}% paid
                        </Trans>
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 text-right">
                    <p className="text-lg font-bold text-[#17224D] mb-2">${remaining.toFixed(2)}</p>
                    <Link
                      href={`/${locale}/student/payments/new?enrollmentId=${enrollment.id}&amount=${remaining}&courseName=${enrollment.courseTitle}`}
                    >
                      <Button size="sm" className={isUrgent ? 'bg-red-600 hover:bg-red-700' : ''}>
                        <Trans>Pay Now</Trans>
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`font-semibold ${
                    urgentEnrollments.length > 0 ? 'text-red-900' : 'text-orange-900'
                  }`}
                >
                  <Trans>Total Outstanding: ${totalOutstanding.toFixed(2)}</Trans>
                </p>
                <p
                  className={`text-sm ${
                    urgentEnrollments.length > 0 ? 'text-red-700' : 'text-orange-700'
                  }`}
                >
                  <Trans>Complete your payments to continue learning</Trans>
                </p>
              </div>
              <Link href={`/${locale}/student/payments`}>
                <Button variant="outline" size="sm">
                  <Trans>View All Payments</Trans>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
