import { NextResponse } from 'next/server';
import { UTApi } from "uploadthing/server";

// Initialize the UploadThing SDK
const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL required' }, { status: 400 });
    }

    // Extract the unique fileKey from the end of the URL (e.g. xyz123.pdf)
    const fileKey = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    
    if (fileKey) {
      await utapi.deleteFiles(fileKey); // Physically deletes from UploadThing server
      console.log(`✅ Successfully deleted old file from UploadThing: ${fileKey}`);
      return NextResponse.json({ success: true, deleted: fileKey });
    }
    
    return NextResponse.json({ error: 'Invalid file key' }, { status: 400 });
  } catch (error) {
    console.error("❌ Failed to delete file from UploadThing:", error);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
