import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { clerkId, email, name, phone } = body;

    // Validate required fields
    if (!clerkId || !email) {
      return NextResponse.json({ 
        error: 'clerkId and email are required',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Trim and normalize inputs
    const trimmedClerkId = clerkId.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();

    // Validate clerkId is not empty after trim
    if (!trimmedClerkId) {
      return NextResponse.json({ 
        error: 'clerkId cannot be empty',
        code: 'INVALID_CLERK_ID'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      }, { status: 400 });
    }

    // Check if user with clerkId already exists
    const existingUser = await User.findOne({ clerkId: trimmedClerkId });

    if (existingUser) {
      // Update existing user
      existingUser.email = trimmedEmail;
      existingUser.name = trimmedName || existingUser.name;
      existingUser.phone = trimmedPhone || existingUser.phone;
      existingUser.updatedAt = new Date();
      await existingUser.save();

      return NextResponse.json(existingUser.toObject(), { status: 200 });
    } else {
      // Create new user
      const newUser = await User.create({
        clerkId: trimmedClerkId,
        email: trimmedEmail,
        name: trimmedName,
        phone: trimmedPhone,
      });

      return NextResponse.json(newUser.toObject(), { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    const filter: any = {};

    // Apply search filter if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const results = await User.find(filter)
      .limit(limit)
      .skip(offset)
      .lean();

    // Get total count for pagination
    const totalCount = await User.countDocuments(filter);

    return NextResponse.json({
      users: results,
      total: totalCount,
      limit,
      offset
    }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}