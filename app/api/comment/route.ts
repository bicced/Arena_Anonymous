import { NextResponse } from "next/server";

const baseURL = "https://api.starsarena.com";

export async function POST(request: Request) {
  try {
    const { content, postURL } = await request.json();
    
    if (!content || !postURL) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const threadId = postURL.split('/').pop();
    if (!threadId) {
      return NextResponse.json({ error: 'Invalid postURL' }, { status: 400 });
    }

    const threadResponse = await fetch(`${baseURL}/threads?threadId=${threadId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARENA_AUTH_TOKEN}`,
      },
    });

    if (!threadResponse.ok) {
      const errorData = await threadResponse.json();
      return NextResponse.json({ error: errorData.message || 'Failed to fetch thread details' }, { status: threadResponse.status });
    }

    const { thread: { userId } } = await threadResponse.json();

    const commentResponse = await fetch(`${baseURL}/threads/answer`, {
      method: 'POST',
      body: JSON.stringify({
        content: `<p>${content}</p>`,
        files: [],
        privacyType: 0,
        threadId,
        userId
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARENA_AUTH_TOKEN}`,
      },
    });

    if (!commentResponse.ok) {
      const errorData = await commentResponse.json();
      return NextResponse.json({ error: errorData.message || 'Failed to post comment' }, { status: commentResponse.status });
    }

    const data = await commentResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API call:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}
