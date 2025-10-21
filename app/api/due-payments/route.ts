import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get("saleId");

    if (!saleId) {
      return NextResponse.json(
        { error: "Sale ID is required" },
        { status: 400 }
      );
    }

    const duePayments = await db.duePayment.findMany({
      where: { saleId },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(duePayments);
  } catch (error) {
    console.error("Error fetching due payments:", error);
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
    const { saleId, amount, paymentDate, method, reference, notes } = body;

    if (!saleId || !amount) {
      return NextResponse.json(
        { error: "Sale ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify the sale exists
    const sale = await db.sale.findUnique({
      where: { id: saleId },
      select: {
        id: true,
        total: true,
        paidAmount: true,
        status: true,
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Create the due payment
    const duePayment = await (db as any).duePayment.create({
      data: {
        saleId,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        method,
        reference,
        notes,
      },
    });

    // Update the sale paid amount and status
    const totalDuePayments = await (db as any).duePayment.aggregate({
      where: { saleId },
      _sum: { amount: true },
    });

    const totalDuePaid = totalDuePayments._sum.amount || 0;
    const newTotalPaid = (sale as any).paidAmount + totalDuePaid;
    const pendingAmount = (sale as any).total - newTotalPaid;

    let status = "pending";
    let hasDue = true;
    let finalPaidAmount = newTotalPaid;
    if (newTotalPaid >= (sale as any).total) {
      status = "paid";
      hasDue = false;
      finalPaidAmount = (sale as any).total; // Ensure paidAmount equals total for paid sales
    } else if (newTotalPaid > 0) {
      status = "partial";
      hasDue = true;
    }

    await (db as any).sale.update({
      where: { id: saleId },
      data: {
        paidAmount: finalPaidAmount,
        status,
        hasDue,
      },
    });

    return NextResponse.json(duePayment, { status: 201 });
  } catch (error) {
    console.error("Error creating due payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
