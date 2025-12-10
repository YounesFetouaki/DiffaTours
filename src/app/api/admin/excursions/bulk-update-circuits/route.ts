import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Update all excursions where section = 'circuits' to set priceMAD = 0
    const result = await Excursion.updateMany(
      { section: 'circuits' },
      { $set: { priceMAD: 0 } }
    );
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} circuits to have priceMAD = 0`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating circuits:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update circuits'
      },
      { status: 500 }
    );
  }
}
