import { NextResponse } from "next/server";

const baseURL = "https://api.starsarena.com";

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    const response = await fetch(`${baseURL}/threads`, {
      method: 'POST',
      body: JSON.stringify({
        content: `<p>${content}</p>`,
        files: [],
        privacyType: 0,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARENA_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || `HTTP error! status: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API call:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}
