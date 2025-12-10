import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import WhatsappLog from '@/models/WhatsappLog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
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

    // Validate order_id format
    const { order_id: orderIdParam } = await params;
    const orderId = parseInt(orderIdParam);
    
    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: 'Invalid order ID format', code: 'INVALID_ORDER_ID' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter', code: 'INVALID_LIMIT' },
        { status: 400 }
      );
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset parameter', code: 'INVALID_OFFSET' },
        { status: 400 }
      );
    }

    // Query WhatsApp logs
    const logs = await WhatsappLog.find({ orderId })
      .sort({ sentAt: -1 })
      .limit(limit)
      .skip(offset);

    // Get total count
    const total = await WhatsappLog.countDocuments({ orderId });

    // Return response
    return NextResponse.json(
      {
        logs,
        total,
        orderId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET /api/whatsapp/logs/order/[order_id] error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}