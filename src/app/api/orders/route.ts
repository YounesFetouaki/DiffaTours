import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Notification from '@/models/Notification';
import ExcursionCapacity from '@/models/ExcursionCapacity';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single order by ID
    if (id) {
      const order = await Order.findById(id).lean();

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(order, { status: 200 });
    }

    // List orders with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const userClerkId = searchParams.get('userClerkId');

    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // User Clerk ID filter
    if (userClerkId) {
      filter.userClerkId = userClerkId;
    }

    const results = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'passport',
      'city',
      'accommodationType',
      'paymentMethod',
      'cartItems',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: `${field} is required`,
            code: 'MISSING_REQUIRED_FIELD',
          },
          { status: 400 }
        );
      }
    }

    // Validate totalMad separately (allow 0 but not undefined/null)
    if (body.totalMad === undefined || body.totalMad === null) {
      return NextResponse.json(
        {
          error: 'totalMad is required',
          code: 'MISSING_REQUIRED_FIELD',
        },
        { status: 400 }
      );
    }

    // Validate field types and formats
    const {
      firstName,
      lastName,
      email,
      phone,
      passport,
      city,
      accommodationType,
      hotelName,
      address,
      paymentMethod,
      cartItems,
      totalMad,
      userClerkId,
      status,
    } = body;

    // Validate non-empty strings
    if (
      typeof firstName !== 'string' ||
      firstName.trim() === '' ||
      typeof lastName !== 'string' ||
      lastName.trim() === '' ||
      typeof email !== 'string' ||
      email.trim() === '' ||
      typeof phone !== 'string' ||
      phone.trim() === '' ||
      typeof passport !== 'string' ||
      passport.trim() === '' ||
      typeof city !== 'string' ||
      city.trim() === ''
    ) {
      return NextResponse.json(
        {
          error: 'All required text fields must be non-empty strings',
          code: 'INVALID_FIELD_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Validate accommodationType
    if (!['hotel', 'riad'].includes(accommodationType)) {
      return NextResponse.json(
        {
          error: 'accommodationType must be "hotel" or "riad"',
          code: 'INVALID_ACCOMMODATION_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate paymentMethod
    if (!['cash', 'cmi', 'bank_transfer'].includes(paymentMethod)) {
      return NextResponse.json(
        {
          error: 'paymentMethod must be "cash", "cmi", or "bank_transfer"',
          code: 'INVALID_PAYMENT_METHOD',
        },
        { status: 400 }
      );
    }

    // Validate totalMad (allow 0 for circuits with hidden prices)
    if (typeof totalMad !== 'number' || totalMad < 0) {
      return NextResponse.json(
        {
          error: 'totalMad must be a non-negative number',
          code: 'INVALID_TOTAL_MAD',
        },
        { status: 400 }
      );
    }

    // Validate cartItems is valid JSON string
    if (typeof cartItems !== 'string') {
      return NextResponse.json(
        {
          error: 'cartItems must be a JSON string',
          code: 'INVALID_CART_ITEMS',
        },
        { status: 400 }
      );
    }

    let parsedCartItems;
    try {
      parsedCartItems = JSON.parse(cartItems);
    } catch {
      return NextResponse.json(
        {
          error: 'cartItems must be valid JSON',
          code: 'INVALID_CART_ITEMS_JSON',
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'paid', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `status must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Check availability before creating order
    for (const item of parsedCartItems) {
      const totalPeople = (item.ageGroups?.['0-4'] || 0) + (item.ageGroups?.['4-12'] || 0) + (item.ageGroups?.['adult'] || 0);
      
      const capacity = await ExcursionCapacity.findOne({
        excursionId: item.excursionId,
        date: item.date
      });

      if (capacity) {
        const availableSpots = capacity.maxCapacity - capacity.currentBookings;
        
        if (!capacity.isAvailable || availableSpots < totalPeople) {
          return NextResponse.json(
            {
              error: `Insufficient capacity for ${item.excursionName} on ${item.date}`,
              code: 'INSUFFICIENT_CAPACITY',
              excursionName: item.excursionName,
              date: item.date,
            },
            { status: 400 }
          );
        }
      }
    }

    // Generate orderNumber
    const orderNumber = randomUUID();

    // Prepare insert data
    const insertData: any = {
      orderNumber,
      userClerkId: userClerkId || undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passport: passport.trim(),
      city: city.trim(),
      accommodationType,
      hotelName: hotelName?.trim() || undefined,
      address: address?.trim() || undefined,
      paymentMethod,
      cartItems,
      totalMad,
      status: status || 'pending',
      paymentStatus: 'pending',
      locale: body.locale || 'fr', // Add locale support
    };

    const newOrder = await Order.create(insertData);

    // Update capacity counts for each cart item
    try {
      for (const item of parsedCartItems) {
        const totalPeople = (item.ageGroups?.['0-4'] || 0) + (item.ageGroups?.['4-12'] || 0) + (item.ageGroups?.['adult'] || 0);
        
        const capacity = await ExcursionCapacity.findOne({
          excursionId: item.excursionId,
          date: item.date
        });

        if (capacity) {
          // Update existing capacity record
          await ExcursionCapacity.findByIdAndUpdate(capacity._id, {
            $inc: { currentBookings: totalPeople },
            updatedAt: new Date()
          });
          
          console.log(`✅ Updated capacity for ${item.excursionId} on ${item.date}: +${totalPeople} bookings`);
        }
      }
    } catch (capacityError) {
      console.error('Failed to update capacity counts:', capacityError);
      // Don't fail the order creation if capacity update fails
    }

    // Create notification for all admins
    try {
      const admins = await User.find({ role: 'admin' }).lean();
      
      const adminNotifications = admins.map(admin => ({
        userId: admin.clerkId,
        type: 'order_created' as const,
        title: 'Nouvelle commande reçue',
        message: `Nouvelle commande de ${firstName} ${lastName} (${orderNumber.substring(0, 8)}...) - ${totalMad} MAD`,
        orderId: newOrder._id.toString(),
        orderNumber: newOrder.orderNumber,
        read: false,
      }));

      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
        console.log(`✅ Created ${adminNotifications.length} admin notifications for new order`);
      }
    } catch (notifError) {
      console.error('Failed to create admin notifications:', notifError);
      // Don't fail the order creation if notification fails
    }

    // Create notification for the user who placed the order
    if (userClerkId) {
      try {
        await Notification.create({
          userId: userClerkId,
          type: 'order_created' as const,
          title: 'Commande créée avec succès',
          message: `Votre commande ${orderNumber.substring(0, 8)}... a été créée. Montant: ${totalMad} MAD`,
          orderId: newOrder._id.toString(),
          orderNumber: newOrder.orderNumber,
          read: false,
        });
        console.log(`✅ Created user notification for ${userClerkId}`);
      } catch (userNotifError) {
        console.error('Failed to create user notification:', userNotifError);
        // Don't fail the order creation if notification fails
      }
    }

    // Automatically send confirmation email
    try {
      const confirmationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders/${newOrder._id.toString()}/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (confirmationResponse.ok) {
        console.log(`✅ Confirmation email sent successfully to ${email}`);
      } else {
        const error = await confirmationResponse.json();
        console.error('❌ Failed to send confirmation email:', error);
      }
    } catch (emailError) {
      console.error('❌ Error sending confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json(newOrder.toObject(), { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}