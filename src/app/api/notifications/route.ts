import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET(request: NextRequest) {
  try {
    console.log('📫 Fetching notifications...');
    
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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

    console.log('🔍 Query params:', { unreadOnly, limit, userId: clerkUserId });

    const filter: any = { userId: clerkUserId };
    
    if (unreadOnly) {
      filter.read = false;
    }

    console.log('🔍 Filter:', JSON.stringify(filter));

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    console.log(`✅ Found ${notifications.length} notifications for user ${clerkUserId}`);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('❌ GET notifications error:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new notification...');
    
    await connectDB();
    console.log('✅ Database connected');

    const body = await request.json();
    const { userId, type, title, message, orderId, orderNumber } = body;

    console.log('📋 Notification data:', { userId, type, title, orderId, orderNumber });

    if (!userId || !type || !title || !message) {
      console.error('❌ Missing required fields:', { userId, type, title, message });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      orderId,
      orderNumber,
      read: false,
    });

    console.log('✅ Notification created successfully:', notification._id);

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('❌ POST notification error:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}