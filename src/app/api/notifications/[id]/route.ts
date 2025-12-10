import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('📝 Updating notification...');
    
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

    const { id } = await params;
    const body = await request.json();
    const { read } = body;

    console.log('🔍 Looking for notification:', id);

    const notification = await Notification.findById(id);

    if (!notification) {
      console.error('❌ Notification not found:', id);
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Ensure user owns this notification
    if (notification.userId !== clerkUserId) {
      console.error('❌ Unauthorized access attempt:', { notificationUserId: notification.userId, clerkUserId });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    notification.read = read !== undefined ? read : true;
    await notification.save();

    console.log('✅ Notification updated successfully:', id);

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('❌ PATCH notification error:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ Deleting notification...');
    
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

    const { id } = await params;

    console.log('🔍 Looking for notification:', id);

    const notification = await Notification.findById(id);

    if (!notification) {
      console.error('❌ Notification not found:', id);
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Ensure user owns this notification
    if (notification.userId !== clerkUserId) {
      console.error('❌ Unauthorized deletion attempt:', { notificationUserId: notification.userId, clerkUserId });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await Notification.findByIdAndDelete(id);

    console.log('✅ Notification deleted successfully:', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE notification error:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}