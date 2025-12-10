import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clerk_id: string }> }
) {
  try {
    console.log('📖 Fetching user reservations...');

    await connectDB();
    console.log('✅ Database connected');
    
    // Get session from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ No authenticated user');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }

    console.log('✅ Clerk session authenticated:', userId);

    const { clerk_id } = await params;
    console.log('🔍 Looking up reservations for user:', clerk_id);

    // Validate clerk_id
    if (!clerk_id || typeof clerk_id !== 'string' || clerk_id.trim() === '') {
      console.log('❌ Invalid user ID provided');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Ensure users can only access their own reservations
    if (userId !== clerk_id) {
      console.log(`❌ Forbidden: User ${userId} attempted to access reservations for ${clerk_id}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden',
          code: 'FORBIDDEN' 
        },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    console.log(`📄 Pagination: limit=${limit}, offset=${offset}`);

    // Find the user by clerkId
    const user = await User.findOne({ clerkId: clerk_id }).lean();

    if (!user) {
      console.log('❌ User not found in database:', clerk_id);
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.email);

    // Get all reservations for this user using MongoDB user _id (ObjectId)
    const userReservations = await Reservation.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    console.log(`✅ Found ${userReservations.length} reservations for user`);

    return NextResponse.json(
      {
        success: true,
        data: userReservations,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ GET reservations by user_id error:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}