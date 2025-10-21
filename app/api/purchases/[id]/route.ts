import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contact: true,
            phone: true,
            email: true,
            address: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...purchase,
      pendingAmount: purchase.totalAmount - purchase.paidAmount,
    });
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      supplierId,
      invoiceNumber,
      purchaseDate,
      totalAmount,
      paidAmount,
      dueDate,
      notes,
    } = body;

    if (!totalAmount) {
      return NextResponse.json(
        { error: "Total amount is required" },
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

    const purchase = await prisma.purchase.update({
      where: { id: params.id },
      data: {
        supplierId,
        invoiceNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount),
        lastPaidDate: paidAmount > 0 ? new Date() : undefined,
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
            email: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...purchase,
      pendingAmount: purchase.totalAmount - purchase.paidAmount,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Failed to update purchase" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.purchase.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase" },
      { status: 500 }
    );
  }
}