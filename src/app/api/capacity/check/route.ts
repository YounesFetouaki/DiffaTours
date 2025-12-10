import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExcursionCapacity from '@/models/ExcursionCapacity';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const excursionId = searchParams.get('excursion_id');
    const date = searchParams.get('date');
    const peopleCountStr = searchParams.get('people_count');

    // Validate required parameters
    if (!excursionId) {
      return NextResponse.json({
        error: 'excursion_id is required',
        code: 'MISSING_EXCURSION_ID'
      }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({
        error: 'date is required',
        code: 'MISSING_DATE'
      }, { status: 400 });
    }

    if (!peopleCountStr) {
      return NextResponse.json({
        error: 'people_count is required',
        code: 'MISSING_PEOPLE_COUNT'
      }, { status: 400 });
    }

    // Validate excursion_id is non-empty
    if (excursionId.trim() === '') {
      return NextResponse.json({
        error: 'excursion_id must be a non-empty string',
        code: 'INVALID_EXCURSION_ID'
      }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({
        error: 'date must be in ISO format (YYYY-MM-DD)',
        code: 'INVALID_DATE_FORMAT'
      }, { status: 400 });
    }

    // Validate date is a valid date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({
        error: 'date must be a valid date',
        code: 'INVALID_DATE'
      }, { status: 400 });
    }

    // Validate people_count is a positive integer
    const peopleCount = parseInt(peopleCountStr);
    if (isNaN(peopleCount) || peopleCount <= 0 || !Number.isInteger(peopleCount)) {
      return NextResponse.json({
        error: 'people_count must be a positive integer',
        code: 'INVALID_PEOPLE_COUNT'
      }, { status: 400 });
    }

    // Query excursionCapacity collection for matching excursionId and date
    const capacity = await ExcursionCapacity.findOne({
      excursionId: excursionId,
      date: date
    });

    // If no capacity record exists, treat as unlimited/available
    if (!capacity) {
      return NextResponse.json({
        available: true,
        canBook: true,
        hasCapacityLimit: false,
        excursionId: excursionId,
        date: date,
        requestedPeople: peopleCount,
        message: 'No capacity limit set for this date'
      }, { status: 200 });
    }

    // Capacity record exists, calculate availability
    const availableSpots = capacity.maxCapacity - capacity.currentBookings;
    const canBook = (availableSpots >= peopleCount) && capacity.isAvailable;

    // Determine availability status
    let availabilityStatus: string;
    if (availableSpots <= 0) {
      availabilityStatus = 'full';
    } else if (availableSpots < capacity.maxCapacity * 0.2) {
      availabilityStatus = 'limited';
    } else {
      availabilityStatus = 'available';
    }

    return NextResponse.json({
      available: capacity.isAvailable && availableSpots > 0,
      canBook: canBook,
      hasCapacityLimit: true,
      excursionId: excursionId,
      date: date,
      requestedPeople: peopleCount,
      maxCapacity: capacity.maxCapacity,
      currentBookings: capacity.currentBookings,
      availableSpots: availableSpots,
      isAvailable: capacity.isAvailable,
      availabilityStatus: availabilityStatus
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}