import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userClerkId = searchParams.get('userClerkId');
    const excursionId = searchParams.get('excursionId');

    // Validate required parameters
    if (!userClerkId || userClerkId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'userClerkId is required and cannot be empty',
          code: 'MISSING_USER_CLERK_ID'
        },
        { status: 400 }
      );
    }

    if (!excursionId || excursionId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'excursionId is required and cannot be empty',
          code: 'MISSING_EXCURSION_ID'
        },
        { status: 400 }
      );
    }

    // Query for matching wishlist record
    const wishlistRecord = await Wishlist.findOne({
      userClerkId: userClerkId.trim(),
      excursionId: excursionId.trim()
    });

    // Return result based on whether record exists
    if (wishlistRecord) {
      return NextResponse.json(
        {
          inWishlist: true,
          wishlistId: wishlistRecord._id
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        inWishlist: false,
        wishlistId: null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET wishlist check error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}