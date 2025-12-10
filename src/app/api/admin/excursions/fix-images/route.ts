import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import { NextResponse } from 'next/server';

// POST - Update excursions with proper images based on their names
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Image mappings based on excursion types
    const imageMap: Record<string, string> = {
      'balade': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      'crocoparc': 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
      'quad': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'buggy': 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=80',
      'chameau': 'https://images.unsplash.com/photo-1542044177-4fa93b3e92d3?w=800&q=80',
      'dromadaire': 'https://images.unsplash.com/photo-1542044177-4fa93b3e92d3?w=800&q=80',
      'massage': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      'hammam': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      'visite': 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80',
      'telepherique': 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&q=80',
      'fantasia': 'https://images.unsplash.com/photo-1553181043-7e1d66a89a7b?w=800&q=80',
      'marrakech': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
      'essaouira': 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=800&q=80',
      'surf': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
      'yoga': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      'paradise': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      'banana': 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&q=80',
      'jet': 'https://images.unsplash.com/photo-1525026198548-4baa812f1183?w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80'
    };

    // Get all excursions with empty or invalid images
    const excursions = await Excursion.find({
      $or: [
        { images: { $in: ['', 'test'] } },
        { images: { $size: 0 } },
        { images: { $elemMatch: { $eq: '' } } }
      ]
    });

    const updates = [];
    
    for (const excursion of excursions) {
      // Find matching image based on name or id
      let imageUrl = imageMap['default'];
      const searchText = (excursion.name + ' ' + excursion.id).toLowerCase();
      
      for (const [key, url] of Object.entries(imageMap)) {
        if (searchText.includes(key)) {
          imageUrl = url;
          break;
        }
      }
      
      // Update the excursion
      await Excursion.findByIdAndUpdate(excursion._id, {
        images: [imageUrl]
      });
      
      updates.push({
        id: excursion.id,
        name: excursion.name,
        newImage: imageUrl
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updates.length} excursions with proper images`,
      updates
    });
  } catch (error) {
    console.error('Fix Images API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix images' },
      { status: 500 }
    );
  }
}
