import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contact: true,
            phone: true,
          },
        },
      },
      orderBy: { purchaseDate: "desc" },
    });

    // Calculate pending amount for each purchase
    const purchasesWithPending = purchases.map((purchase) => ({
      ...purchase,
      pendingAmount: purchase.totalAmount - purchase.paidAmount,
    }));

    return NextResponse.json(purchasesWithPending);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supplierId,
      invoiceNumber,
      purchaseDate,
      totalAmount,
      paidAmount = 0,
      dueDate,
      notes,
    } = body;

    if (!supplierId || !totalAmount) {
      return NextResponse.json(
        { error: "Supplier ID and total amount are required" },
        { status: 400 }
      );
    }

    if (totalAmount < 0 || paidAmount < 0) {
      return NextResponse.json(
        { error: "Amounts cannot be negative" },
        { status: 400 }
      );
    }

    if (paidAmount > totalAmount) {
      return NextResponse.json(
        { error: "Paid amount cannot exceed total amount" },
        { status: 400 }
      );
    }

    // Determine status based on payment
    let status = "pending";
    if (paidAmount === 0) {
      status = "pending";
    } else if (paidAmount >= totalAmount) {
      status = "paid";
    } else {
      status = "partial";
    }

    const purchase = await prisma.purchase.create({
      data: {
        supplierId,
        invoiceNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount),
        lastPaidDate: paidAmount > 0 ? new Date() : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status,
        notes,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contact: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...purchase,
        pendingAmount: purchase.totalAmount - purchase.paidAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
