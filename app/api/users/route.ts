import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

// Force Node.js runtime to avoid Edge Runtime issues with bcryptjs
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can view all users
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await db.user.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create users
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, password, role, status } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
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

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        status: status || "active",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
