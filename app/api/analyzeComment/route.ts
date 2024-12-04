import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const apiKey = "AIzaSyCBB_EvhOp1cVvagQNaHy9cnpcb2fYe2gg";

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
  }

  const url = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

  try {
    const { text } = await req.json();

    const requestBody = {
      comment: { text },
      languages: ['en'],
      requestedAttributes: { TOXICITY: {} },
    };

    const response = await axios.post(`${url}?key=${apiKey}`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in Perspective API request:', error);
    return NextResponse.json({ error: 'Failed to analyze comment' }, { status: 500 });
  }
}
