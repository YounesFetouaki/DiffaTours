import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExcursionCapacity from '@/models/ExcursionCapacity';
import { auth } from '@clerk/nextjs/server';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const record = await ExcursionCapacity.findById(id);

    if (!record) {
      return NextResponse.json(
        { error: 'Capacity record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const availableSpots = record.maxCapacity - record.currentBookings;
    let availabilityStatus = 'available';

    if (availableSpots <= 0) {
      availabilityStatus = 'full';
    } else if (availableSpots < record.maxCapacity * 0.2) {
      availabilityStatus = 'limited';
    }

    return NextResponse.json({
      id: record._id,
      excursionId: record.excursionId,
      date: record.date,
      maxCapacity: record.maxCapacity,
      currentBookings: record.currentBookings,
      availableSpots,
      isAvailable: record.isAvailable,
      availabilityStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { max_capacity, current_bookings, is_available } = body;

    if (max_capacity !== undefined) {
      if (typeof max_capacity !== 'number' || max_capacity <= 0 || !Number.isInteger(max_capacity)) {
        return NextResponse.json(
          { error: 'max_capacity must be a positive integer', code: 'INVALID_MAX_CAPACITY' },
          { status: 400 }
        );
      }
    }

    if (current_bookings !== undefined) {
      if (typeof current_bookings !== 'number' || current_bookings < 0 || !Number.isInteger(current_bookings)) {
        return NextResponse.json(
          { error: 'current_bookings must be a non-negative integer', code: 'INVALID_CURRENT_BOOKINGS' },
          { status: 400 }
        );
      }
    }

    if (is_available !== undefined) {
      if (typeof is_available !== 'boolean') {
        return NextResponse.json(
          { error: 'is_available must be a boolean', code: 'INVALID_IS_AVAILABLE' },
          { status: 400 }
        );
      }
    }

    const existingRecord = await ExcursionCapacity.findById(id);

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Capacity record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (max_capacity !== undefined) {
      updateData.maxCapacity = max_capacity;
    }

    if (current_bookings !== undefined) {
      updateData.currentBookings = current_bookings;
    }

    if (is_available !== undefined) {
      updateData.isAvailable = is_available;
    }

    const updated = await ExcursionCapacity.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update capacity record', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    const availableSpots = updated.maxCapacity - updated.currentBookings;
    let availabilityStatus = 'available';

    if (availableSpots <= 0) {
      availabilityStatus = 'full';
    } else if (availableSpots < updated.maxCapacity * 0.2) {
      availabilityStatus = 'limited';
    }

    return NextResponse.json({
      id: updated._id,
      excursionId: updated.excursionId,
      date: updated.date,
      maxCapacity: updated.maxCapacity,
      currentBookings: updated.currentBookings,
      availableSpots,
      isAvailable: updated.isAvailable,
      availabilityStatus,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const record = await ExcursionCapacity.findByIdAndDelete(id);

    if (!record) {
      return NextResponse.json(
        { error: 'Capacity record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Capacity record deleted successfully',
      capacity: {
        id: record._id,
        excursionId: record.excursionId,
        date: record.date,
        maxCapacity: record.maxCapacity,
        currentBookings: record.currentBookings,
        isAvailable: record.isAvailable,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}