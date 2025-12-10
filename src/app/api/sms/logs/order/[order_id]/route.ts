import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SmsLog from '@/models/SmsLog';
import User from '@/models/User';
import Order from '@/models/Order';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    await connectDB();
    
    // Authenticate with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Fetch user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Unwrap params
    const { order_id } = await params;

    // Validate order_id
    if (!order_id || isNaN(parseInt(order_id))) {
      return NextResponse.json(
        { error: 'Valid order_id is required', code: 'INVALID_ORDER_ID' },
        { status: 400 }
      );
    }

    const orderId = parseInt(order_id);

    // Check if order exists in MongoDB
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Authorization check: user must be admin OR order owner
    const isAdmin = user.role === 'admin';
    const isOrderOwner = order.userId?.toString() === user._id.toString();

    if (!isAdmin && !isOrderOwner) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query SMS logs
    const logs = await SmsLog.find({ orderId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    // Get total count
    const total = await SmsLog.countDocuments({ orderId });

    // Return response with metadata
    return NextResponse.json(
      {
        logs,
        total,
        order_id: orderId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET SMS logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}