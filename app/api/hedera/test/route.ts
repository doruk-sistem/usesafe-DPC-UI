import { NextResponse } from 'next/server';

import { testHederaConnection } from '@/lib/tests/hedera-test';

export async function GET() {
  try {
    const isConnected = await testHederaConnection();
    
    if (isConnected) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Hedera connection successful' 
      });
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Hedera connection failed' 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
