import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import User from '@/models/User';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ExcursionUpdate {
  id: string;
  availableDays: string[];
  timeSlots: TimeSlot[];
}

interface RequestBody {
  updates: ExcursionUpdate[];
}

interface UpdateResult {
  id: string;
  success: boolean;
  excursion?: any;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authentication with Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify admin role
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body: RequestBody = await request.json();

    if (!body.updates || !Array.isArray(body.updates)) {
      return NextResponse.json(
        { 
          error: 'Updates must be an array', 
          code: 'INVALID_UPDATES_FORMAT' 
        },
        { status: 400 }
      );
    }

    if (body.updates.length === 0) {
      return NextResponse.json(
        { 
          error: 'Updates array cannot be empty', 
          code: 'EMPTY_UPDATES' 
        },
        { status: 400 }
      );
    }

    // Validate each update object
    for (let i = 0; i < body.updates.length; i++) {
      const update = body.updates[i];

      if (!update.id || typeof update.id !== 'string') {
        return NextResponse.json(
          { 
            error: `Update at index ${i}: id is required and must be a string`, 
            code: 'INVALID_ID' 
          },
          { status: 400 }
        );
      }

      if (!update.availableDays || !Array.isArray(update.availableDays)) {
        return NextResponse.json(
          { 
            error: `Update at index ${i}: availableDays is required and must be an array`, 
            code: 'INVALID_AVAILABLE_DAYS' 
          },
          { status: 400 }
        );
      }

      if (update.availableDays.some(day => typeof day !== 'string')) {
        return NextResponse.json(
          { 
            error: `Update at index ${i}: availableDays must contain only strings`, 
            code: 'INVALID_AVAILABLE_DAYS_FORMAT' 
          },
          { status: 400 }
        );
      }

      if (!update.timeSlots || !Array.isArray(update.timeSlots)) {
        return NextResponse.json(
          { 
            error: `Update at index ${i}: timeSlots is required and must be an array`, 
            code: 'INVALID_TIME_SLOTS' 
          },
          { status: 400 }
        );
      }

      for (let j = 0; j < update.timeSlots.length; j++) {
        const slot = update.timeSlots[j];
        
        if (!slot.startTime || typeof slot.startTime !== 'string') {
          return NextResponse.json(
            { 
              error: `Update at index ${i}, timeSlot ${j}: startTime is required and must be a string`, 
              code: 'INVALID_START_TIME' 
            },
            { status: 400 }
          );
        }

        if (!slot.endTime || typeof slot.endTime !== 'string') {
          return NextResponse.json(
            { 
              error: `Update at index ${i}, timeSlot ${j}: endTime is required and must be a string`, 
              code: 'INVALID_END_TIME' 
            },
            { status: 400 }
          );
        }
      }
    }

    // Process updates
    const results: UpdateResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const update of body.updates) {
      try {
        const excursion = await Excursion.findOneAndUpdate(
          { id: update.id },
          {
            availableDays: update.availableDays,
            timeSlots: update.timeSlots,
            updatedAt: new Date()
          },
          { new: true, runValidators: true }
        );

        if (!excursion) {
          results.push({
            id: update.id,
            success: false,
            error: 'Excursion not found'
          });
          failedCount++;
        } else {
          results.push({
            id: update.id,
            success: true,
            excursion: excursion.toObject()
          });
          successCount++;
        }
      } catch (error: any) {
        console.error(`Error updating excursion ${update.id}:`, error);
        results.push({
          id: update.id,
          success: false,
          error: error.message || 'Update failed'
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      updated: successCount,
      failed: failedCount,
      results
    }, { status: 200 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}