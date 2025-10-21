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

    const { amount, category, description, date } = await request.json();

    if (!amount || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const expense = await db.expense.update({
      where: { id: params.id },
      data: {
        amount: parseFloat(amount),
        category,
        description,
        date: date ? new Date(date) : undefined,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Error updating expense:", error);
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

    await db.expense.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
