import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function POST(request: NextRequest) {
  try {
    console.log('✅ Marking all notifications as read...');
    
    await connectDB();
    console.log('✅ Database connected');

    // Get user ID from Clerk auth with better error handling
    let clerkUserId: string | null = null;
    try {
      const authResult = await auth();
      clerkUserId = authResult?.userId || null;
      console.log('🔐 Clerk user ID:', clerkUserId);
    } catch (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed: ' + (authError as Error).message },
        { status: 401 }
      );
    }

    if (!clerkUserId) {
      console.error('❌ No user ID found in auth');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await Notification.updateMany(
      { userId: clerkUserId, read: false },
      { $set: { read: true } }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read for user ${clerkUserId}`);

    return NextResponse.json({ 
      success: true,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('❌ Mark all read error:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}