import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clerk_id: string; excursion_id: string }> }
) {
  try {
    await connectDB();
    
    const resolvedParams = await params;
    const clerk_id = resolvedParams.clerk_id;
    const excursion_id = resolvedParams.excursion_id;

    // Validate clerk_id
    if (!clerk_id || typeof clerk_id !== 'string' || clerk_id.trim() === '') {
      return NextResponse.json(
        {
          error: 'Valid clerk_id is required',
          code: 'INVALID_CLERK_ID'
        },
        { status: 400 }
      );
    }

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

    // Find and delete the wishlist item
    const deleted = await Wishlist.findOneAndDelete({
      userClerkId: clerk_id.trim(),
      excursionId: excursion_id.trim()
    });

    if (!deleted) {
      return NextResponse.json(
        {
          error: 'Wishlist item not found',
          code: 'WISHLIST_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Excursion removed from wishlist successfully',
        wishlist: deleted
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE wishlist error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}