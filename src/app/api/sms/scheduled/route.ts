import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SmsLog from '@/models/SmsLog';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

const VALID_STATUSES = ['queued', 'sent', 'delivered', 'failed', 'undelivered'];

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authentication check
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Authorization check - require admin or staff role
    if (user.role !== 'admin' && user.role !== 'staff') {
      return NextResponse.json(
        { error: 'Access forbidden. Admin or staff role required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'queued';
    const dueBefore = searchParams.get('due_before') || new Date().toISOString();
    const limitParam = searchParams.get('limit') || '100';

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Validate limit
    const limit = Math.min(parseInt(limitParam), 500);
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a positive number.', code: 'INVALID_LIMIT' },
        { status: 400 }
      );
    }

    // Validate due_before is a valid ISO timestamp
    const dueBeforeDate = new Date(dueBefore);
    if (isNaN(dueBeforeDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid due_before parameter. Must be a valid ISO timestamp.', code: 'INVALID_TIMESTAMP' },
        { status: 400 }
      );
    }

    // Query smsLogs collection
    const scheduledSms = await SmsLog.find({
      status,
      scheduledFor: { $lte: dueBeforeDate, $ne: null }
    })
      .sort({ scheduledFor: 1 })
      .limit(limit);

    return NextResponse.json(
      {
        scheduled_sms: scheduledSms,
        count: scheduledSms.length,
        due_before: dueBefore
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET scheduled SMS error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}