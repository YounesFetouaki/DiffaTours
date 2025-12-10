import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import ExcursionSetting from '@/models/ExcursionSetting';
import User from '@/models/User';

const VALID_SECTIONS = ['marrakech', 'agadir', 'taghazout', 'circuits'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
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

    // Get section from params
    const { section } = await params;

    // Validate section parameter
    if (!section || typeof section !== 'string' || section.trim() === '') {
      return NextResponse.json(
        { error: 'Valid section is required', code: 'INVALID_SECTION' },
        { status: 400 }
      );
    }

    const normalizedSection = section.toLowerCase();

    // Validate section is one of the allowed values
    if (!VALID_SECTIONS.includes(normalizedSection)) {
      return NextResponse.json(
        { error: 'Valid section is required', code: 'INVALID_SECTION' },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { showPrice } = body;

    // Validate showPrice is provided and is boolean
    if (showPrice === undefined || showPrice === null) {
      return NextResponse.json(
        { error: 'showPrice must be a boolean', code: 'INVALID_SHOW_PRICE' },
        { status: 400 }
      );
    }

    if (typeof showPrice !== 'boolean') {
      return NextResponse.json(
        { error: 'showPrice must be a boolean', code: 'INVALID_SHOW_PRICE' },
        { status: 400 }
      );
    }

    // Admin authorization: Query user by clerkId
    const userRecord = await User.findOne({ clerkId: userId }).lean();

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify user has admin role
    if (userRecord.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Check if setting exists
    const existingSetting = await ExcursionSetting.findOne({ section: normalizedSection });

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Setting not found', code: 'SETTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update the setting
    const updated = await ExcursionSetting.findOneAndUpdate(
      { section: normalizedSection },
      {
        showPrice: showPrice,
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update setting', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}