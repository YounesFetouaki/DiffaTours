import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import WhatsappLog from '@/models/WhatsappLog';

const ALLOWED_MESSAGE_TYPES = ['booking_confirmation', 'reminder', 'pickup_notification'];
const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {
      recipient_phone,
      message,
      template_name,
      message_type,
      scheduled_time,
      order_id
    } = body;

    // Validate recipient_phone
    if (!recipient_phone) {
      return NextResponse.json(
        { error: 'Recipient phone number is required', code: 'MISSING_RECIPIENT_PHONE' },
        { status: 400 }
      );
    }

    if (!E164_PHONE_REGEX.test(recipient_phone)) {
      return NextResponse.json(
        { 
          error: 'Invalid phone number format. Must be in E.164 format (e.g., +1234567890)', 
          code: 'INVALID_PHONE_FORMAT' 
        },
        { status: 400 }
      );
    }

    // Validate message or template_name
    if (!message && !template_name) {
      return NextResponse.json(
        { error: 'Either message or template_name must be provided', code: 'MISSING_MESSAGE_CONTENT' },
        { status: 400 }
      );
    }

    // Validate message_type
    if (!message_type) {
      return NextResponse.json(
        { error: 'Message type is required', code: 'MISSING_MESSAGE_TYPE' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MESSAGE_TYPES.includes(message_type)) {
      return NextResponse.json(
        { 
          error: `Invalid message type. Must be one of: ${ALLOWED_MESSAGE_TYPES.join(', ')}`, 
          code: 'INVALID_MESSAGE_TYPE',
          details: `Allowed values: ${ALLOWED_MESSAGE_TYPES.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate scheduled_time
    if (!scheduled_time) {
      return NextResponse.json(
        { error: 'Scheduled time is required', code: 'MISSING_SCHEDULED_TIME' },
        { status: 400 }
      );
    }

    // Parse and validate scheduled_time
    let scheduledDate: Date;
    try {
      scheduledDate = new Date(scheduled_time);
      if (isNaN(scheduledDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid scheduled time format. Must be a valid ISO timestamp', 
          code: 'INVALID_SCHEDULED_TIME_FORMAT' 
        },
        { status: 400 }
      );
    }

    // Validate scheduled_time is in the future
    const currentTime = new Date();
    if (scheduledDate <= currentTime) {
      return NextResponse.json(
        { 
          error: 'Scheduled time must be in the future', 
          code: 'SCHEDULED_TIME_PAST',
          details: `Scheduled time: ${scheduledDate.toISOString()}, Current time: ${currentTime.toISOString()}`
        },
        { status: 400 }
      );
    }

    // Validate order_id if provided
    if (order_id !== undefined && order_id !== null) {
      const parsedOrderId = parseInt(order_id);
      if (isNaN(parsedOrderId) || parsedOrderId <= 0) {
        return NextResponse.json(
          { error: 'Order ID must be a positive integer', code: 'INVALID_ORDER_ID' },
          { status: 400 }
        );
      }
    }

    // Create scheduled message record
    const newScheduledMessage = await WhatsappLog.create({
      messageId: null,
      recipientPhone: recipient_phone,
      messageText: message || '',
      templateName: template_name || null,
      messageType: message_type,
      status: 'pending',
      orderId: order_id ? parseInt(order_id) : null,
      errorMessage: null,
      sentAt: scheduledDate,
      deliveredAt: null,
      readAt: null,
    });

    return NextResponse.json(
      {
        success: true,
        scheduled_id: newScheduledMessage._id.toString(),
        scheduled_time: scheduledDate.toISOString(),
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}