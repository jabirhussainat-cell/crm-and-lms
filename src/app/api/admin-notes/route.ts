import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AdminNoteModel } from '@/models/AdminNote';

export async function GET(request: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const label = searchParams.get('label');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const query: Record<string, unknown> = {};
    if (label && label !== 'all') query.label = label;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) (query.date as Record<string, string>).$gte = dateFrom;
      if (dateTo) (query.date as Record<string, string>).$lte = dateTo;
    }

    const notes = await AdminNoteModel.find(query).sort({ date: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: notes });
  } catch (error: any) {
    console.error('API Error /api/admin-notes GET:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const body = await request.json();
    const note = await AdminNoteModel.create({
      ...body,
      id: body.id || `note_${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString()
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/admin-notes POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Note ID required' }, { status: 400 });
    }

    const updated = await AdminNoteModel.findOneAndUpdate({ id }, updateData, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('API Error /api/admin-notes PUT:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Note ID required' }, { status: 400 });
    }

    await AdminNoteModel.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error /api/admin-notes DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
