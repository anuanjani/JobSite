import { NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';
import { safeString } from '../../../utils/db';

const utapi = new UTApi();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawKey = safeString(body?.fileKey || body?.url, 300);

    if (!rawKey) {
      return NextResponse.json(
        { error: 'Valid file key is required.' },
        { status: 400 }
      );
    }

    // Extract key from UploadThing URL if full URL was passed
    const extracted = rawKey.includes('/f/')
      ? rawKey.split('/f/').pop() || ''
      : rawKey;

    // Strictly allow only valid UploadThing key characters
    if (!/^[a-zA-Z0-9._-]{8,128}$/.test(extracted)) {
      return NextResponse.json(
        { error: 'Invalid file key format.' },
        { status: 400 }
      );
    }

    await utapi.deleteFiles(extracted);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/delete-file error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file.' },
      { status: 500 }
    );
  }
}