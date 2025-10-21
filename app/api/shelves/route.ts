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
        { error: "Forbidden", message: "Only admins can create shelves" },
        { status: 403 }
      );
    }

    const { name, location, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate shelf name
    const existingShelf = await db.shelf.findFirst({
      where: { name: name.trim() },
    });

    if (existingShelf) {
      return NextResponse.json(
        {
          error: "Duplicate shelf name",
          message: "A shelf with this name already exists.",
        },
        { status: 400 }
      );
    }

    const shelf = await db.shelf.create({
      data: {
        name: name.trim(),
        location: location?.trim(),
        description: description?.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      shelf,
      message: "Shelf created successfully",
    });
  } catch (error) {
    console.error("Error creating shelf:", error);
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

    const shelves = await db.shelf.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(shelves);
  } catch (error) {
    console.error("Error fetching shelves:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
