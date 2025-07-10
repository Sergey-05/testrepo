import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const photoUrl = searchParams.get('photoUrl');

  if (!photoUrl || !photoUrl.startsWith('https://t.me/')) {
    return NextResponse.json({ error: 'Invalid photo URL' }, { status: 400 });
  }

  try {
    const response = await fetch(photoUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch avatar');
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': blob.type,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json({ error: 'Failed to fetch avatar' }, { status: 500 });
  }
}