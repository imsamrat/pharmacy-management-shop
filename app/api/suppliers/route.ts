import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        purchases: {
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            status: true,
            purchaseDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate summary for each supplier
    const suppliersWithSummary = suppliers.map((supplier) => {
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

      return {
        ...supplier,
        summary: {
          totalPurchases,
          totalAmount,
          totalPaid,
          totalPending,
        },
      };
    });

    return NextResponse.json(suppliersWithSummary);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact, phone, email, address } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contact,
        phone,
        email,
        address,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
