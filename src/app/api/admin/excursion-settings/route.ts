import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import ExcursionSetting from '@/models/ExcursionSetting';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Get user from database and verify admin role
    const user = await User.findOne({ clerkId: userId }).lean();

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        {
          error: 'Access denied. Admin role required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Get all excursion settings ordered by section
    const settings = await ExcursionSetting.find()
      .sort({ section: 1 })
      .lean();

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error('GET excursion settings error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}