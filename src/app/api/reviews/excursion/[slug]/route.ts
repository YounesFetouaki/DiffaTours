import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Excursion slug is required',
          code: 'MISSING_SLUG',
        },
        { status: 400 }
      );
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const isVerifiedParam = searchParams.get('is_verified');

    const filter: any = { excursionSlug: slug };

    if (isVerifiedParam !== null) {
      filter.isVerified = isVerifiedParam === 'true';
    }

    const reviewsData = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const allReviewsForExcursion = await Review.find({ excursionSlug: slug }).lean();

    const totalReviews = allReviewsForExcursion.length;

    let averageRating = 0;
    if (totalReviews > 0) {
      const sumRatings = allReviewsForExcursion.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = parseFloat((sumRatings / totalReviews).toFixed(1));
    }

    return NextResponse.json(
      {
        success: true,
        data: reviewsData,
        averageRating,
        totalReviews,
        excursionSlug: slug,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET reviews error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}