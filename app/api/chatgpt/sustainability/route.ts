import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const API_URL = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`;
    const API_KEY = process.env.AZURE_OPENAI_KEY;

    if (!API_KEY) {
      return NextResponse.json({ error: 'Azure OpenAI API key is not configured' }, { status: 500 });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a sustainability expert. Answer only with a JSON object, no extra text.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from Azure OpenAI');
    }

    return NextResponse.json({ response: content });
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to get sustainability metrics' }, { status: 500 });
  }
} 