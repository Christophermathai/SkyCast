import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    const records = await db.searchRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const header = 'id,locationName,latitude,longitude,createdAt\n';
      const rows = records.map((r: any) => `"${r.id}","${r.locationName}",${r.latitude},${r.longitude},"${r.createdAt.toISOString()}"`).join('\n');
      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="weather_data.csv"',
        },
      });
    }

    if (format === 'md') {
      let md = '# Weather Data Export\n\n';
      md += '| ID | Location | Lat | Lng | Date |\n';
      md += '|---|---|---|---|---|\n';
      records.forEach((r: any) => {
        md += `| ${r.id} | ${r.locationName} | ${r.latitude} | ${r.longitude} | ${r.createdAt.toISOString()} |\n`;
      });
      return new NextResponse(md, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="weather_data.md"',
        },
      });
    }

    // Default JSON
    return new NextResponse(JSON.stringify(records, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="weather_data.json"',
      },
    });
  } catch (error) {
    console.error('EXPORT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
