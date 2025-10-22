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

    // Build where clause based on status filter
    const whereClause: any = {};

    if (status === "paid") {
      // For "Fully Paid": show sales that are paid AND have due payments (were originally dues)
      whereClause.AND = [
        { status: "paid" },
        {
          duePayments: {
            some: {}, // Has at least one due payment
          },
        },
      ];
    } else if (status && status !== "all") {
      // For other specific statuses: show sales with hasDue: true AND specific status
      whereClause.AND = [{ hasDue: true }, { status: status }];
    } else {
      // For "all": show all sales with hasDue: true
      whereClause.hasDue = true;
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
