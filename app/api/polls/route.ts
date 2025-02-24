import { NextRequest, NextResponse } from "next/server";
import Poll from "@/models/Poll";
import { connectToDB } from "@/lib/db-connect";
import { auth } from "@/auth";

// Create a new poll
export async function POST(req: NextRequest) {
  const session = await auth();


  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const { title, image, options, visibility, scheduledFor } = await req.json();

    await connectToDB();

    const poll = await Poll.create({
      userId: session?.user?.id,
      title,
      image,
      options,
      visibility,
      scheduledFor,
    });

    return NextResponse.json(
      { message: "Poll created successfully", data: poll },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create poll" },
      { status: 500 }
    );
  }
}

// Get all polls with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const visibility = searchParams.get("visibility");
    const userId = searchParams.get("userId");

    await connectToDB();

    const query: any = {};
    if (visibility) query.visibility = visibility;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;
    const polls = await Poll.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Poll.countDocuments(query);

    return NextResponse.json({
      data: polls,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch polls" },
      { status: 500 }
    );
  }
}
