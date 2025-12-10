import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { Types } from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const requestingUser = await User.findOne({ clerkId: userId }).lean();

    if (!requestingUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (requestingUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, phone, role } = body;

    if (role && role !== 'user' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Role must be either "user" or "admin"', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (email !== undefined) {
      updateData.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }
    if (role !== undefined) {
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).lean();

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const requestingUser = await User.findOne({ clerkId: userId }).lean();

    if (!requestingUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (requestingUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (targetUser.clerkId === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account', code: 'CANNOT_DELETE_SELF' },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(id).lean();

    return NextResponse.json(
      {
        message: 'User deleted successfully',
        user: deletedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}