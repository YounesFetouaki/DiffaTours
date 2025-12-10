import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExcursionCapacity from '@/models/ExcursionCapacity';
import { auth } from '@clerk/nextjs/server';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Check Clerk authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Fetch user
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      excursion_id,
      start_date,
      end_date,
      max_capacity,
      is_available = true
    } = body;

    // Validate required fields
    if (!excursion_id || typeof excursion_id !== 'string' || excursion_id.trim() === '') {
      return NextResponse.json(
        { error: 'excursion_id is required and must be a non-empty string', code: 'INVALID_EXCURSION_ID' },
        { status: 400 }
      );
    }

    if (!start_date || typeof start_date !== 'string') {
      return NextResponse.json(
        { error: 'start_date is required and must be a valid ISO date string (YYYY-MM-DD)', code: 'INVALID_START_DATE' },
        { status: 400 }
      );
    }

    if (!end_date || typeof end_date !== 'string') {
      return NextResponse.json(
        { error: 'end_date is required and must be a valid ISO date string (YYYY-MM-DD)', code: 'INVALID_END_DATE' },
        { status: 400 }
      );
    }

    if (!max_capacity || typeof max_capacity !== 'number' || max_capacity <= 0 || !Number.isInteger(max_capacity)) {
      return NextResponse.json(
        { error: 'max_capacity is required and must be a positive integer', code: 'INVALID_MAX_CAPACITY' },
        { status: 400 }
      );
    }

    if (typeof is_available !== 'boolean') {
      return NextResponse.json(
        { error: 'is_available must be a boolean', code: 'INVALID_IS_AVAILABLE' },
        { status: 400 }
      );
    }

    // Validate date format and parse dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date)) {
      return NextResponse.json(
        { error: 'start_date must be in ISO format (YYYY-MM-DD)', code: 'INVALID_START_DATE_FORMAT' },
        { status: 400 }
      );
    }

    if (!dateRegex.test(end_date)) {
      return NextResponse.json(
        { error: 'end_date must be in ISO format (YYYY-MM-DD)', code: 'INVALID_END_DATE_FORMAT' },
        { status: 400 }
      );
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Validate dates are valid
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'start_date is not a valid date', code: 'INVALID_START_DATE' },
        { status: 400 }
      );
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'end_date is not a valid date', code: 'INVALID_END_DATE' },
        { status: 400 }
      );
    }

    // Validate end_date >= start_date
    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'end_date must be greater than or equal to start_date', code: 'INVALID_DATE_RANGE' },
        { status: 400 }
      );
    }

    // Calculate total days and validate range
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (totalDays > 365) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 365 days', code: 'DATE_RANGE_TOO_LARGE' },
        { status: 400 }
      );
    }

    // Generate array of all dates between start_date and end_date (inclusive)
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check existing capacity records
    const existingRecords = await ExcursionCapacity.find({
      excursionId: excursion_id.trim(),
      date: { $in: dates }
    });

    const existingDates = new Set(existingRecords.map(record => record.date));

    // Prepare records to insert (only new dates)
    const recordsToInsert = dates
      .filter(date => !existingDates.has(date))
      .map(date => ({
        excursionId: excursion_id.trim(),
        date,
        maxCapacity: max_capacity,
        currentBookings: 0,
        isAvailable: is_available,
      }));

    const createdCount = recordsToInsert.length;
    const skippedCount = dates.length - createdCount;

    // Bulk insert new capacity records
    let createdRecords: any[] = [];
    
    if (recordsToInsert.length > 0) {
      createdRecords = await ExcursionCapacity.insertMany(recordsToInsert);
    }

    // Return summary
    return NextResponse.json(
      {
        success: true,
        message: 'Bulk capacity creation completed',
        excursionId: excursion_id.trim(),
        startDate: start_date,
        endDate: end_date,
        totalDays,
        created: createdCount,
        skipped: skippedCount,
        capacities: createdRecords
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}