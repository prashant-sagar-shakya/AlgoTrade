import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Notification } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('x-user-id') || 'user_123';
    const data = await (Notification as any).find({ userId }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const notif = new Notification(data);
    await notif.save();
    return NextResponse.json(notif, { status: 201 });
  } catch {
    return NextResponse.json({ success: false }, { status: 201 });
  }
}
