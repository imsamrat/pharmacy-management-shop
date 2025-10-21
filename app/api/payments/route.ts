import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

// Force Node.js runtime to avoid Edge Runtime issues with bcryptjs
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get("purchaseId");

    if (!purchaseId) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 }
      );
    }

    const payments = await db.payment.findMany({
      where: { purchaseId },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { purchaseId, amount, paymentDate, method, reference, notes } = body;

    if (!purchaseId || !amount) {
      return NextResponse.json(
        { error: "Purchase ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify the purchase exists
    const purchase = await db.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Create the payment
    const payment = await db.payment.create({
      data: {
        purchaseId,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        method,
        reference,
        notes,
      },
    });

    // Update the purchase paid amount and status
    const totalPaid = await db.payment.aggregate({
      where: { purchaseId },
      _sum: { amount: true },
    });

    const newPaidAmount = totalPaid._sum.amount || 0;
    const pendingAmount = purchase.totalAmount - newPaidAmount;

    let status = "pending";
    if (newPaidAmount >= purchase.totalAmount) {
      status = "paid";
    } else if (newPaidAmount > 0) {
      status = "partial";
    }

    await db.purchase.update({
      where: { id: purchaseId },
      data: {
        paidAmount: newPaidAmount,
        lastPaidDate: new Date(),
        status,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
