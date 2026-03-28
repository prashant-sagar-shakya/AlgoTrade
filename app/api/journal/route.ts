import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Journal } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('x-user-id') || 'user_123';
    const data = await (Journal as any).find({ userId }).sort({ date: -1 }).limit(100);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('x-user-id') || 'user_123';
    const body = await req.json();
    const entry = new Journal({ ...body, userId });
    await entry.save();
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ success: false }, { status: 201 });
  }
}
