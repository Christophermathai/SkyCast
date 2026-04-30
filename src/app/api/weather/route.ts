import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// CREATE
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { locationName, latitude, longitude, startDate, endDate, weatherData } = body;

    if (!locationName || latitude === undefined || longitude === undefined || !weatherData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const record = await db.searchRecord.create({
      data: {
        locationName,
        latitude,
        longitude,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        weatherData: JSON.stringify(weatherData),
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('CREATE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// READ
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const records = await db.searchRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('READ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
