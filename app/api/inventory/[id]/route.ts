import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
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
        { error: "Forbidden", message: "Only admins can update products" },
        { status: 403 }
      );
    }

    const {
      name,
      description,
      purchasePrice,
      sellingPrice,
      initialStock,
      stock,
      categoryId,
      shelfId,
      expiryDate,
      batchNumber,
      manufacturer,
      barcode,
      image,
    } = await request.json();

    if (
      !name ||
      !purchasePrice ||
      !sellingPrice ||
      initialStock === undefined ||
      stock === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await db.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        initialStock: parseInt(initialStock),
        stock: parseInt(stock),
        categoryId: categoryId || null,
        shelfId: shelfId || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        batchNumber: batchNumber?.trim(),
        manufacturer: manufacturer?.trim(),
        barcode,
        image,
      },
      include: {
        category: true,
        shelf: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
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
        { error: "Forbidden", message: "Only admins can delete products" },
        { status: 403 }
      );
    }

    // Check if product is used in any sales
    const productInSales = await db.saleItem.findFirst({
      where: { productId: params.id },
    });

    if (productInSales) {
      return NextResponse.json(
        {
          error: "Cannot delete product",
          message:
            "This product is associated with existing sales and cannot be deleted. Consider deactivating it instead.",
        },
        { status: 400 }
      );
    }

    await db.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
