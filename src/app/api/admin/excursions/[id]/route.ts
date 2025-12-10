import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

// GET single excursion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid excursion ID' },
        { status: 400 }
      );
    }

    await connectDB();
    const excursion = await Excursion.findById(id).lean();

    if (!excursion) {
      return NextResponse.json(
        { success: false, error: 'Excursion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: excursion });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch excursion' },
      { status: 500 }
    );
  }
}

// PUT update excursion (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid excursion ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const excursion = await Excursion.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true, overwrite: true }
    );

    if (!excursion) {
      return NextResponse.json(
        { success: false, error: 'Excursion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: excursion });
  } catch (error: any) {
    console.error('PUT API Error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update excursion' },
      { status: 500 }
    );
  }
}

// PATCH update excursion (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid excursion ID' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.section !== undefined) updateData.section = body.section;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.priceMAD !== undefined) updateData.priceMAD = body.priceMAD;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.groupSize !== undefined) updateData.groupSize = body.groupSize;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.highlights !== undefined) updateData.highlights = body.highlights;
    if (body.included !== undefined) updateData.included = body.included;
    if (body.notIncluded !== undefined) updateData.notIncluded = body.notIncluded;
    if (body.items !== undefined) updateData.items = body.items;
    if (body.availableDays !== undefined) updateData.availableDays = body.availableDays;
    if (body.timeSlots !== undefined) updateData.timeSlots = body.timeSlots;

    const excursion = await Excursion.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!excursion) {
      return NextResponse.json(
        { success: false, error: 'Excursion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: excursion });
  } catch (error: any) {
    console.error('PATCH API Error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update excursion' },
      { status: 500 }
    );
  }
}

// DELETE excursion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid excursion ID' },
        { status: 400 }
      );
    }

    await connectDB();
    const excursion = await Excursion.findByIdAndDelete(id);

    if (!excursion) {
      return NextResponse.json(
        { success: false, error: 'Excursion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Excursion deleted successfully' 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete excursion' },
      { status: 500 }
    );
  }
}