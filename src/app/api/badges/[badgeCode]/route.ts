import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TouristBadge from '@/models/TouristBadge';
import Order from '@/models/Order';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ badgeCode: string }> }
) {
  try {
    await connectDB();

    const { badgeCode } = await params;

    // Validate badgeCode
    if (!badgeCode || badgeCode.trim() === '') {
      return NextResponse.json(
        {
          error: 'Badge code is required',
          code: 'INVALID_BADGE_CODE'
        },
        { status: 400 }
      );
    }

    // Query badge by badgeCode (case insensitive)
    const badgeData = await TouristBadge.findOne({
      badgeCode: { $regex: new RegExp(`^${badgeCode}$`, 'i') }
    }).lean();

    if (!badgeData) {
      console.log(`Badge not found for code: ${badgeCode}`);
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    let orderData = null;

    // Fetch related order if orderId exists
    if (badgeData.orderId) {
      orderData = await Order.findById(badgeData.orderId).lean();
    }

    // Transform data to match frontend expectations
    const transformedBadge = {
      id: badgeData._id,
      orderNumber: badgeData.orderNumber,
      badgeCode: badgeData.badgeCode,
      touristName: badgeData.touristName,
      email: badgeData.email,
      phone: badgeData.phone,
      tripDetails: badgeData.tripDetails,
      status: badgeData.status,
      validFrom: badgeData.validFrom,
      validUntil: badgeData.validUntil,
      generatedAt: badgeData.generatedAt,
    };

    const transformedOrder = orderData ? {
      id: orderData._id,
      totalMad: orderData.totalMad,
      cartItems: orderData.cartItems,
    } : null;

    return NextResponse.json({
      badge: transformedBadge,
      order: transformedOrder
    });

  } catch (error) {
    console.error('GET badge error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ badgeCode: string }> }
) {
  try {
    await connectDB();

    // Check Clerk authentication
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findOne({ clerkId: clerkUserId }).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Admin access required',
          code: 'ADMIN_ACCESS_REQUIRED'
        },
        { status: 403 }
      );
    }

    const { badgeCode } = await params;

    // Validate badgeCode
    if (!badgeCode || badgeCode.trim() === '') {
      return NextResponse.json(
        {
          error: 'Badge code is required',
          code: 'INVALID_BADGE_CODE'
        },
        { status: 400 }
      );
    }

    // Check if badge exists
    const existingBadge = await TouristBadge.findOne({ badgeCode }).lean();

    if (!existingBadge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, validUntil } = body;

    // Validate status if provided
    const validStatuses = ['active', 'revoked', 'expired', 'used'];
    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            code: 'INVALID_STATUS'
          },
          { status: 400 }
        );
      }
    }

    // Validate validUntil if provided
    if (validUntil !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!dateRegex.test(validUntil)) {
        const testDate = new Date(validUntil);
        if (isNaN(testDate.getTime())) {
          return NextResponse.json(
            {
              error: 'Invalid validUntil date format. Must be a valid ISO date string',
              code: 'INVALID_DATE_FORMAT'
            },
            { status: 400 }
          );
        }
      }
    }

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (validUntil !== undefined) {
      updateData.validUntil = validUntil;
    }

    // Update badge
    const updatedBadge = await TouristBadge.findOneAndUpdate(
      { badgeCode },
      updateData,
      { new: true }
    ).lean();

    if (!updatedBadge) {
      return NextResponse.json(
        { error: 'Failed to update badge' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedBadge);

  } catch (error) {
    console.error('PUT badge error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ badgeCode: string }> }
) {
  try {
    await connectDB();

    // Check Clerk authentication
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findOne({ clerkId: clerkUserId }).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Admin access required',
          code: 'ADMIN_ACCESS_REQUIRED'
        },
        { status: 403 }
      );
    }

    const { badgeCode } = await params;

    // Validate badgeCode
    if (!badgeCode || badgeCode.trim() === '') {
      return NextResponse.json(
        {
          error: 'Badge code is required',
          code: 'INVALID_BADGE_CODE'
        },
        { status: 400 }
      );
    }

    // Check if badge exists
    const existingBadge = await TouristBadge.findOne({ badgeCode }).lean();

    if (!existingBadge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    // Delete the badge permanently
    await TouristBadge.findOneAndDelete({ badgeCode });

    return NextResponse.json({
      success: true,
      message: 'Badge deleted successfully',
    });

  } catch (error) {
    console.error('DELETE badge error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}