import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExcursionSetting from '@/models/ExcursionSetting';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const settings = await ExcursionSetting.find().sort({ section: 1 });

    const formattedSettings = settings.map(setting => ({
      ...setting.toObject(),
      showPrice: Boolean(setting.showPrice)
    }));

    return NextResponse.json(formattedSettings, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}