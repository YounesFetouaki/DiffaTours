import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TouristBadge from '@/models/TouristBadge';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ badgeCode: string }> }
) {
  try {
    await connectDB();

    // 1. Check Clerk authentication
    const { userId: clerkId } = await auth();
    
    // 2. If not authenticated, return 401
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // 3. Fetch user from users collection by clerkId
    const user = await User.findOne({ clerkId }).lean();

    // 4. If user not found, return 404
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 5. If user.role !== 'admin', return 403
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // 6. Get badgeCode from params, validate not empty
    const { badgeCode } = await params;
    
    if (!badgeCode || badgeCode.trim() === '') {
      return NextResponse.json(
        { error: 'Badge code is required', code: 'INVALID_BADGE_CODE' },
        { status: 400 }
      );
    }

    // 7. Parse request body for revokedBy and revokedReason
    const body = await request.json();
    const { revokedBy, revokedReason } = body;

    // 8. Validate revokedBy (can be MongoDB ObjectId string or user id)
    if (!revokedBy) {
      return NextResponse.json(
        { error: 'Valid revokedBy user ID is required', code: 'INVALID_REVOKED_BY' },
        { status: 400 }
      );
    }

    // 9. Validate revokedReason is not empty string
    if (!revokedReason || typeof revokedReason !== 'string' || revokedReason.trim() === '') {
      return NextResponse.json(
        { error: 'Revocation reason is required', code: 'INVALID_REVOKED_REASON' },
        { status: 400 }
      );
    }

    // 10. Check badge exists in tourist_badges by badgeCode
    const badge = await TouristBadge.findOne({ badgeCode }).lean();

    // 11. If badge not found, return 404
    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found', code: 'BADGE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 12 & 13. Check if badge is already revoked
    if (badge.status === 'revoked') {
      return NextResponse.json(
        { error: 'Badge is already revoked', code: 'BADGE_ALREADY_REVOKED' },
        { status: 400 }
      );
    }

    // 14. Update badge with revocation details
    const currentTimestamp = new Date().toISOString();
    
    const updatedBadge = await TouristBadge.findOneAndUpdate(
      { badgeCode },
      {
        status: 'revoked',
        revokedAt: currentTimestamp,
        revokedBy: revokedBy,
        revokedReason: revokedReason.trim(),
        updatedAt: new Date()
      },
      { new: true }
    ).lean();

    // 15. Return updated badge with revocation details
    return NextResponse.json(
      {
        success: true,
        badge: updatedBadge,
        message: 'Badge revoked successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/badges/[badgeCode]/revoke error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}