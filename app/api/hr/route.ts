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

    // Check if user has admin role
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Only admins can create employees" },
        { status: 403 }
      );
    }

    const { name, email, position, salary } = await request.json();

    if (!name || !email || !position) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const employee = await db.employee.create({
      data: {
        name,
        email,
        position,
        salary: salary ? parseFloat(salary) : null,
      },
    });

    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error("Error creating employee:", error);
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

    const employees = await db.employee.findMany({
      orderBy: { hireDate: "desc" },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
