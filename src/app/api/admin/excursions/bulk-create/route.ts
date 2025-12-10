import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import User from '@/models/User';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ExcursionItem {
  id: string;
  label: string;
  price: number;
  defaultChecked: boolean;
}

interface ExcursionInput {
  id: string;
  name: string;
  section: string;
  images: string[];
  priceMAD: number;
  location: string;
  duration: string;
  groupSize: string;
  rating: number;
  description?: string;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  availableDays?: string[];
  timeSlots?: TimeSlot[];
  items?: ExcursionItem[];
  ageGroups?: boolean;
}

interface BulkCreateRequest {
  excursions: ExcursionInput[];
}

interface ExcursionResult {
  id: string;
  success: boolean;
  action: 'created' | 'skipped' | 'failed';
  excursion?: any;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate with Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify admin role
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 403 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Admin access required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body: BulkCreateRequest = await request.json();

    // Validate excursions array
    if (!body.excursions || !Array.isArray(body.excursions)) {
      return NextResponse.json(
        { 
          error: 'excursions must be an array',
          code: 'INVALID_EXCURSIONS_FORMAT'
        },
        { status: 400 }
      );
    }

    if (body.excursions.length === 0) {
      return NextResponse.json(
        { 
          error: 'excursions array cannot be empty',
          code: 'EMPTY_EXCURSIONS_ARRAY'
        },
        { status: 400 }
      );
    }

    // Validate each excursion
    for (let i = 0; i < body.excursions.length; i++) {
      const excursion = body.excursions[i];
      
      // Required fields validation
      if (!excursion.id || typeof excursion.id !== 'string') {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: id is required and must be a string`,
            code: 'INVALID_ID'
          },
          { status: 400 }
        );
      }

      if (!excursion.name || typeof excursion.name !== 'string') {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: name is required and must be a string`,
            code: 'INVALID_NAME'
          },
          { status: 400 }
        );
      }

      if (!excursion.section || typeof excursion.section !== 'string') {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: section is required and must be a string`,
            code: 'INVALID_SECTION'
          },
          { status: 400 }
        );
      }

      if (!excursion.images || !Array.isArray(excursion.images) || excursion.images.length === 0) {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: images is required and must be a non-empty array`,
            code: 'INVALID_IMAGES'
          },
          { status: 400 }
        );
      }

      if (typeof excursion.priceMAD !== 'number' || excursion.priceMAD <= 0) {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: priceMAD is required and must be a positive number`,
            code: 'INVALID_PRICE'
          },
          { status: 400 }
        );
      }

      if (!excursion.location || typeof excursion.location !== 'string') {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: location is required and must be a string`,
            code: 'INVALID_LOCATION'
          },
          { status: 400 }
        );
      }

      if (!excursion.duration || typeof excursion.duration !== 'string') {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: duration is required and must be a string`,
            code: 'INVALID_DURATION'
          },
          { status: 400 }
        );
      }

      if (!excursion.groupSize || typeof excursion.groupSize !== 'string') {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: groupSize is required and must be a string`,
            code: 'INVALID_GROUP_SIZE'
          },
          { status: 400 }
        );
      }

      if (typeof excursion.rating !== 'number' || excursion.rating < 0 || excursion.rating > 5) {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: rating is required and must be a number between 0 and 5`,
            code: 'INVALID_RATING'
          },
          { status: 400 }
        );
      }

      // Optional fields type validation
      if (excursion.description && typeof excursion.description !== 'string') {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: description must be a string`,
            code: 'INVALID_DESCRIPTION'
          },
          { status: 400 }
        );
      }

      if (excursion.highlights && !Array.isArray(excursion.highlights)) {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: highlights must be an array`,
            code: 'INVALID_HIGHLIGHTS'
          },
          { status: 400 }
        );
      }

      if (excursion.included && !Array.isArray(excursion.included)) {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: included must be an array`,
            code: 'INVALID_INCLUDED'
          },
          { status: 400 }
        );
      }

      if (excursion.notIncluded && !Array.isArray(excursion.notIncluded)) {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: notIncluded must be an array`,
            code: 'INVALID_NOT_INCLUDED'
          },
          { status: 400 }
        );
      }

      if (excursion.availableDays && !Array.isArray(excursion.availableDays)) {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: availableDays must be an array`,
            code: 'INVALID_AVAILABLE_DAYS'
          },
          { status: 400 }
        );
      }

      if (excursion.timeSlots && !Array.isArray(excursion.timeSlots)) {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: timeSlots must be an array`,
            code: 'INVALID_TIME_SLOTS'
          },
          { status: 400 }
        );
      }

      if (excursion.items && !Array.isArray(excursion.items)) {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: items must be an array`,
            code: 'INVALID_ITEMS'
          },
          { status: 400 }
        );
      }
      
      // Validate ageGroups if provided
      if (excursion.ageGroups !== undefined && typeof excursion.ageGroups !== 'boolean') {
        return NextResponse.json(
          { 
            error: `Excursion at index ${i}: ageGroups must be a boolean`,
            code: 'INVALID_AGE_GROUPS'
          },
          { status: 400 }
        );
      }
    }

    // Process each excursion
    const results: ExcursionResult[] = [];
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const excursionData of body.excursions) {
      try {
        // Check if excursion already exists
        const existingExcursion = await Excursion.findOne({ id: excursionData.id });

        if (existingExcursion) {
          skipped++;
          results.push({
            id: excursionData.id,
            success: false,
            action: 'skipped',
            error: 'Excursion with this ID already exists'
          });
          continue;
        }

        // Create new excursion
        const newExcursion = await Excursion.create({
          id: excursionData.id,
          name: excursionData.name,
          section: excursionData.section,
          images: excursionData.images,
          priceMAD: excursionData.priceMAD,
          location: excursionData.location,
          duration: excursionData.duration,
          groupSize: excursionData.groupSize,
          rating: excursionData.rating,
          description: excursionData.description || '',
          highlights: excursionData.highlights || [],
          included: excursionData.included || [],
          notIncluded: excursionData.notIncluded || [],
          availableDays: excursionData.availableDays || [],
          timeSlots: excursionData.timeSlots || [],
          items: excursionData.items || [],
          ageGroups: excursionData.ageGroups !== undefined ? excursionData.ageGroups : false
        });

        created++;
        results.push({
          id: excursionData.id,
          success: true,
          action: 'created',
          excursion: newExcursion
        });

      } catch (error: any) {
        console.error(`Failed to create excursion ${excursionData.id}:`, error);
        failed++;
        
        // Handle duplicate key error
        if (error.code === 11000) {
          results.push({
            id: excursionData.id,
            success: false,
            action: 'skipped',
            error: 'Duplicate key error - excursion already exists'
          });
        } else {
          results.push({
            id: excursionData.id,
            success: false,
            action: 'failed',
            error: error.message || 'Failed to create excursion'
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        created,
        skipped,
        failed,
        results
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Bulk create excursions error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}