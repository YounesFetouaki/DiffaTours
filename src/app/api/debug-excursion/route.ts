
import { connectDB } from '@/lib/mongodb';
import { Excursion } from '@/models/Excursion';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();
        const id = 'marrakech-quad-pilot-matin-0900-1200-55';
        const excursion = await Excursion.findOne({ id }).lean();

        return NextResponse.json({
            success: true,
            excursion: excursion,
            isAdultsOnlyValue: excursion?.isAdultsOnly,
            rawKeys: excursion ? Object.keys(excursion) : []
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
