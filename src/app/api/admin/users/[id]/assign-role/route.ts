import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function PUT(
  request: NextRequest,

  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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

    // Check if user is admin or super_admin
    if (authUser.role !== 'admin' && authUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'ADMIN_ACCESS_REQUIRED' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if target user exists (try by ID first, then valid Clerk ID or generic lookup)
    let targetUser = null;
    try {
      targetUser = await User.findById(id);
    } catch (e) {
      // If ID parsing fails, it might be a Clerk ID
      console.log('Not a valid MongoDB ID, checking by clerkId');
    }

    if (!targetUser) {
      targetUser = await User.findOne({ clerkId: id });
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found', code: 'TARGET_USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Protection Logic:
    // 1. Only Super Admin can change the role of an Admin or Super Admin.
    // 2. Admin cannot change role OF an existing Admin/Super Admin.
    if ((targetUser.role === 'admin' || targetUser.role === 'super_admin') && authUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'You do not have permission to modify this user\'s role.', code: 'FORBIDDEN_SUPER_ADMIN_ONLY' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['user', 'staff', 'admin', 'super_admin'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // Protection Logic:
    // 3. Admin cannot assign 'super_admin' role or 'admin' role?
    // The prompt says "other admin can do all admin things without the ability to touch the same role".
    // Let's prevent Admin from promoting anyone to Super Admin.
    if (role === 'super_admin' && authUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only Super Admin can assign the Super Admin role.', code: 'FORBIDDEN_SUPER_ADMIN_REQUIRED' },
        { status: 403 }
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