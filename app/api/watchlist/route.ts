import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('x-user-id') || 'user_123';
    const { symbol } = await req.json();

    if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 });

    const user = await (User as any).findOneAndUpdate(
      { userId },
      { $addToSet: { watchlist: symbol } },
      { new: true, upsert: true }
    );

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
