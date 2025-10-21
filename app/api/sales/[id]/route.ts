import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sale = await db.sale.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Only admins can delete sales" },
        { status: 403 }
      );
    }

    // Start a transaction to handle inventory rollback
    const result = await db.$transaction(async (tx: any) => {
      // Get the sale with items
      const sale = await tx.sale.findUnique({
        where: { id: params.id },
        include: {
          items: true,
        },
      });

      if (!sale) {
        throw new Error("Sale not found");
      }

      // Restore inventory for each item
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Delete sale items first
      await tx.saleItem.deleteMany({
        where: { saleId: params.id },
      });

      // Delete the sale
      await tx.sale.delete({
        where: { id: params.id },
      });

      return sale;
    });

    return NextResponse.json({
      success: true,
      message: "Sale deleted successfully and inventory restored",
    });
  } catch (error) {
    console.error("Error deleting sale:", error);
    if (error instanceof Error && error.message === "Sale not found") {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
