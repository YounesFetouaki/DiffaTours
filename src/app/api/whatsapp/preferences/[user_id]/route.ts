import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import WhatsappPreference from '@/models/WhatsappPreference';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { user_id } = await params;

    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        { error: 'Valid user_id is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Authorization: users can only access their own preferences
    if (userId !== user_id) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const existingPreferences = await WhatsappPreference.findOne({ userId: user_id });

    if (!existingPreferences) {
      return NextResponse.json({
        userId: user_id,
        phoneNumber: '',
        notificationsEnabled: true,
        bookingConfirmations: true,
        reminders: true,
        pickupNotifications: true,
      });
    }

    return NextResponse.json(existingPreferences);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { user_id } = await params;

    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        { error: 'Valid user_id is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Authorization: users can only update their own preferences
    if (userId !== user_id) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      notificationsEnabled,
      bookingConfirmations,
      reminders,
      pickupNotifications,
      phoneNumber,
    } = body;

    // Validation
    if (notificationsEnabled !== undefined && typeof notificationsEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'notificationsEnabled must be a boolean', code: 'INVALID_NOTIFICATIONS_ENABLED' },
        { status: 400 }
      );
    }

    if (bookingConfirmations !== undefined && typeof bookingConfirmations !== 'boolean') {
      return NextResponse.json(
        { error: 'bookingConfirmations must be a boolean', code: 'INVALID_BOOKING_CONFIRMATIONS' },
        { status: 400 }
      );
    }

    if (reminders !== undefined && typeof reminders !== 'boolean') {
      return NextResponse.json(
        { error: 'reminders must be a boolean', code: 'INVALID_REMINDERS' },
        { status: 400 }
      );
    }

    if (pickupNotifications !== undefined && typeof pickupNotifications !== 'boolean') {
      return NextResponse.json(
        { error: 'pickupNotifications must be a boolean', code: 'INVALID_PICKUP_NOTIFICATIONS' },
        { status: 400 }
      );
    }

    if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== 'string') {
        return NextResponse.json(
          { error: 'phoneNumber must be a string', code: 'INVALID_PHONE_NUMBER_TYPE' },
          { status: 400 }
        );
      }

      const e164Regex = /^\+[1-9]\d{1,14}$/;
      if (phoneNumber !== '' && !e164Regex.test(phoneNumber)) {
        return NextResponse.json(
          { error: 'phoneNumber must be in E.164 format (e.g., +1234567890)', code: 'INVALID_PHONE_NUMBER_FORMAT' },
          { status: 400 }
        );
      }
    }

    // Check if record exists
    const existingPreferences = await WhatsappPreference.findOne({ userId: user_id });

    if (existingPreferences) {
      // Update existing record
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;
      if (bookingConfirmations !== undefined) updateData.bookingConfirmations = bookingConfirmations;
      if (reminders !== undefined) updateData.reminders = reminders;
      if (pickupNotifications !== undefined) updateData.pickupNotifications = pickupNotifications;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

      const updated = await WhatsappPreference.findOneAndUpdate(
        { userId: user_id },
        updateData,
        { new: true }
      );

      return NextResponse.json({
        success: true,
        preferences: updated,
      });
    } else {
      // Create new record
      const created = await WhatsappPreference.create({
        userId: user_id,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : '',
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true,
        bookingConfirmations: bookingConfirmations !== undefined ? bookingConfirmations : true,
        reminders: reminders !== undefined ? reminders : true,
        pickupNotifications: pickupNotifications !== undefined ? pickupNotifications : true,
      });

      return NextResponse.json({
        success: true,
        preferences: created,
      });
    }
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}