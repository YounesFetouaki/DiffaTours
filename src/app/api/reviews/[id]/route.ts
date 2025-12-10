import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || id.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Review ID is required',
          code: 'MISSING_ID'
        },
        { status: 400 }
      );
    }

    const review = await Review.findById(id).lean();

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found',
          code: 'REVIEW_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: review
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET review error:', error);
    return NextResponse.json(
      {
        success: false,
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

    if (!id || id.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Review ID is required',
          code: 'MISSING_ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, title, comment, images, isVerified } = body;

    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };

    if (rating !== undefined) {
      const ratingValue = parseInt(rating);
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return NextResponse.json(
          {
            success: false,
            error: 'rating must be between 1 and 5',
            code: 'INVALID_RATING'
          },
          { status: 400 }
        );
      }
      updateData.rating = ratingValue;
    }

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (comment !== undefined) {
      const trimmedComment = comment.trim();
      if (trimmedComment.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'comment cannot be empty',
            code: 'EMPTY_COMMENT'
          },
          { status: 400 }
        );
      }
      updateData.comment = trimmedComment;
    }

    if (images !== undefined) {
      updateData.images = typeof images === 'string' ? images : JSON.stringify(images);
    }

    if (typeof isVerified === 'boolean') {
      updateData.isVerified = isVerified;
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!updatedReview) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found',
          code: 'REVIEW_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedReview
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT review error:', error);
    return NextResponse.json(
      {
        success: false,
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

    if (!id || id.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Review ID is required',
          code: 'MISSING_ID'
        },
        { status: 400 }
      );
    }

    const deletedReview = await Review.findByIdAndDelete(id).lean();

    if (!deletedReview) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found',
          code: 'REVIEW_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Review deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE review error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}