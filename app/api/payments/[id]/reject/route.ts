import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/drizzle/db";
import { payments } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params
    const resolvedParams = await context.params;
    const paymentId = resolvedParams.id;

    // Validate ID
    if (!paymentId) {
      console.error("Payment ID is undefined:", resolvedParams);
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      );
    }

    console.log("Rejecting payment:", paymentId, "Reason:", reason);

    // Update payment status to failed with rejection reason
    await db
      .update(payments)
      .set({
        status: "failed",
        notes: reason,
      })
      .where(eq(payments.id, paymentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject payment error:", error);
    return NextResponse.json(
      { error: "Failed to reject payment" },
      { status: 500 }
    );
  }
}
