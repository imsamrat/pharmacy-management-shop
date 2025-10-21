import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { db } from "../../../../../lib/db";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can reset passwords
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update user's password
    await db.user.update({
      where: { id: params.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      userName: user.name,
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
