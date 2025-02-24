import { NextRequest, NextResponse } from "next/server";
import Poll from "@/models/Poll";
import { connectToDB } from "@/lib/db-connect";
import { auth } from "@/auth";

// Get single poll
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {

  const session = await auth();
  if(!session){
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
    const userId = session?.user?.id;
  try {
    await connectToDB();

    const poll = await Poll.aggregate([
      {
        $match: { _id: params.id }
      },
      {
        $addFields: {
          options: {
            $map: {
              input: "$options",
              as: "option",
              in: {
                $mergeObjects: [
                  "$$option",
                  {
                    isSelected: {
                      $cond: {
                        if: { $in: [userId, "$$option.votes"] },
                        then: true,
                        else: false
                      }
                    },
                    voteCount: { $size: "$$option.votes" },
                    percentage: {
                      $multiply: [
                        {
                          $divide: [
                            { $size: "$$option.votes" },
                            { $sum: { $map: { input: "$options", as: "o", in: { $size: "$$o.votes" } } } }
                          ]
                        },
                        100
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]).exec();

    if (!poll || poll.length === 0) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: poll[0] });
  } catch (error: any) {
    console.error("Error fetching poll:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch poll" },
      { status: 500 }
    );
  }
}

// Update poll
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {

  const session = await auth();

  if(!session){
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const { title, image, options, visibility, scheduledFor } = await req.json();


    await connectToDB();

    const poll = await Poll.findOne({ _id: params.id, userId: session?.user?.id });
    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedPoll = await Poll.findByIdAndUpdate(
      params.id,
      {
        title,
        image,
        options,
        visibility,
        scheduledFor,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: "Poll updated successfully",
      data: updatedPoll,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update poll" },
      { status: 500 }
    );
  }
}

// Vote on poll
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { optionIndex } = await req.json();

    if (typeof optionIndex !== 'number') {
      return NextResponse.json(
        { error: "Option index must be a number" },
        { status: 400 }
      );
    }

    await connectToDB();

    const poll = await Poll.findById(params.id);
    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    // Check if option index is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return NextResponse.json(
        { error: "Invalid option index" },
        { status: 400 }
      );
    }

    // Get current vote
    const currentVote = await poll.getUserVote(session?.user?.id);
    
    if (currentVote === optionIndex) {
      // If user clicks the same option they voted for, remove their vote
      poll.options[optionIndex].votes = poll.options[optionIndex].votes.filter(
        (id: string) => id !== session?.user?.id
      );
      poll.votedUsers = poll.votedUsers.filter((id: string) => id !== session?.user?.id);
    } else {
      // Add or update vote
      await poll.addVote(session?.user?.id, optionIndex);
    }

    await poll.save();

    return NextResponse.json({ 
      data: poll,
      message: currentVote === optionIndex ? "Vote removed" : "Vote updated"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update vote" },
      { status: 500 }
    );
  }
}

// Delete poll
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {

  const session = await auth();

  if(!session){
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {

    await connectToDB();

    const poll = await Poll.findOne({ _id: params.id, userId: session?.user?.id });
    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found or unauthorized" },
        { status: 404 }
      );
    }

    await Poll.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Poll deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete poll" },
      { status: 500 }
    );
  }
}
