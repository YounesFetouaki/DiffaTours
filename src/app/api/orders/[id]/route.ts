import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

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

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate that forbidden fields are not being updated
    if ('_id' in body || 'orderNumber' in body || 'createdAt' in body) {
      return NextResponse.json(
        {
          error: 'Cannot update _id, orderNumber, or createdAt fields',
          code: 'FORBIDDEN_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validate updatable fields
    const updates: Record<string, any> = {};

    if (body.firstName !== undefined) {
      if (typeof body.firstName !== 'string' || body.firstName.trim() === '') {
        return NextResponse.json(
          { error: 'firstName must be a non-empty string', code: 'INVALID_FIRST_NAME' },
          { status: 400 }
        );
      }
      updates.firstName = body.firstName.trim();
    }

    if (body.lastName !== undefined) {
      if (typeof body.lastName !== 'string' || body.lastName.trim() === '') {
        return NextResponse.json(
          { error: 'lastName must be a non-empty string', code: 'INVALID_LAST_NAME' },
          { status: 400 }
        );
      }
      updates.lastName = body.lastName.trim();
    }

    if (body.email !== undefined) {
      if (typeof body.email !== 'string' || body.email.trim() === '') {
        return NextResponse.json(
          { error: 'email must be a non-empty string', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
      updates.email = body.email.trim().toLowerCase();
    }

    if (body.phone !== undefined) {
      if (typeof body.phone !== 'string' || body.phone.trim() === '') {
        return NextResponse.json(
          { error: 'phone must be a non-empty string', code: 'INVALID_PHONE' },
          { status: 400 }
        );
      }
      updates.phone = body.phone.trim();
    }

    if (body.passport !== undefined) {
      if (typeof body.passport !== 'string' || body.passport.trim() === '') {
        return NextResponse.json(
          { error: 'passport must be a non-empty string', code: 'INVALID_PASSPORT' },
          { status: 400 }
        );
      }
      updates.passport = body.passport.trim();
    }

    if (body.city !== undefined) {
      if (typeof body.city !== 'string' || body.city.trim() === '') {
        return NextResponse.json(
          { error: 'city must be a non-empty string', code: 'INVALID_CITY' },
          { status: 400 }
        );
      }
      updates.city = body.city.trim();
    }

    if (body.accommodationType !== undefined) {
      if (!['hotel', 'riad'].includes(body.accommodationType)) {
        return NextResponse.json(
          {
            error: 'accommodationType must be "hotel" or "riad"',
            code: 'INVALID_ACCOMMODATION_TYPE',
          },
          { status: 400 }
        );
      }
      updates.accommodationType = body.accommodationType;
    }

    if (body.hotelName !== undefined) {
      if (body.hotelName !== null && typeof body.hotelName !== 'string') {
        return NextResponse.json(
          { error: 'hotelName must be a string or null', code: 'INVALID_HOTEL_NAME' },
          { status: 400 }
        );
      }
      updates.hotelName = body.hotelName ? body.hotelName.trim() : null;
    }

    if (body.address !== undefined) {
      if (body.address !== null && typeof body.address !== 'string') {
        return NextResponse.json(
          { error: 'address must be a string or null', code: 'INVALID_ADDRESS' },
          { status: 400 }
        );
      }
      updates.address = body.address ? body.address.trim() : null;
    }

    if (body.userClerkId !== undefined) {
      if (body.userClerkId !== null && typeof body.userClerkId !== 'string') {
        return NextResponse.json(
          { error: 'userClerkId must be a string or null', code: 'INVALID_USER_CLERK_ID' },
          { status: 400 }
        );
      }
      updates.userClerkId = body.userClerkId ? body.userClerkId.trim() : null;
    }

    if (body.paymentMethod !== undefined) {
      if (!['cash', 'cmi', 'bank_transfer'].includes(body.paymentMethod)) {
        return NextResponse.json(
          {
            error: 'paymentMethod must be "cash", "cmi", or "bank_transfer"',
            code: 'INVALID_PAYMENT_METHOD',
          },
          { status: 400 }
        );
      }
      updates.paymentMethod = body.paymentMethod;
    }

    if (body.status !== undefined) {
      if (!['pending', 'confirmed', 'paid', 'cancelled'].includes(body.status)) {
        return NextResponse.json(
          {
            error: 'status must be "pending", "confirmed", "paid", or "cancelled"',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (body.cartItems !== undefined) {
      if (typeof body.cartItems !== 'string') {
        return NextResponse.json(
          { error: 'cartItems must be a valid JSON string', code: 'INVALID_CART_ITEMS' },
          { status: 400 }
        );
      }
      try {
        JSON.parse(body.cartItems);
        updates.cartItems = body.cartItems;
      } catch {
        return NextResponse.json(
          { error: 'cartItems must be a valid JSON string', code: 'INVALID_CART_ITEMS_JSON' },
          { status: 400 }
        );
      }
    }

    if (body.totalMad !== undefined) {
      if (typeof body.totalMad !== 'number' || body.totalMad <= 0) {
        return NextResponse.json(
          { error: 'totalMad must be a positive number', code: 'INVALID_TOTAL_MAD' },
          { status: 400 }
        );
      }
      updates.totalMad = body.totalMad;
    }

    // Always update updatedAt
    updates.updatedAt = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrder, { status: 200 });
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Order deleted successfully',
        order: deletedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}