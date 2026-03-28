import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ChatMessage } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('x-user-id') || 'user_123';
    const messages = await (ChatMessage as any).find({ userId }).sort({ createdAt: 1 }).limit(100);
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('x-user-id') || 'user_123';
    const body = await req.json();
    const msg = new ChatMessage({ ...body, userId });
    await msg.save();
    return NextResponse.json(msg, { status: 201 });
  } catch {
    return NextResponse.json({ success: false }, { status: 201 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('x-user-id') || 'user_123';
    await (ChatMessage as any).deleteMany({ userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
