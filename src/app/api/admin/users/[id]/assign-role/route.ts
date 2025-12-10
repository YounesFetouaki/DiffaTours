import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Check Clerk authentication
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Fetch authenticated user from database
    const authUser = await User.findOne({ clerkId: clerkUserId });

    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'ADMIN_ACCESS_REQUIRED' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if target user exists
    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found', code: 'TARGET_USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['user', 'staff', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // Update user role in database
    const updated = await User.findByIdAndUpdate(
      id,
      {
        role: role,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // CRITICAL: Update Clerk publicMetadata to sync the role
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(targetUser.clerkId, {
        publicMetadata: {
          role: role,
        },
      });
    } catch (clerkError) {
      console.error('Failed to update Clerk metadata:', clerkError);
      return NextResponse.json(
        {
          error: 'Role updated in database but failed to sync with Clerk',
          details: clerkError instanceof Error ? clerkError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role} and synced with Clerk`,
      user: updated,
    });
  } catch (error) {
    console.error('Assign role error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}