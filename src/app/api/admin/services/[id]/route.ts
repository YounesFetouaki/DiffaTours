import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import Service from '@/models/Service';
import User from '@/models/User';
import { Types } from 'mongoose';

interface MultilingualText {
  en: string;
  fr: string;
  es: string;
  it: string;
}

function validateMultilingualText(value: any, fieldName: string): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'object') {
    return { valid: false, error: `${fieldName} must be an object` };
  }

  const requiredKeys = ['en', 'fr', 'es', 'it'];
  for (const key of requiredKeys) {
    if (!(key in value)) {
      return { valid: false, error: `${fieldName} must contain ${key} key` };
    }
    if (typeof value[key] !== 'string' || value[key].trim() === '') {
      return { valid: false, error: `${fieldName}.${key} must be a non-empty string` };
    }
  }

  return { valid: true };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const requestingUser = await User.findOne({ clerkId: userId }).lean();

    if (!requestingUser || requestingUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format', code: 'INVALID_ID' }, { status: 400 });
    }

    const service = await Service.findById(id).lean();

    if (!service) {
      return NextResponse.json({ error: 'Service not found', code: 'SERVICE_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('GET service error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const requestingUser = await User.findOne({ clerkId: userId }).lean();

    if (!requestingUser || requestingUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format', code: 'INVALID_ID' }, { status: 400 });
    }

    const service = await Service.findById(id);

    if (!service) {
      return NextResponse.json({ error: 'Service not found', code: 'SERVICE_NOT_FOUND' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, icon, order, active } = body;

    const updates: any = {};

    if (title !== undefined) {
      const titleValidation = validateMultilingualText(title, 'title');
      if (!titleValidation.valid) {
        return NextResponse.json({ 
          error: titleValidation.error, 
          code: 'INVALID_TITLE_FORMAT' 
        }, { status: 400 });
      }
      updates.title = title;
    }

    if (description !== undefined) {
      const descriptionValidation = validateMultilingualText(description, 'description');
      if (!descriptionValidation.valid) {
        return NextResponse.json({ 
          error: descriptionValidation.error, 
          code: 'INVALID_DESCRIPTION_FORMAT' 
        }, { status: 400 });
      }
      updates.description = description;
    }

    if (icon !== undefined) {
      if (typeof icon !== 'string' || icon.trim() === '') {
        return NextResponse.json({ 
          error: 'Icon must be a non-empty string', 
          code: 'INVALID_ICON' 
        }, { status: 400 });
      }
      updates.icon = icon.trim();
    }

    if (order !== undefined) {
      if (typeof order !== 'number' || order < 0 || !Number.isInteger(order)) {
        return NextResponse.json({ 
          error: 'Order must be an integer greater than or equal to 0', 
          code: 'INVALID_ORDER' 
        }, { status: 400 });
      }
      updates.order = order;
    }

    if (active !== undefined) {
      if (typeof active !== 'boolean') {
        return NextResponse.json({ 
          error: 'Active must be a boolean', 
          code: 'INVALID_ACTIVE' 
        }, { status: 400 });
      }
      updates.active = active;
    }

    const updatedService = await Service.findByIdAndUpdate(id, updates, { new: true }).lean();

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('PUT service error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
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
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const requestingUser = await User.findOne({ clerkId: userId }).lean();

    if (!requestingUser || requestingUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format', code: 'INVALID_ID' }, { status: 400 });
    }

    const deletedService = await Service.findByIdAndDelete(id).lean();

    if (!deletedService) {
      return NextResponse.json({ error: 'Service not found', code: 'SERVICE_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Service deleted successfully',
      service: deletedService,
    });
  } catch (error) {
    console.error('DELETE service error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}