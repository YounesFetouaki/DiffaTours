import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    const reservation = await Reservation.findById(id).lean();

    if (!reservation) {
      return NextResponse.json(
        { 
          error: 'Reservation not found',
          code: 'RESERVATION_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
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
    
    const { id } = await params;

    const body = await request.json();
    const {
      status,
      paymentStatus,
      adults,
      children,
      totalPriceMad,
      notes,
      reservationDate,
      reservationTime
    } = body;

    const existingReservation = await Reservation.findById(id);

    if (!existingReservation) {
      return NextResponse.json(
        { 
          error: 'Reservation not found',
          code: 'RESERVATION_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Validate status values
    if (status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { 
            error: 'Invalid status value. Must be one of: pending, confirmed, completed, cancelled',
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
    }

    // Validate paymentStatus values
    if (paymentStatus !== undefined) {
      const validPaymentStatuses = ['pending', 'paid', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { 
            error: 'Invalid payment status value. Must be one of: pending, paid, refunded',
            code: 'INVALID_PAYMENT_STATUS' 
          },
          { status: 400 }
        );
      }
    }

    // Validate adults
    if (adults !== undefined) {
      if (typeof adults !== 'number' || adults < 1) {
        return NextResponse.json(
          { 
            error: 'Adults must be at least 1',
            code: 'INVALID_ADULTS_COUNT' 
          },
          { status: 400 }
        );
      }
    }

    // Validate children
    if (children !== undefined) {
      if (typeof children !== 'number' || children < 0) {
        return NextResponse.json(
          { 
            error: 'Children must be 0 or greater',
            code: 'INVALID_CHILDREN_COUNT' 
          },
          { status: 400 }
        );
      }
    }

    // Validate totalPriceMad
    if (totalPriceMad !== undefined) {
      if (typeof totalPriceMad !== 'number' || totalPriceMad <= 0) {
        return NextResponse.json(
          { 
            error: 'Total price must be greater than 0',
            code: 'INVALID_TOTAL_PRICE' 
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date()
    };

    if (status !== undefined) updates.status = status;
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;
    if (adults !== undefined) updates.adults = adults;
    if (children !== undefined) updates.children = children;
    if (totalPriceMad !== undefined) updates.totalPriceMad = totalPriceMad;
    if (notes !== undefined) updates.notes = notes;
    if (reservationDate !== undefined) updates.reservationDate = reservationDate;
    if (reservationTime !== undefined) updates.reservationTime = reservationTime;

    const updatedReservation = await Reservation.findByIdAndUpdate(id, updates, { new: true }).lean();

    return NextResponse.json(updatedReservation, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
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
    
    const { id } = await params;

    const deletedReservation = await Reservation.findByIdAndDelete(id).lean();

    if (!deletedReservation) {
      return NextResponse.json(
        { 
          error: 'Reservation not found',
          code: 'RESERVATION_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Reservation deleted successfully',
        reservation: deletedReservation 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}