import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import { NextRequest, NextResponse } from 'next/server';

// GET all excursions
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const excursions = await Excursion.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, data: excursions });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch excursions' },
      { status: 500 }
    );
  }
}

// POST create new excursion
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    // Validation
    if (!body.id || !body.name || !body.images || !body.priceMAD || !body.location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if excursion with same ID already exists
    const existingExcursion = await Excursion.findOne({ id: body.id });
    if (existingExcursion) {
      return NextResponse.json(
        { success: false, error: 'Excursion with this ID already exists' },
        { status: 409 }
      );
    }

    const excursion = await Excursion.create(body);

    return NextResponse.json({ success: true, data: excursion }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create excursion' },
      { status: 500 }
    );
  }
}
