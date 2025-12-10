import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ order_number: string }> }
) {
  try {
    await connectDB();
    
    const { order_number } = await params;

    if (!order_number || order_number.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Order number is required',
          code: 'INVALID_ORDER_NUMBER' 
        },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderNumber: order_number }).lean();

    if (!order) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('GET order by number error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}