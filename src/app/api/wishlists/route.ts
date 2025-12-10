import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userClerkId, excursionId } = body;

    // Validate required fields
    if (!userClerkId || typeof userClerkId !== 'string' || userClerkId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'userClerkId is required and must be a non-empty string',
          code: 'MISSING_USER_CLERK_ID'
        },
        { status: 400 }
      );
    }

    if (!excursionId || typeof excursionId !== 'string' || excursionId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'excursionId is required and must be a non-empty string',
          code: 'MISSING_EXCURSION_ID'
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedUserClerkId = userClerkId.trim();
    const sanitizedExcursionId = excursionId.trim();

    // Check if combination already exists
    const existingWishlist = await Wishlist.findOne({
      userClerkId: sanitizedUserClerkId,
      excursionId: sanitizedExcursionId
    });

    // If exists, return existing record with 200
    if (existingWishlist) {
      return NextResponse.json(existingWishlist, { status: 200 });
    }

    // Create new wishlist item
    const newWishlist = await Wishlist.create({
      userClerkId: sanitizedUserClerkId,
      excursionId: sanitizedExcursionId,
    });

    // Return created record with 201
    return NextResponse.json(newWishlist, { status: 201 });

  } catch (error) {
    console.error('POST wishlist error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}