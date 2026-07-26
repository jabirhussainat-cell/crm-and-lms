import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';
import { StaffModel, sanitizeStaff } from '@/models/Staff';

const SALT_ROUNDS = 10;

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const staff = await StaffModel.find({}).sort({ createdAt: 1 });
    return NextResponse.json({
      success: true,
      data: staff.map((s) => sanitizeStaff(s))
    });
  } catch (error: any) {
    console.error('API Error /api/staff GET:', error);
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
    if (body.password) {
      body.password = await bcrypt.hash(String(body.password), SALT_ROUNDS);
    }

    const newStaff = await StaffModel.create(body);

    return NextResponse.json({ success: true, data: sanitizeStaff(newStaff) }, { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/staff POST:', error);
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
      return NextResponse.json({ success: false, message: 'Staff ID required' }, { status: 400 });
    }

    // Never allow clearing password via empty PUT from client profile edits
    if (updateData.password === undefined || updateData.password === '') {
      delete updateData.password;
    } else {
      // Hash if a new plain password is being set
      updateData.password = await bcrypt.hash(String(updateData.password), SALT_ROUNDS);
    }

    const updated = await StaffModel.findOneAndUpdate({ id }, updateData, { new: true });
    return NextResponse.json({ success: true, data: sanitizeStaff(updated) });
  } catch (error: any) {
    console.error('API Error /api/staff PUT:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
