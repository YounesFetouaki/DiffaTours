import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import BadgeScan from '@/models/BadgeScan';
import TouristBadge from '@/models/TouristBadge';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 1. Check Clerk authentication
    const { userId: clerkId } = await auth();
    
    // 2. If not authenticated, return 401
    if (!clerkId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    // 3. Fetch user from users collection by clerkId
    const user = await User.findOne({ clerkId }).lean();

    // 4. If user not found, return 404
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // 5. Check if user has staff or admin role
    if (user.role !== 'admin' && user.role !== 'staff') {
      return NextResponse.json({ 
        error: 'Staff or admin access required',
        code: 'INSUFFICIENT_PERMISSIONS' 
      }, { status: 403 });
    }

    // 6. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    // 7. Fetch scan history with badge details using aggregation
    const scans = await BadgeScan.aggregate([
      {
        $lookup: {
          from: 'touristbadges',
          localField: 'badgeId',
          foreignField: '_id',
          as: 'badgeDetails'
        }
      },
      {
        $unwind: {
          path: '$badgeDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          id: '$_id',
          badge_code: '$badgeCode',
          scanned_by: '$scannedBy',
          scanner_name: '$scannerName',
          scanner_email: '$scannerEmail',
          scan_result: '$scanResult',
          scan_location: '$scanLocation',
          device_info: '$deviceInfo',
          scanned_at: '$scannedAt',
          created_at: '$createdAt',
          is_valid: { $eq: ['$scanResult', 'valid'] },
          badge: {
            tourist_name: '$badgeDetails.touristName',
            tourist_email: '$badgeDetails.email',
            order_number: '$badgeDetails.orderNumber',
            trip_info: '$badgeDetails.tripDetails',
            status: '$badgeDetails.status',
            valid_until: '$badgeDetails.validUntil'
          }
        }
      },
      { $sort: { scanned_at: -1 } },
      { $skip: offset },
      { $limit: limit }
    ]);

    // 8. Get total count
    const total = await BadgeScan.countDocuments();

    // 9. Return scan history with badge details
    return NextResponse.json({
      scans: scans,
      total: total,
      limit: limit,
      offset: offset
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/badges/scan-history error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}