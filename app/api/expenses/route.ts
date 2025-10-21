import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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

    const expense = await db.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        description,
        date: date ? new Date(date) : new Date(),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Error creating expense:", error);
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

    const expenses = await db.expense.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
