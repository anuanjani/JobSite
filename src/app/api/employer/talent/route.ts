import { NextResponse } from 'next/server';
import { sql, escapeSqlLike } from '../../../../utils/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get('q') || searchParams.get('skill') || '';
    const escapedSearch = escapeSqlLike(rawSearch);

    const rows = escapedSearch
      ? await sql`
          SELECT
            cp.*,
            u.email AS user_email
          FROM candidate_profiles cp
          LEFT JOIN users u ON cp.user_id = u.id
          WHERE
            cp.name ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
            OR cp.skills ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
            OR cp.role ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
            OR cp.location ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
          ORDER BY cp.id DESC
        `
      : await sql`
          SELECT
            cp.*,
            u.email AS user_email
          FROM candidate_profiles cp
          LEFT JOIN users u ON cp.user_id = u.id
          ORDER BY cp.id DESC
        `;

    return NextResponse.json({ candidates: rows });
  } catch (error) {
    console.error('GET /api/employer/talent error:', error);
    return NextResponse.json(
      { error: 'Failed to load candidates', candidates: [] },
      { status: 500 }
    );
  }
}