import { NextResponse } from 'next/server';
import { hederaTopicService } from '@/lib/services/hedera-topic';

export async function POST() {
  try {
    const topicId = await hederaTopicService.createTopic();
    
    return NextResponse.json({ 
      status: 'success', 
      topicId,
      message: 'Topic created successfully' 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
} 