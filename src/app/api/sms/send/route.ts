import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SmsLog from '@/models/SmsLog';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';

const VALID_MESSAGE_TYPES = ['booking_confirmation', 'reminder_24h', 'pickup_notification'];

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Authorization check - admin or staff only
    if (user.role !== 'admin' && user.role !== 'staff') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin or staff role required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { phone_number, message_body, message_type, orderId, scheduled_for } = body;

    // Validate required fields
    if (!phone_number || typeof phone_number !== 'string' || phone_number.trim() === '') {
      return NextResponse.json(
        { error: 'phone_number is required and must be a non-empty string', code: 'INVALID_PHONE_NUMBER' },
        { status: 400 }
      );
    }

    if (!message_body || typeof message_body !== 'string' || message_body.trim() === '') {
      return NextResponse.json(
        { error: 'message_body is required and must be a non-empty string', code: 'INVALID_MESSAGE_BODY' },
        { status: 400 }
      );
    }

    if (!message_type || typeof message_type !== 'string' || message_type.trim() === '') {
      return NextResponse.json(
        { error: 'message_type is required and must be a non-empty string', code: 'INVALID_MESSAGE_TYPE' },
        { status: 400 }
      );
    }

    // Validate message_type
    if (!VALID_MESSAGE_TYPES.includes(message_type)) {
      return NextResponse.json(
        {
          error: `message_type must be one of: ${VALID_MESSAGE_TYPES.join(', ')}`,
          code: 'INVALID_MESSAGE_TYPE_VALUE'
        },
        { status: 400 }
      );
    }

    // Validate orderId if provided
    if (orderId !== undefined && orderId !== null) {
      if (typeof orderId !== 'number' || !Number.isInteger(orderId)) {
        return NextResponse.json(
          { error: 'orderId must be an integer if provided', code: 'INVALID_ORDER_ID' },
          { status: 400 }
        );
      }
    }

    // Validate scheduled_for if provided
    let scheduledForDate: Date | null = null;
    if (scheduled_for) {
      if (typeof scheduled_for !== 'string') {
        return NextResponse.json(
          { error: 'scheduled_for must be an ISO timestamp string', code: 'INVALID_SCHEDULED_FOR' },
          { status: 400 }
        );
      }

      scheduledForDate = new Date(scheduled_for);
      if (isNaN(scheduledForDate.getTime())) {
        return NextResponse.json(
          { error: 'scheduled_for must be a valid ISO timestamp', code: 'INVALID_SCHEDULED_FOR_FORMAT' },
          { status: 400 }
        );
      }

      // Check if scheduled_for is in the future
      if (scheduledForDate <= new Date()) {
        return NextResponse.json(
          { error: 'scheduled_for must be a future timestamp', code: 'SCHEDULED_FOR_PAST' },
          { status: 400 }
        );
      }
    }

    // Check if message should be scheduled
    if (scheduledForDate && scheduledForDate > new Date()) {
      // Insert queued message
      const queuedLog = await SmsLog.create({
        messageSid: null,
        orderId: orderId || null,
        phoneNumber: phone_number.trim(),
        messageBody: message_body.trim(),
        messageType: message_type.trim(),
        status: 'queued',
        scheduledFor: scheduledForDate,
        sentAt: null,
      });

      return NextResponse.json(
        {
          scheduled: true,
          message_sid: null,
          status: 'queued',
          log_id: queuedLog._id.toString()
        },
        { status: 201 }
      );
    }

    // Send immediately
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    const isTwilioConfigured = twilioAccountSid && twilioAuthToken && twilioPhoneNumber;

    if (!isTwilioConfigured) {
      // Mock SMS sending
      const mockSid = `mock_sid_${randomUUID()}`;
      const mockLog = await SmsLog.create({
        messageSid: mockSid,
        orderId: orderId || null,
        phoneNumber: phone_number.trim(),
        messageBody: message_body.trim(),
        messageType: message_type.trim(),
        status: 'sent',
        scheduledFor: null,
        sentAt: new Date(),
      });

      return NextResponse.json(
        {
          scheduled: false,
          message_sid: mockSid,
          status: 'sent',
          mock: true,
          log_id: mockLog._id.toString()
        },
        { status: 200 }
      );
    }

    // Send via Twilio
    try {
      const twilio = require('twilio');
      const client = twilio(twilioAccountSid, twilioAuthToken);

      const message = await client.messages.create({
        body: message_body.trim(),
        from: twilioPhoneNumber,
        to: phone_number.trim()
      });

      const twilioLog = await SmsLog.create({
        messageSid: message.sid,
        orderId: orderId || null,
        phoneNumber: phone_number.trim(),
        messageBody: message_body.trim(),
        messageType: message_type.trim(),
        status: 'sent',
        scheduledFor: null,
        sentAt: new Date(),
      });

      return NextResponse.json(
        {
          scheduled: false,
          message_sid: message.sid,
          status: 'sent',
          mock: false,
          log_id: twilioLog._id.toString()
        },
        { status: 200 }
      );
    } catch (twilioError: any) {
      // Log failed Twilio send
      const failedLog = await SmsLog.create({
        messageSid: null,
        orderId: orderId || null,
        phoneNumber: phone_number.trim(),
        messageBody: message_body.trim(),
        messageType: message_type.trim(),
        status: 'failed',
        scheduledFor: null,
        sentAt: null,
        errorCode: twilioError.code?.toString() || 'UNKNOWN',
        errorMessage: twilioError.message || 'Failed to send SMS via Twilio',
      });

      return NextResponse.json(
        {
          error: 'Failed to send SMS via Twilio',
          code: 'TWILIO_ERROR',
          details: twilioError.message,
          log_id: failedLog._id.toString()
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('POST /api/sms/send error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}