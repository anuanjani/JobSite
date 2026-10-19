import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

// Helper to extract UploadThing file key from any UploadThing URL
function extractFileKey(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  const match = value.match(/\/f\/([^/?#\s]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

async function handleDeleteUser(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let email = searchParams.get('email');
    let userIdParam = searchParams.get('id') || searchParams.get('userId');
    let extraUrls: string[] = [];

    try {
      const body = await request.json();
      if (body.email) email = body.email;
      if (body.id || body.userId) userIdParam = String(body.id || body.userId);
      if (body.avatar) extraUrls.push(body.avatar);
      if (body.resumeUrl) extraUrls.push(body.resumeUrl);
      if (body.kycDocumentUrl) extraUrls.push(body.kycDocumentUrl);
    } catch {
      // Request might not have a JSON body if parameters were passed in URL
    }

    if (!email && !userIdParam) {
      return NextResponse.json(
        { error: 'User email or ID is required to delete account.' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 1. Find the user in `users`
    let users;
    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      users = await sql`
        SELECT id, email FROM users WHERE LOWER(TRIM(email)) = ${cleanEmail} LIMIT 1
      `;
    } else {
      users = await sql`
        SELECT id, email FROM users WHERE id = ${Number(userIdParam)} LIMIT 1
      `;
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const userId = users[0].id;
    const fileKeysToDelete = new Set<string>();

    // Collect any keys passed directly in the request body
    for (const url of extraUrls) {
      const key = extractFileKey(url);
      if (key) fileKeysToDelete.add(key);
    }

    // 2. Scan `employer_profiles` for KYC documents, logos, or avatars
    try {
      const empRows = await sql`
        SELECT * FROM employer_profiles WHERE user_id = ${userId}
      `;
      for (const row of empRows) {
        for (const val of Object.values(row)) {
          const key = extractFileKey(val);
          if (key) fileKeysToDelete.add(key);
        }
      }
    } catch (e) {
      console.warn('Error scanning employer_profiles for files:', e);
    }

    // 3. Scan `candidate_profiles` for resumes/CVs or avatars
    try {
      const candRows = await sql`
        SELECT * FROM candidate_profiles WHERE user_id = ${userId}
      `;
      for (const row of candRows) {
        for (const val of Object.values(row)) {
          const key = extractFileKey(val);
          if (key) fileKeysToDelete.add(key);
        }
      }
    } catch (e) {
      console.warn('Error scanning candidate_profiles for files:', e);
    }

    // 4. Delete all collected files from UploadThing storage
    const keysArray = Array.from(fileKeysToDelete);
    if (keysArray.length > 0) {
      try {
        await utapi.deleteFiles(keysArray);
        console.log('Deleted files from UploadThing:', keysArray);
      } catch (utErr) {
        console.error('UploadThing file deletion error:', utErr);
      }
    }

    // 5. Delete all dependent records in Neon DB for zero data retention
    try {
      await sql`DELETE FROM job_applications WHERE candidate_id = ${userId}`;
    } catch {}
    try {
      await sql`DELETE FROM saved_jobs WHERE user_id = ${userId}`;
    } catch {}
    try {
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
    } catch {}
    try {
      await sql`DELETE FROM jobs WHERE employer_id = ${userId}`;
    } catch {}

    await sql`DELETE FROM employer_profiles WHERE user_id = ${userId}`;
    await sql`DELETE FROM candidate_profiles WHERE user_id = ${userId}`;
    await sql`DELETE FROM users WHERE id = ${userId}`;

    return NextResponse.json({
      success: true,
      message: 'User account and all associated UploadThing documents deleted.',
      deletedFileKeys: keysArray,
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete user account.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  return handleDeleteUser(request);
}

export async function POST(request: Request) {
  return handleDeleteUser(request);
}