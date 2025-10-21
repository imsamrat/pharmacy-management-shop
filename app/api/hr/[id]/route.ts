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
        { error: "Forbidden", message: "Only admins can update employees" },
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

    const employee = await db.employee.update({
      where: { id: params.id },
      data: {
        name,
        email,
        position,
        salary: salary ? parseFloat(salary) : null,
      },
    });

    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error("Error updating employee:", error);
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
        { error: "Forbidden", message: "Only admins can delete employees" },
        { status: 403 }
      );
    }

    await db.employee.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
