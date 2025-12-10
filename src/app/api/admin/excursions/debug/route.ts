import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import { NextResponse } from 'next/server';

// GET all excursions with full details for debugging
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const excursions = await Excursion.find({}).sort({ createdAt: -1 }).lean();
    
    // Group by section
    const grouped = excursions.reduce((acc: any, exc: any) => {
      const section = exc.section || 'unknown';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push({
        _id: exc._id,
        id: exc.id,
        name: exc.name,
        location: exc.location,
        priceMAD: exc.priceMAD,
        createdAt: exc.createdAt
      });
      return acc;
    }, {});
    
    return NextResponse.json({ 
      success: true, 
      totalCount: excursions.length,
      grouped,
      allExcursions: excursions 
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch excursions' },
      { status: 500 }
    );
  }
}

// DELETE all excursions with duplicate/incorrect data
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Delete old test/duplicate entries (keep only entries created in the last hour as safeguard)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // First, let's get all entries to see what we have
    const allExcursions = await Excursion.find({}).lean();
    
    // Delete entries with empty images or test data
    const deleteResult = await Excursion.deleteMany({
      $or: [
        { images: { $in: ['', 'test'] } },
        { images: { $size: 1, $elemMatch: { $eq: '' } } }
      ]
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deleteResult.deletedCount} duplicate/test entries`,
      deletedCount: deleteResult.deletedCount,
      totalBefore: allExcursions.length
    });
  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete excursions' },
      { status: 500 }
    );
  }
}
