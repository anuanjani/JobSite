
import { NextResponse } from 'next/server';
import { pool } from '../../../../utils/db';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Delete the user from the core `users` table.
    // Thanks to ON DELETE CASCADE, this automatically scrubs their profile, applications, and saved jobs!
    const result = await pool.query('DELETE FROM users WHERE LOWER(email) = $1 RETURNING id', [cleanEmail]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Account deleted successfully" });

  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}