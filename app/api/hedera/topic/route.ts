import { NextResponse } from 'next/server';
import { hederaTopicService } from '@/lib/services/hedera-topic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const transactionId = await hederaTopicService.submitMessage(data);
    
    return NextResponse.json({ 
      status: 'success', 
      transactionId,
      message: 'Message submitted to Hedera topic successfully' 
    });
  } catch (error: any) {
    console.error('Error submitting message:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await hederaTopicService.getMessages();
    
    return NextResponse.json({ 
      status: 'success', 
      messages,
      message: 'Messages retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error retrieving messages:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      details: error.toString()
    }, { status: 500 });
  }
} 