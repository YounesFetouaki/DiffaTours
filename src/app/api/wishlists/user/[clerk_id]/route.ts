import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clerk_id: string }> }
) {
  try {
    await connectDB();
    
    const resolvedParams = await params;
    const clerkId = resolvedParams.clerk_id;
    
    // Validate clerk_id parameter
    if (!clerkId || typeof clerkId !== 'string' || clerkId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Valid clerk_id is required',
          code: 'INVALID_CLERK_ID'
        },
        { status: 400 }
      );
    }

    // Parse and validate pagination parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    let limit = 50;
    let offset = 0;

    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { 
            error: 'Limit must be a positive integer',
            code: 'INVALID_LIMIT'
          },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 100);
    }

    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { 
            error: 'Offset must be a non-negative integer',
            code: 'INVALID_OFFSET'
          },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Query wishlists with pagination
    const results = await Wishlist.find({ userClerkId: clerkId.trim() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    return NextResponse.json(results, { status: 200 });
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