import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Validate ID is a valid MongoDB ObjectId
    if (!id || id.trim() === '') {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Find and delete the wishlist item
    const deleted = await Wishlist.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          error: 'Wishlist item not found',
          code: 'WISHLIST_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Wishlist item removed successfully',
        wishlist: deleted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}