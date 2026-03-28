import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('x-user-id') || 'user_123';
    
    let user = await (User as any).findOne({ userId });
    if (!user) {
      user = new User({ 
        userId,
        balance: 10000,
        watchlist: ['BTC-USD', 'ETH-USD', 'RELIANCE.NS', 'AAPL', 'TSLA']
      });
      await user.save();
    }
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ 
      userId: req.headers.get('x-user-id') || 'user_123',
      balance: 10000,
      watchlist: ['BTC-USD', 'ETH-USD', 'RELIANCE.NS'],
      isDemo: true
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('x-user-id') || 'user_123';
    const data = await req.json();
    
    // Use $set to merge nested settings without overwriting the whole object
    const updateOps: any = {};
    if (data.balance !== undefined) updateOps.balance = data.balance;
    if (data.watchlist !== undefined) updateOps.watchlist = data.watchlist;
    if (data.settings) {
      for (const [key, val] of Object.entries(data.settings)) {
        updateOps[`settings.${key}`] = val;
      }
    }

    const user = await (User as any).findOneAndUpdate(
      { userId }, 
      { $set: updateOps }, 
      { new: true, upsert: true }
    );
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ success: false, isDemo: true });
  }
}
