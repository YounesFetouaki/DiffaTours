import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ order_number: string }> }
) {
  try {
    await connectDB();

    const { order_number } = await params;

    // Validate order_number
    if (!order_number || typeof order_number !== 'string' || order_number.trim() === '') {
      return NextResponse.json(
        {
          error: 'Valid order number is required',
          code: 'INVALID_ORDER_NUMBER'
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { paymentStatus, transactionId, authCode, paymentResponse, paidAt } = body;

    // Validate paymentStatus if provided
    const validStatuses = ['pending', 'processing', 'success', 'failed', 'cancelled'];
    if (paymentStatus !== undefined && !validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        {
          error: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_PAYMENT_STATUS'
        },
        { status: 400 }
      );
    }

    // Validate paidAt if provided
    if (paidAt !== undefined && paidAt !== null) {
      if (!Number.isInteger(paidAt) || paidAt < 0) {
        return NextResponse.json(
          {
            error: 'paidAt must be a positive integer (Unix timestamp in seconds)',
            code: 'INVALID_PAID_AT'
          },
          { status: 400 }
        );
      }
    }

    // Check if order exists
    const existingOrder = await Order.findOne({ orderNumber: order_number });

    if (!existingOrder) {
      return NextResponse.json(
        {
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };

    // Add fields only if provided in request
    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;

      // Auto-set paidAt if status is success and paidAt not provided
      if (paymentStatus === 'success' && paidAt === undefined) {
        updateData.paidAt = Math.floor(Date.now() / 1000);
      }
    }

    if (transactionId !== undefined) {
      updateData.transactionId = transactionId;
    }

    if (authCode !== undefined) {
      updateData.authCode = authCode;
    }

    if (paymentResponse !== undefined) {
      updateData.paymentResponse = paymentResponse;
    }

    if (paidAt !== undefined) {
      updateData.paidAt = paidAt;
    }

    // Update order
    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber: order_number },
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        {
          error: 'Failed to update order',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}