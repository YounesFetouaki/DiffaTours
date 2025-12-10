import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TouristBadge from '@/models/TouristBadge';
import BadgeScan from '@/models/BadgeScan';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
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

    // 5. If user.role !== 'admin' AND user.role !== 'staff', return 403
    if (user.role !== 'admin' && user.role !== 'staff') {
      return NextResponse.json({ 
        error: 'Staff or admin access required',
        code: 'INSUFFICIENT_PERMISSIONS' 
      }, { status: 403 });
    }

    // 6. Parse request body, validate required fields
    const body = await request.json();
    const { badgeCode, scanLocation, deviceInfo } = body;

    // Validate required fields - only badgeCode is required from request
    if (!badgeCode) {
      return NextResponse.json({ 
        error: 'Badge code is required',
        code: 'MISSING_BADGE_CODE' 
      }, { status: 400 });
    }

    // Use authenticated user's information
    const scannedBy = user._id;
    const scannerName = user.name || user.email || 'Unknown';
    const scannerEmail = user.email || '';

    // 8. Query tourist_badges collection by badgeCode
    const badge = await TouristBadge.findOne({ badgeCode }).lean();

    let scanResult: string;
    let message: string;
    const currentDate = new Date();

    // 9. Determine scan result
    if (!badge) {
      // Badge not found
      scanResult = 'not_found';
      message = 'Badge not found';
    } else {
      const validUntilDate = new Date(badge.validUntil);

      if (badge.status === 'revoked') {
        scanResult = 'revoked';
        message = 'Badge has been revoked';
      } else if (badge.status === 'expired') {
        scanResult = 'expired';
        message = 'Badge has expired';
      } else if (currentDate > validUntilDate) {
        scanResult = 'expired';
        message = 'Badge validity period has ended';
      } else if (badge.status === 'active' && currentDate <= validUntilDate) {
        scanResult = 'valid';
        message = 'Badge is valid';
      } else {
        scanResult = 'invalid';
        message = 'Badge is invalid';
      }
    }

    // 10. Record scan in badge_scans collection
    const currentTimestamp = new Date().toISOString();
    const scanRecord = await BadgeScan.create({
      badgeId: badge?._id || null,
      badgeCode: badgeCode,
      scannedBy: scannedBy,
      scannerName: scannerName,
      scannerEmail: scannerEmail,
      scanResult: scanResult,
      scanLocation: scanLocation || 'Scanner App',
      deviceInfo: deviceInfo || null,
      scannedAt: currentTimestamp,
    });

    // 11. Return scan result with badge details and message
    return NextResponse.json({
      result: scanResult,
      badge: badge,
      message: message,
      scanRecord: scanRecord.toObject()
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/badges/scan error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

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

    // 5. If user.role !== 'admin', return 403
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED' 
      }, { status: 403 });
    }

    // 6. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const badgeCode = searchParams.get('badgeCode');
    const scannedBy = searchParams.get('scannedBy');
    const scanResult = searchParams.get('scanResult');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
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

    // 7. Build query with filters
    const filter: any = {};

    if (badgeCode) {
      filter.badgeCode = badgeCode;
    }
    
    if (scannedBy) {
      filter.scannedBy = scannedBy;
    }
    
    if (scanResult) {
      const validResults = ['valid', 'invalid', 'revoked', 'expired', 'not_found'];
      if (!validResults.includes(scanResult)) {
        return NextResponse.json({ 
          error: 'Invalid scanResult parameter. Must be one of: valid, invalid, revoked, expired, not_found',
          code: 'INVALID_SCAN_RESULT' 
        }, { status: 400 });
      }
      filter.scanResult = scanResult;
    }

    // 8 & 9. Apply filters, pagination and order
    const scans = await BadgeScan.find(filter)
      .sort({ scannedAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    // 10. Get total count
    const total = await BadgeScan.countDocuments(filter);

    // 11. Return paginated scan history
    return NextResponse.json({
      scans: scans,
      total: total,
      limit: limit,
      offset: offset
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/badges/scan error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}