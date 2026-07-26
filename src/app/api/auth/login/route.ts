import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';
import { StaffModel, sanitizeStaff } from '@/models/Staff';

function normalizePhone(phone: string) {
  return phone.replace(/[\s\-\(\)]/g, '').trim();
}

/** Login with phone + password. Returns NOT_FOUND if phone is new. */
export async function POST(request: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const body = await request.json();
    const phone = normalizePhone(String(body.phone || ''));
    const password = String(body.password || '');

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, code: 'MISSING_FIELDS', message: 'Phone and password are required' },
        { status: 400 }
      );
    }

    const allStaff = await StaffModel.find({});
    const staff = allStaff.find((s) => normalizePhone(s.phone) === phone);

    if (!staff) {
      return NextResponse.json({
        success: false,
        code: 'NOT_FOUND',
        message: 'No account found. Please register.'
      });
    }

    const passwordOk = await bcrypt.compare(password, staff.password);
    if (!passwordOk) {
      return NextResponse.json(
        { success: false, code: 'INVALID_PASSWORD', message: 'Incorrect password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, data: sanitizeStaff(staff) });
  } catch (error: any) {
    console.error('API Error /api/auth/login POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
