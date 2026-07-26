import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { IncomeModel } from '@/models/Income';

export async function GET(request: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const query: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) (query.date as Record<string, string>).$gte = dateFrom;
      if (dateTo) (query.date as Record<string, string>).$lte = dateTo;
    }

    const incomes = await IncomeModel.find(query).sort({ date: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: incomes });
  } catch (error: any) {
    console.error('API Error /api/incomes GET:', error);
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
    const income = await IncomeModel.create({
      ...body,
      id: body.id || `inc_${Date.now()}`,
      amount: Number(body.amount) || 0,
      createdAt: body.createdAt || new Date().toISOString()
    });

    return NextResponse.json({ success: true, data: income }, { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/incomes POST:', error);
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
      return NextResponse.json({ success: false, message: 'Income ID required' }, { status: 400 });
    }

    await IncomeModel.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error /api/incomes DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
