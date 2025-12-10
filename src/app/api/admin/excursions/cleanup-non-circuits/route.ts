import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import { NextResponse } from 'next/server';

// DELETE all excursions where section is NOT "circuits"
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get count before deletion for reporting
    const beforeCount = await Excursion.countDocuments({});
    
    // Delete all excursions where section is NOT "circuits"
    const deleteResult = await Excursion.deleteMany({
      section: { $ne: 'circuits' }
    });
    
    const afterCount = await Excursion.countDocuments({});
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deleteResult.deletedCount} non-circuit excursions. ${afterCount} circuits remain.`,
      deletedCount: deleteResult.deletedCount,
      remainingCount: afterCount,
      beforeCount: beforeCount
    });
  } catch (error) {
    console.error('Cleanup API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete non-circuit excursions' },
      { status: 500 }
    );
  }
}
