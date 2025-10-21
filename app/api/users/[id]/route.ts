import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
import { hash } from "bcryptjs";

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

    // Only admins can view user details
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sales: true,
            expenses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update users
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, password, role, status } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (role && !["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'user'" },
        { status: 400 }
      );
    }

    // Validate status
    if (status && !["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'active' or 'inactive'" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await db.user.findFirst({
      where: {
        email,
        NOT: { id: params.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already taken by another user" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role: role || "user",
      status: status || "active",
    };

    // Hash password if provided
    if (password) {
      updateData.password = await hash(password, 12);
    }

    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
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

    // Only admins can delete users
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent deleting self
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists and get their data
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            sales: true,
            expenses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has associated data
    if (user._count.sales > 0 || user._count.expenses > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete user with associated sales or expenses. Please reassign or delete the associated records first.",
        },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.name} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
