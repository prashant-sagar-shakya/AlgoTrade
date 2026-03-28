import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    const state = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const stateMap: Record<number, string> = { 0: 'DISCONNECTED', 1: 'CONNECTED', 2: 'CONNECTING', 3: 'DISCONNECTING' };
    
    return NextResponse.json({
      status: stateMap[state] || 'UNKNOWN',
      database: mongoose.connection.db?.databaseName || 'N/A',
      host: mongoose.connection.host || 'N/A',
      collections: await mongoose.connection.db?.listCollections().toArray().then(c => c.map(x => x.name)) || [],
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'FAILED',
      error: error.message,
      hint: 'Check MongoDB Atlas → Network Access → Add your current IP'
    }, { status: 500 });
  }
}
