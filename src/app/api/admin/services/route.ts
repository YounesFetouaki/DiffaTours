import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import Service from '@/models/Service';
import User from '@/models/User';

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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const requestingUser = await User.findOne({ clerkId: userId });

    if (!requestingUser || (requestingUser.role !== 'admin' && requestingUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const activeParam = searchParams.get('active');

    let query: any = {};

    if (activeParam !== null) {
      const activeValue = activeParam === 'true';
      query.active = activeValue;
    }

    const results = await Service.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const parsedResults = results.map((service: any) => ({
      ...service,
      _id: service._id.toString(),
      active: Boolean(service.active)
    }));

    return NextResponse.json(parsedResults);
  } catch (error) {
    console.error('GET services error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const requestingUser = await User.findOne({ clerkId: userId });

    if (!requestingUser || (requestingUser.role !== 'admin' && requestingUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, icon, order = 0, active = true } = body;

    if (!title) {
      return NextResponse.json({
        error: 'Title is required',
        code: 'MISSING_TITLE'
      }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({
        error: 'Description is required',
        code: 'MISSING_DESCRIPTION'
      }, { status: 400 });
    }

    if (!icon || typeof icon !== 'string' || icon.trim() === '') {
      return NextResponse.json({
        error: 'Icon is required and must be a non-empty string',
        code: 'INVALID_ICON'
      }, { status: 400 });
    }

    const titleValidation = validateMultilingualText(title, 'title');
    if (!titleValidation.valid) {
      return NextResponse.json({
        error: titleValidation.error,
        code: 'INVALID_TITLE_FORMAT'
      }, { status: 400 });
    }

    const descriptionValidation = validateMultilingualText(description, 'description');
    if (!descriptionValidation.valid) {
      return NextResponse.json({
        error: descriptionValidation.error,
        code: 'INVALID_DESCRIPTION_FORMAT'
      }, { status: 400 });
    }

    if (typeof order !== 'number' || order < 0 || !Number.isInteger(order)) {
      return NextResponse.json({
        error: 'Order must be an integer greater than or equal to 0',
        code: 'INVALID_ORDER'
      }, { status: 400 });
    }

    if (typeof active !== 'boolean') {
      return NextResponse.json({
        error: 'Active must be a boolean',
        code: 'INVALID_ACTIVE'
      }, { status: 400 });
    }

    const newService = await Service.create({
      title,
      description,
      icon: icon.trim(),
      order,
      active,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const parsedService = {
      ...newService.toObject(),
      _id: newService._id.toString(),
      active: Boolean(newService.active)
    };

    return NextResponse.json(parsedService, { status: 201 });
  } catch (error) {
    console.error('POST services error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}