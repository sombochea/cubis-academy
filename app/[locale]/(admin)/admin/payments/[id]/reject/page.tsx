"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trans } from "@lingui/react/macro";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle, ArrowLeft } from "lucide-react";

export default function RejectPaymentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const router = useRouter();
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    locale: string;
    id: string;
  } | null>(null);

  // Resolve params on mount
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const handleReject = async () => {
    if (!resolvedParams) {
      setError("Loading...");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setIsRejecting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/payments/${resolvedParams.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject payment");
      }

      router.push(
        `/${resolvedParams.locale}/admin/payments/${resolvedParams.id}`
      );
      router.refresh();
    } catch (err) {
      setError("Failed to reject payment. Please try again.");
      setIsRejecting(false);
    }
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#007FFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#363942]/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-100 p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#17224D] text-center mb-3">
          <Trans>Reject Payment</Trans>
        </h2>

        <p className="text-[#363942]/70 text-center mb-6">
          <Trans>
            Please provide a reason for rejecting this payment. The student will
            be notified.
          </Trans>
        </p>

        <div className="mb-6">
          <Label
            htmlFor="reason"
            className="text-sm font-semibold text-[#17224D] mb-2"
          >
            <Trans>Rejection Reason</Trans>
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            className="min-h-[120px] mt-2"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleReject}
            disabled={isRejecting}
            variant="destructive"
            className="w-full"
          >
            {isRejecting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <Trans>Rejecting...</Trans>
              </span>
            ) : (
              <Trans>Yes, Reject Payment</Trans>
            )}
          </Button>

          <Link
            href={`/${resolvedParams.locale}/admin/payments/${resolvedParams.id}`}
          >
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
