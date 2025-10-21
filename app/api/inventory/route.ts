import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

// Force Node.js runtime for database operations
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Only admins can create products" },
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

    // Check for duplicate product by barcode if provided
    if (barcode && barcode.trim()) {
      const existingProductByBarcode = await db.product.findFirst({
        where: { barcode: barcode.trim() },
      });

      if (existingProductByBarcode) {
        return NextResponse.json(
          {
            error: "Duplicate barcode",
            message:
              "A product with this barcode already exists. Please use a different barcode.",
          },
          { status: 400 }
        );
      }
    }

    const product = await db.product.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        initialStock: parseInt(initialStock),
        stock: parseInt(stock),
        categoryId: categoryId || null,
        shelfId: shelfId || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        batchNumber: batchNumber?.trim(),
        manufacturer: manufacturer?.trim(),
        barcode: barcode?.trim(),
        image,
      },
      include: {
        category: true,
        shelf: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        shelf: true,
        saleItems: {
          include: {
            sale: true,
          },
          orderBy: {
            sale: {
              createdAt: "desc",
            },
          },
        },
      },
    });

    // Calculate additional fields for each product
    const productsWithCalculations = products.map((product) => {
      const soldQty = product.initialStock - product.stock;
      const lastSoldDate =
        product.saleItems.length > 0
          ? product.saleItems[0].sale.createdAt.toISOString().split("T")[0]
          : null;
      const stockStatus = product.stock === 0 ? "Stock Out" : "Available";

      return {
        ...product,
        soldQty,
        lastSoldDate,
        stockStatus,
        purchaseDate: product.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json(productsWithCalculations);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
