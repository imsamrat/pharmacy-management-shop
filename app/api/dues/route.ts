import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { saleId } = await request.json();

    if (!saleId) {
      return NextResponse.json(
        { error: "Sale ID is required" },
        { status: 400 }
      );
    }

    // Update the sale to mark it as having dues
    const updatedSale = await db.sale.update({
      where: { id: saleId },
      data: { hasDue: true },
      include: {
        customer: true,
        user: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        duePayments: true,
      },
    });

    // Calculate pending amount
    const pendingAmount = Math.max(
      0,
      (updatedSale as any).total - (updatedSale as any).paidAmount
    );

    return NextResponse.json({
      ...updatedSale,
      pendingAmount,
      totalDuePayments: (updatedSale as any).duePayments.reduce(
        (sum: number, payment: any) => sum + payment.amount,
        0
      ),
    });
  } catch (error) {
    console.error("Error adding due:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";

    // Build where clause - only include sales marked as having dues
    const whereClause: any = {
      hasDue: true,
    };

    // Apply additional status filter if specific status is selected
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const sales = await db.sale.findMany({
      where: whereClause,
      include: {
        customer: true,
        user: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        duePayments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate pending amounts for each sale
    const salesWithPendingAmounts = sales.map((sale) => {
      const totalDuePayments = (sale as any).duePayments.reduce(
        (sum: number, payment: any) => sum + payment.amount,
        0
      );
      // For paid sales, ensure paidAmount equals total and pending is 0
      const isPaid = (sale as any).status === "paid";
      const paidAmount = isPaid
        ? (sale as any).total
        : (sale as any).paidAmount;
      const pendingAmount = isPaid
        ? 0
        : Math.max(0, (sale as any).total - (sale as any).paidAmount);

      return {
        ...sale,
        paidAmount,
        pendingAmount,
        totalDuePayments,
      };
    });

    return NextResponse.json(salesWithPendingAmounts);
  } catch (error) {
    console.error("Error fetching dues:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
