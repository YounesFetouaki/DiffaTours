import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clerk_id: string }> }
) {
  try {
    await connectDB();

    const { clerk_id: clerkId } = await params;

    if (!clerkId || clerkId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Clerk ID is required',
          code: 'MISSING_CLERK_ID'
        },
        { status: 400 }
      );
    }

    // Find user by clerkId
    const user = await User.findOne({ clerkId }).lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query reviews for this user
    const userReviews = await Review.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: userReviews,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET reviews by clerk_id error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}