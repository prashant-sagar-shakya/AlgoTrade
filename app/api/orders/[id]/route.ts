import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/lib/models';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();
    const order = await (Order as any).findByIdAndUpdate(id, data, { new: true });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ success: true, isLocal: true });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const order = await (Order as any).findById(id);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
