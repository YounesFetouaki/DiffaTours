import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // Delete all excursions where section is NOT 'circuits'
    const result = await Excursion.deleteMany({
      section: { $ne: 'circuits' }
    });
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} non-circuit excursions`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting non-circuit excursions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete non-circuit excursions'
      },
      { status: 500 }
    );
  }
}
