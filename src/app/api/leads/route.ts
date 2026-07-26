import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { LeadModel } from '@/models/Lead';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    // Remove any previously seeded demo leads
    await LeadModel.deleteMany({
      id: { $in: ['lead_1', 'lead_2', 'lead_3', 'lead_4', 'lead_5', 'lead_6'] }
    });

    const leads = await LeadModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: leads });
  } catch (error: any) {
    console.error('API Error /api/leads GET:', error);
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
    const newLead = await LeadModel.create(body);

    return NextResponse.json({ success: true, data: newLead }, { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/leads POST:', error);
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
      return NextResponse.json({ success: false, message: 'Lead ID required' }, { status: 400 });
    }

    const updated = await LeadModel.findOneAndUpdate({ id }, updateData, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('API Error /api/leads PUT:', error);
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
      return NextResponse.json({ success: false, message: 'Lead ID required' }, { status: 400 });
    }

    await LeadModel.findOneAndDelete({ id });
    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('API Error /api/leads DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
