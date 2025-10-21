import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// Force Node.js runtime for database operations and transactions
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    console.log("Session object:", JSON.stringify(session, null, 2));
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user?.id) {
      console.error("No user ID in session");
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const {
      items,
      total,
      customer,
      discount = 0,
      paidAmount = 0,
    } = await request.json();
    console.log("Received sale data:", {
      items,
      total,
      customer,
      userId: session.user.id,
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("No items provided in request");
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (typeof total !== "number" || total <= 0) {
      console.error("Invalid total:", total);
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 }
      );
    }

    if (typeof paidAmount !== "number" || paidAmount < 0) {
      console.error("Invalid paid amount:", paidAmount);
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    if (paidAmount > total) {
      console.error("Paid amount exceeds total:", { paidAmount, total });
      return NextResponse.json(
        { error: "Payment amount cannot exceed total amount" },
        { status: 400 }
      );
    }

    // Validate that all products exist and have sufficient stock
    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        console.error(`Product not found: ${item.productId}`);
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        console.error(
          `Insufficient stock for product ${item.productId}: requested ${item.quantity}, available ${product.stock}`
        );
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Start a transaction for all operations
    const result = await db.$transaction(
      async (tx) => {
        try {
          // Create customer if provided (inside transaction)
          let customerId = null;
          if (customer) {
            if (
              !customer.phone ||
              typeof customer.phone !== "string" ||
              customer.phone.trim() === ""
            ) {
              throw new Error("Customer phone is required");
            }

            const newCustomer = await tx.customer.create({
              data: {
                name: customer.name?.trim() || null,
                phone: customer.phone.trim(),
                address: customer.address?.trim() || null,
              },
            });
            customerId = newCustomer.id;
            console.log("Customer created:", customerId);
          }

          // Determine sale status based on payment
          let status = "pending";
          let hasDue = false;
          let finalPaidAmount = paidAmount;
          if (paidAmount >= total) {
            status = "paid";
            finalPaidAmount = total; // Ensure paidAmount equals total for paid sales
          } else if (paidAmount > 0) {
            status = "partial";
            hasDue = true; // Automatically mark partial payments as having dues
          }

          // Create the sale
          const sale = await tx.sale.create({
            data: {
              total,
              discount,
              paidAmount: finalPaidAmount,
              status,
              hasDue,
              userId: session.user.id,
              customerId,
            } as any,
          });
          console.log(
            "Sale created:",
            sale.id,
            "Status:",
            status,
            "HasDue:",
            hasDue
          );

          // Create sale items and update inventory
          for (const item of items) {
            console.log(
              "Creating sale item for product:",
              item.productId,
              "quantity:",
              item.quantity,
              "price:",
              item.price
            );

            // Create sale item
            await tx.saleItem.create({
              data: {
                quantity: item.quantity,
                price: item.price,
                saleId: sale.id,
                productId: item.productId,
              },
            });
            console.log("Sale item created, updating stock...");

            // Update product stock
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
            console.log("Stock updated for product:", item.productId);
          }

          return sale;
        } catch (transactionError) {
          console.error("Transaction error:", transactionError);
          throw transactionError;
        }
      },
      {
        maxWait: 20000, // Maximum time to wait for a transaction to start
        timeout: 30000, // Maximum time for the transaction to complete
      }
    );

    return NextResponse.json({ success: true, sale: result });
  } catch (error) {
    console.error("Error creating sale:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const hasDues = searchParams.get("hasDues");

    // Build where clause for filters
    const where: any = {};

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    // Has dues filter
    if (hasDues === "true") {
      where.hasDue = true;
    } else if (hasDues === "false") {
      where.hasDue = false;
    }

    const sales = await db.sale.findMany({
      where,
      include: {
        user: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
