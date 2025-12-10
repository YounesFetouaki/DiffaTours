import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      userId,
      excursionSlug,
      excursionName,
      destination,
      reservationDate,
      reservationTime,
      adults,
      totalPriceMad,
      children,
      selectedItems,
      notes
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    if (!excursionSlug || typeof excursionSlug !== 'string' || excursionSlug.trim() === '') {
      return NextResponse.json({
        error: 'Excursion slug is required',
        code: 'MISSING_EXCURSION_SLUG'
      }, { status: 400 });
    }

    if (!excursionName || typeof excursionName !== 'string' || excursionName.trim() === '') {
      return NextResponse.json({
        error: 'Excursion name is required',
        code: 'MISSING_EXCURSION_NAME'
      }, { status: 400 });
    }

    if (!destination || typeof destination !== 'string' || destination.trim() === '') {
      return NextResponse.json({
        error: 'Destination is required',
        code: 'MISSING_DESTINATION'
      }, { status: 400 });
    }

    if (!reservationDate || typeof reservationDate !== 'string' || reservationDate.trim() === '') {
      return NextResponse.json({
        error: 'Reservation date is required',
        code: 'MISSING_RESERVATION_DATE'
      }, { status: 400 });
    }

    if (!reservationTime || typeof reservationTime !== 'string' || reservationTime.trim() === '') {
      return NextResponse.json({
        error: 'Reservation time is required',
        code: 'MISSING_RESERVATION_TIME'
      }, { status: 400 });
    }

    if (adults === undefined || adults === null) {
      return NextResponse.json({
        error: 'Number of adults is required',
        code: 'MISSING_ADULTS'
      }, { status: 400 });
    }

    if (totalPriceMad === undefined || totalPriceMad === null) {
      return NextResponse.json({
        error: 'Total price is required',
        code: 'MISSING_TOTAL_PRICE'
      }, { status: 400 });
    }

    // Validate field values
    const adultsNum = parseInt(adults);
    if (isNaN(adultsNum) || adultsNum < 1) {
      return NextResponse.json({
        error: 'Number of adults must be at least 1',
        code: 'INVALID_ADULTS'
      }, { status: 400 });
    }

    const childrenNum = children !== undefined && children !== null ? parseInt(children) : 0;
    if (isNaN(childrenNum) || childrenNum < 0) {
      return NextResponse.json({
        error: 'Number of children cannot be negative',
        code: 'INVALID_CHILDREN'
      }, { status: 400 });
    }

    const totalPrice = parseFloat(totalPriceMad);
    if (isNaN(totalPrice) || totalPrice <= 0) {
      return NextResponse.json({
        error: 'Total price must be greater than 0',
        code: 'INVALID_TOTAL_PRICE'
      }, { status: 400 });
    }

    // Validate selectedItems is valid JSON if provided
    if (selectedItems !== undefined && selectedItems !== null) {
      try {
        if (typeof selectedItems === 'string') {
          JSON.parse(selectedItems);
        } else {
          JSON.stringify(selectedItems);
        }
      } catch {
        return NextResponse.json({
          error: 'Selected items must be valid JSON',
          code: 'INVALID_SELECTED_ITEMS'
        }, { status: 400 });
      }
    }

    // Prepare insert data
    const bookingDateNow = new Date().toISOString().split('T')[0];

    const insertData = {
      userId: parseInt(userId),
      excursionSlug: excursionSlug.trim(),
      excursionName: excursionName.trim(),
      destination: destination.trim(),
      reservationDate: reservationDate.trim(),
      reservationTime: reservationTime.trim(),
      bookingDate: bookingDateNow,
      adults: adultsNum,
      children: childrenNum,
      totalPriceMad: totalPrice,
      selectedItems: selectedItems ? (typeof selectedItems === 'string' ? selectedItems : JSON.stringify(selectedItems)) : null,
      status: 'pending',
      paymentStatus: 'pending',
      notes: notes ? notes.trim() : null
    };

    const newReservation = await Reservation.create(insertData);

    return NextResponse.json(newReservation.toObject(), { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Filter parameters
    const userIdParam = searchParams.get('user_id');
    const statusParam = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    const filter: any = {};

    if (userIdParam) {
      const userIdNum = parseInt(userIdParam);
      if (!isNaN(userIdNum)) {
        filter.userId = userIdNum;
      }
    }

    if (statusParam) {
      filter.status = statusParam.trim();
    }

    if (search) {
      filter.$or = [
        { excursionName: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }

    const results = await Reservation.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}