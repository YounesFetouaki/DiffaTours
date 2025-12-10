import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import { NextResponse, NextRequest } from 'next/server';

// GET all excursions (public route) with optional section filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get section query parameter
    const searchParams = request.nextUrl.searchParams;
    const section = searchParams.get('section');
    
    // Build query filter
    const filter: any = {};
    if (section) {
      filter.section = section;
    }
    
    const excursions = await Excursion.find(filter).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, data: excursions });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch excursions' },
      { status: 500 }
    );
  }
}