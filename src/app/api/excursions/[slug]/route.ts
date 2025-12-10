import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import { NextRequest, NextResponse } from 'next/server';

// GET single excursion by slug (public route)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectDB();
    const excursion = await Excursion.findOne({ id: slug }).lean();

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
