import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle/db";
import { payments } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import PrintButton from "@/components/print-button";

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const payment = await db.query.payments.findFirst({
    where: and(eq(payments.id, id), eq(payments.studentId, session.user.id)),
    with: {
      course: true,
      student: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Not Found
          </h1>
          <Link
            href="/student/payments"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/student" className="text-xl font-bold text-gray-900">
                CUBIS Academy
              </Link>
              <Link
                href="/student/payments"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                ← Back to Payments
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Payment Receipt</h1>
                <p className="text-blue-100">
                  Transaction ID: {payment.txnId || payment.id}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  payment.status === "completed"
                    ? "bg-green-500"
                    : payment.status === "pending"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {payment.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="p-8">
            {/* Status Message */}
            {payment.status === "pending" && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-semibold">
                  ⏳ Payment Pending Verification
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Your payment is being reviewed by our team. You'll receive
                  confirmation once approved.
                </p>
              </div>
            )}
            {payment.status === "completed" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  ✓ Payment Completed
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Your payment has been verified and processed successfully.
                </p>
              </div>
            )}
            {payment.status === "failed" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">✗ Payment Failed</p>
                <p className="text-red-700 text-sm mt-1">
                  There was an issue with your payment. Please contact support.
                </p>
              </div>
            )}

            {/* Payment Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Payment Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${payment.amount}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {payment.method}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(payment.created).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(payment.created).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Course Details
                </h2>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {payment.course?.title || "Course"}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{payment.course?.category}</span>
                    <span>•</span>
                    <span className="capitalize">{payment.course?.level}</span>
                    {payment.course?.duration && (
                      <>
                        <span>•</span>
                        <span>{payment.course.duration} hours</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Student Information
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">
                        {payment.student?.user?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">
                        {payment.student?.user?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="font-semibold text-gray-900">
                        {payment.student?.suid}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">
                        {payment.student?.user?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              {payment.txnId && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Transaction Details
                  </h2>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      Transaction Reference
                    </p>
                    <p className="font-mono text-lg font-semibold text-gray-900">
                      {payment.txnId}
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {payment.notes && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Additional Notes
                  </h2>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{payment.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <Link
                href="/student/payments"
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center font-medium"
              >
                Back to Payments
              </Link>
              <PrintButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
