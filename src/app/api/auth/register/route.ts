import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';
import { StaffModel, sanitizeStaff } from '@/models/Staff';

const SALT_ROUNDS = 10;

function normalizePhone(phone: string) {
  return phone.replace(/[\s\-\(\)]/g, '').trim();
}

/** Register a new staff profile (when phone is not in DB). */
export async function POST(request: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const body = await request.json();
    const name = String(body.name || '').trim();
    const phone = normalizePhone(String(body.phone || ''));
    const password = String(body.password || '');
    const devicePersonalNumber = String(body.devicePersonalNumber || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const expertise = String(body.expertise || '').trim();
    const languagesKnown = String(body.languagesKnown || '').trim();

    if (!name || !phone || !password || !devicePersonalNumber || !email || !expertise || !languagesKnown) {
      return NextResponse.json(
        { success: false, message: 'All profile fields are required' },
        { status: 400 }
      );
    }

    const allStaff = await StaffModel.find({});
    const existingPhone = allStaff.find((s) => normalizePhone(s.phone) === phone);
    if (existingPhone) {
      return NextResponse.json(
        { success: false, code: 'PHONE_EXISTS', message: 'Phone already registered. Please log in.' },
        { status: 409 }
      );
    }

    const existingEmail = await StaffModel.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, code: 'EMAIL_EXISTS', message: 'Email already registered' },
        { status: 409 }
      );
    }

    const staffCount = await StaffModel.countDocuments({});
    // First 3 registered users are admins
    const role = staffCount < 3 ? 'admin' : 'staff';

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newStaff = await StaffModel.create({
      id: `usr_${Date.now()}`,
      name,
      phone,
      password: hashedPassword,
      devicePersonalNumber,
      email,
      expertise,
      languagesKnown,
      focusArea: expertise,
      department: expertise,
      designation: '',
      adminNotes: '',
      role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      joinDate: new Date().toISOString().split('T')[0],
      stats: { totalLeads: 0, closedWon: 0, revenue: 0 }
    });

    return NextResponse.json({ success: true, data: sanitizeStaff(newStaff) }, { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/auth/register POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
