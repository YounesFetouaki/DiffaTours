import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clerk_id: string }> }
) {
  try {
    await connectDB();
    
    const { clerk_id: clerkId } = await params;

    // Validate clerk_id parameter
    if (!clerkId || clerkId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Clerk ID is required',
        },
        { status: 400 }
      );
    }

    // Query user by clerkId
    const user = await User.findOne({ clerkId }).lean();

    // Return 404 if user not found
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Return user object
    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET user by Clerk ID error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}