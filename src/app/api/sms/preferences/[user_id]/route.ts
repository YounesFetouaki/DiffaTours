import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SmsPreference from '@/models/SmsPreference';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    await connectDB();
    
    const { user_id } = await params;

    // Validate user_id
    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        { error: 'Valid user_id is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Query preferences for this user
    const preferences = await SmsPreference.findOne({ userId: user_id });

    // If no record found, return default preferences
    if (!preferences) {
      return NextResponse.json({
        userId: user_id,
        bookingConfirmations: true,
        reminders: true,
        pickupNotifications: true,
        phoneNumber: null,
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('GET sms preferences error:', error);
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
    
    const { user_id } = await params;

    // Validate user_id
    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        { error: 'Valid user_id is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bookingConfirmations, reminders, pickupNotifications, phoneNumber } = body;

    // Validate boolean fields if provided
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

    // Validate phoneNumber if provided
    if (phoneNumber !== undefined && phoneNumber !== null && typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error: 'phoneNumber must be a string or null', code: 'INVALID_PHONE_NUMBER' },
        { status: 400 }
      );
    }

    // Check if preferences record exists
    const existingPreferences = await SmsPreference.findOne({ userId: user_id });

    if (existingPreferences) {
      // Build update object with only provided fields
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (bookingConfirmations !== undefined) {
        updateData.bookingConfirmations = bookingConfirmations;
      }
      if (reminders !== undefined) {
        updateData.reminders = reminders;
      }
      if (pickupNotifications !== undefined) {
        updateData.pickupNotifications = pickupNotifications;
      }
      if (phoneNumber !== undefined) {
        updateData.phoneNumber = phoneNumber;
      }

      // Update existing record
      const updated = await SmsPreference.findOneAndUpdate(
        { userId: user_id },
        updateData,
        { new: true }
      );

      return NextResponse.json(updated);
    } else {
      // Insert new record with defaults for unprovided fields
      const created = await SmsPreference.create({
        userId: user_id,
        bookingConfirmations: bookingConfirmations ?? true,
        reminders: reminders ?? true,
        pickupNotifications: pickupNotifications ?? true,
        phoneNumber: phoneNumber ?? null,
      });

      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('PUT sms preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}