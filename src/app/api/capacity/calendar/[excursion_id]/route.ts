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
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    // Validate month parameter
    if (!monthParam) {
      return NextResponse.json(
        {
          error: 'Month parameter is required',
          code: 'MISSING_MONTH'
        },
        { status: 400 }
      );
    }

    const month = parseInt(monthParam);
    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        {
          error: 'Month must be a number between 1 and 12',
          code: 'INVALID_MONTH'
        },
        { status: 400 }
      );
    }

    // Validate year parameter
    if (!yearParam) {
      return NextResponse.json(
        {
          error: 'Year parameter is required',
          code: 'MISSING_YEAR'
        },
        { status: 400 }
      );
    }

    const year = parseInt(yearParam);
    if (isNaN(year) || year < 1000 || year > 9999) {
      return NextResponse.json(
        {
          error: 'Year must be a valid 4-digit number',
          code: 'INVALID_YEAR'
        },
        { status: 400 }
      );
    }

    // Calculate start_date and end_date for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Query excursionCapacity collection
    const capacityRecords = await ExcursionCapacity.find({
      excursionId: excursion_id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    console.log(`Checking capacity for ${excursion_id} from ${startDate} to ${endDate}`);
    console.log(`Found ${capacityRecords.length} capacity records`);

    // Create a map for quick lookup of capacity records by date
    const capacityMap = new Map(
      capacityRecords.map(record => [record.date, record])
    );

    // Generate complete calendar array for all days in month
    const calendar = [];
    for (let day = 1; day <= lastDay; day++) {
      const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const capacityRecord = capacityMap.get(dateString);

      if (capacityRecord) {
        // Day has capacity record
        const availableSpots = capacityRecord.maxCapacity - capacityRecord.currentBookings;
        let availabilityStatus: string;

        if (availableSpots <= 0) {
          availabilityStatus = 'full';
        } else if (availableSpots < capacityRecord.maxCapacity * 0.2) {
          availabilityStatus = 'limited';
        } else {
          availabilityStatus = 'available';
        }

        calendar.push({
          date: dateString,
          hasCapacityLimit: true,
          maxCapacity: capacityRecord.maxCapacity,
          currentBookings: capacityRecord.currentBookings,
          availableSpots,
          isAvailable: capacityRecord.isAvailable,
          availabilityStatus
        });
      } else {
        // Day without capacity record (unlimited)
        calendar.push({
          date: dateString,
          hasCapacityLimit: false,
          availabilityStatus: 'available',
          message: 'No capacity limit'
        });
      }
    }

    // Return calendar data
    return NextResponse.json({
      excursionId: excursion_id,
      month,
      year,
      calendar,
      totalDays: lastDay
    }, { status: 200 });

  } catch (error) {
    console.error('GET calendar error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}