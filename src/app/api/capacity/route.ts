import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExcursionCapacity from '@/models/ExcursionCapacity';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const excursionId = searchParams.get('excursion_id');
    const date = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const isAvailableParam = searchParams.get('is_available');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build filter conditions
    const filter: any = {};

    if (excursionId) {
      filter.excursionId = excursionId;
    }

    if (date) {
      filter.date = date;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = startDate;
      }
      if (endDate) {
        filter.date.$lte = endDate;
      }
    }

    if (isAvailableParam !== null) {
      filter.isAvailable = isAvailableParam === 'true';
    }

    // Get total count for pagination
    const total = await ExcursionCapacity.countDocuments(filter);

    // Apply ordering, limit and offset
    const capacities = await ExcursionCapacity.find(filter)
      .sort({ date: 1 })
      .limit(limit)
      .skip(offset);

    return NextResponse.json({
      capacities,
      total
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Check Clerk authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    // Fetch user
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json({
        error: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED'
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { excursion_id, date, max_capacity, is_available } = body;

    // Validate required fields
    if (!excursion_id || typeof excursion_id !== 'string' || excursion_id.trim() === '') {
      return NextResponse.json({
        error: 'excursion_id is required and must be a non-empty string',
        code: 'MISSING_EXCURSION_ID'
      }, { status: 400 });
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json({
        error: 'date is required and must be a string',
        code: 'MISSING_DATE'
      }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({
        error: 'date must be in ISO date format (YYYY-MM-DD)',
        code: 'INVALID_DATE_FORMAT'
      }, { status: 400 });
    }

    // Validate date is a valid date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({
        error: 'Invalid date value',
        code: 'INVALID_DATE'
      }, { status: 400 });
    }

    if (!max_capacity || typeof max_capacity !== 'number' || max_capacity <= 0 || !Number.isInteger(max_capacity)) {
      return NextResponse.json({
        error: 'max_capacity is required and must be a positive integer',
        code: 'INVALID_MAX_CAPACITY'
      }, { status: 400 });
    }

    // Validate is_available if provided
    const isAvailable = is_available !== undefined ? is_available : true;
    if (typeof isAvailable !== 'boolean') {
      return NextResponse.json({
        error: 'is_available must be a boolean',
        code: 'INVALID_IS_AVAILABLE'
      }, { status: 400 });
    }

    // Check if capacity record already exists
    const existingCapacity = await ExcursionCapacity.findOne({
      excursionId: excursion_id,
      date
    });

    if (existingCapacity) {
      // Update existing record
      const updated = await ExcursionCapacity.findOneAndUpdate(
        { excursionId: excursion_id, date },
        {
          maxCapacity: max_capacity,
          isAvailable: isAvailable,
          updatedAt: new Date()
        },
        { new: true }
      );

      return NextResponse.json(updated, { status: 200 });
    } else {
      // Insert new record
      const newCapacity = await ExcursionCapacity.create({
        excursionId: excursion_id,
        date: date,
        maxCapacity: max_capacity,
        currentBookings: 0,
        isAvailable: isAvailable,
      });

      return NextResponse.json(newCapacity, { status: 201 });
    }

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}