import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SmsLog from '@/models/SmsLog';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Parse FormData from Twilio webhook (not JSON)
    const formData = await request.formData();
    
    // Extract Twilio webhook fields
    const MessageSid = formData.get('MessageSid')?.toString();
    const MessageStatus = formData.get('MessageStatus')?.toString();
    const ErrorCode = formData.get('ErrorCode')?.toString();
    const ErrorMessage = formData.get('ErrorMessage')?.toString();

    // Validate MessageSid
    if (!MessageSid || MessageSid.trim() === '') {
      return NextResponse.json({
        error: 'MessageSid is required',
        code: 'MISSING_MESSAGE_SID'
      }, { status: 400 });
    }

    // Validate MessageStatus
    const validStatuses = ['queued', 'sent', 'delivered', 'failed', 'undelivered'];
    if (!MessageStatus || !validStatuses.includes(MessageStatus)) {
      return NextResponse.json({
        error: 'Invalid MessageStatus. Must be one of: queued, sent, delivered, failed, undelivered',
        code: 'INVALID_MESSAGE_STATUS'
      }, { status: 400 });
    }

    // Find existing SMS log record
    const existingLog = await SmsLog.findOne({ messageSid: MessageSid });

    if (!existingLog) {
      return NextResponse.json({
        error: 'SMS log not found',
        code: 'LOG_NOT_FOUND'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: {
      status: string;
      updatedAt: Date;
      sentAt?: Date;
      errorCode?: string | null;
      errorMessage?: string | null;
    } = {
      status: MessageStatus,
      updatedAt: new Date()
    };

    // Set sentAt if delivered and not already set
    if (MessageStatus === 'delivered' && !existingLog.sentAt) {
      updateData.sentAt = new Date();
    }

    // Set error fields if failed or undelivered
    if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
      updateData.errorCode = ErrorCode || null;
      updateData.errorMessage = ErrorMessage || null;
    }

    // Update SMS log record
    await SmsLog.findOneAndUpdate(
      { messageSid: MessageSid },
      updateData,
      { new: true }
    );

    // Return success response (Twilio expects 200 OK)
    return NextResponse.json({
      success: true,
      message_sid: MessageSid,
      status: MessageStatus
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}