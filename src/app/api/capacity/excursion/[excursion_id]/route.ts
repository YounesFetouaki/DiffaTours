import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExcursionCapacity from '@/models/ExcursionCapacity';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ excursion_id: string }> }
) {
  try {
    await connectDB();
    
    const { excursion_id } = await params;

    // Validate excursion_id
    if (!excursion_id || typeof excursion_id !== 'string' || excursion_id.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Valid excursion_id is required',
          code: 'INVALID_EXCURSION_ID'
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Validate and parse limit
    const limit = limitParam ? parseInt(limitParam) : 100;
    if (isNaN(limit) || limit < 1 || limit > 500) {
      return NextResponse.json(
        { 
          error: 'Limit must be between 1 and 500',
          code: 'INVALID_LIMIT'
        },
        { status: 400 }
      );
    }

    // Validate and parse offset
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { 
          error: 'Offset must be a non-negative integer',
          code: 'INVALID_OFFSET'
        },
        { status: 400 }
      );
    }

    // Validate date formats (ISO date YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (startDate && !dateRegex.test(startDate)) {
      return NextResponse.json(
        { 
          error: 'start_date must be in ISO date format (YYYY-MM-DD)',
          code: 'INVALID_START_DATE'
        },
        { status: 400 }
      );
    }

    if (endDate && !dateRegex.test(endDate)) {
      return NextResponse.json(
        { 
          error: 'end_date must be in ISO date format (YYYY-MM-DD)',
          code: 'INVALID_END_DATE'
        },
        { status: 400 }
      );
    }

    // Build query filter
    const filter: any = { excursionId: excursion_id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = startDate;
      }
      if (endDate) {
        filter.date.$lte = endDate;
      }
    }

    // Execute query
    const capacities = await ExcursionCapacity.find(filter)
      .sort({ date: 1 })
      .limit(limit)
      .skip(offset);

    // Get total count for the same filters (without limit/offset)
    const total = await ExcursionCapacity.countDocuments(filter);

    // Enhance capacity data with calculated fields
    const enhancedCapacities = capacities.map(capacity => {
      const availableSpots = capacity.maxCapacity - capacity.currentBookings;
      
      let availabilityStatus: string;
      if (availableSpots <= 0) {
        availabilityStatus = 'full';
      } else if (availableSpots < capacity.maxCapacity * 0.2) {
        availabilityStatus = 'limited';
      } else {
        availabilityStatus = 'available';
      }

      return {
        id: capacity._id,
        excursionId: capacity.excursionId,
        date: capacity.date,
        maxCapacity: capacity.maxCapacity,
        currentBookings: capacity.currentBookings,
        availableSpots,
        isAvailable: capacity.isAvailable,
        availabilityStatus,
        createdAt: capacity.createdAt,
        updatedAt: capacity.updatedAt,
      };
    });

    return NextResponse.json({
      capacities: enhancedCapacities,
      total: total,
      excursionId: excursion_id,
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}