import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import WhatsappLog from '@/models/WhatsappLog';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authentication check
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const status = searchParams.get('status');
    const messageType = searchParams.get('messageType');
    const orderIdParam = searchParams.get('orderId');

    // Validate limit
    let limit = 50;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return NextResponse.json(
          { error: 'Limit must be a positive integer', code: 'INVALID_LIMIT' },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 100);
    }

    // Validate offset
    let offset = 0;
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { error: 'Offset must be a non-negative integer', code: 'INVALID_OFFSET' },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Validate status
    if (status && !['sent', 'delivered', 'read', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate messageType
    if (messageType && !['booking_confirmation', 'reminder', 'pickup_notification'].includes(messageType)) {
      return NextResponse.json(
        { error: 'Invalid messageType value', code: 'INVALID_MESSAGE_TYPE' },
        { status: 400 }
      );
    }

    // Validate orderId
    let orderId: number | null = null;
    if (orderIdParam) {
      orderId = parseInt(orderIdParam);
      if (isNaN(orderId)) {
        return NextResponse.json(
          { error: 'Order ID must be a valid integer', code: 'INVALID_ORDER_ID' },
          { status: 400 }
        );
      }
    }

    // Build filter conditions
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (messageType) {
      filter.messageType = messageType;
    }
    
    if (orderId !== null) {
      filter.orderId = orderId;
    }

    // Execute query with filters
    const logs = await WhatsappLog.find(filter)
      .sort({ sentAt: -1 })
      .limit(limit)
      .skip(offset);

    // Get total count for pagination
    const total = await WhatsappLog.countDocuments(filter);

    return NextResponse.json({
      logs,
      total,
      limit,
      offset
    }, { status: 200 });

  } catch (error) {
    console.error('GET whatsapp-logs error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}