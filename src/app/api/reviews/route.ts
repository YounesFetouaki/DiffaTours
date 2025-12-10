import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const excursionSlug = searchParams.get('excursion_slug');
    const userIdParam = searchParams.get('user_id');
    const isVerifiedParam = searchParams.get('is_verified');

    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
        { excursionName: { $regex: search, $options: 'i' } }
      ];
    }

    if (excursionSlug) {
      filter.excursionSlug = excursionSlug;
    }

    if (userIdParam) {
      filter.userId = userIdParam;
    }

    if (isVerifiedParam !== null) {
      filter.isVerified = isVerifiedParam === 'true';
    }

    const results = await Review.find(filter)
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
    const {
      userId,
      reservationId,
      excursionSlug,
      excursionName,
      rating,
      title,
      comment,
      images,
      isVerified
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!excursionSlug) {
      return NextResponse.json(
        { error: 'excursionSlug is required', code: 'MISSING_EXCURSION_SLUG' },
        { status: 400 }
      );
    }

    if (!excursionName) {
      return NextResponse.json(
        { error: 'excursionName is required', code: 'MISSING_EXCURSION_NAME' },
        { status: 400 }
      );
    }

    if (!rating && rating !== 0) {
      return NextResponse.json(
        { error: 'rating is required', code: 'MISSING_RATING' },
        { status: 400 }
      );
    }

    // Validate rating range
    const ratingValue = parseInt(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { error: 'rating must be between 1 and 5', code: 'INVALID_RATING' },
        { status: 400 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        { error: 'comment is required', code: 'MISSING_COMMENT' },
        { status: 400 }
      );
    }

    // Validate comment is not empty after trimming
    const trimmedComment = comment.trim();
    if (trimmedComment.length === 0) {
      return NextResponse.json(
        { error: 'comment cannot be empty', code: 'EMPTY_COMMENT' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      userId,
      excursionSlug: excursionSlug.trim(),
      excursionName: excursionName.trim(),
      rating: ratingValue,
      comment: trimmedComment,
    };

    // Optional fields
    if (reservationId) {
      insertData.reservationId = reservationId;
      insertData.isVerified = true;
    } else if (typeof isVerified === 'boolean') {
      insertData.isVerified = isVerified;
    } else {
      insertData.isVerified = false;
    }

    if (title) {
      insertData.title = title.trim();
    }

    if (images) {
      insertData.images = typeof images === 'string' ? images : JSON.stringify(images);
    }

    const newReview = await Review.create(insertData);

    return NextResponse.json(newReview.toObject(), { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}