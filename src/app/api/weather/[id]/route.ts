import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// UPDATE
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();
    const { locationName } = body; // only allow updating locationName for simplicity

    if (!locationName) {
      return NextResponse.json({ error: 'Missing locationName' }, { status: 400 });
    }

    const record = await db.searchRecord.update({
      where: { id },
      data: { locationName },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('UPDATE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await db.searchRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
