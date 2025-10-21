import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        purchases: {
          orderBy: { purchaseDate: "desc" },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Calculate summary
    const totalPurchases = supplier.purchases.length;
    const totalAmount = supplier.purchases.reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0
    );
    const totalPaid = supplier.purchases.reduce(
      (sum, purchase) => sum + purchase.paidAmount,
      0
    );
    const totalPending = totalAmount - totalPaid;

    return NextResponse.json({
      ...supplier,
      summary: {
        totalPurchases,
        totalAmount,
        totalPaid,
        totalPending,
      },
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
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
    const { name, contact, phone, email, address } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name,
        contact,
        phone,
        email,
        address,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if supplier has any purchases
    const purchaseCount = await prisma.purchase.count({
      where: { supplierId: params.id },
    });

    if (purchaseCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete supplier with existing purchases" },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
