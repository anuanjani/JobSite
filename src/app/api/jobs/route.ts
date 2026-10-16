import { NextResponse } from 'next/server';
import { pool } from '../../../utils/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const workMode = searchParams.get('workMode') || '';

    let query = `
      -j.id, j.title, jp.company_name as company, j.location, j.work_mode as type, 
      j.salary_range as salary, j.tags, j.created_at
      FROM jobs j
      JOIN employer_profiles jp ON j.employer_id = jp.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (LOWER(j.title) LIKE $${paramIndex} OR LOWER(jp.company_name) LIKE $${paramIndex})`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (location) {
      query += ` AND LOWER(j.location) LIKE $${paramIndex}`;
      params.push(`%${location.toLowerCase()}%`);
      paramIndex++;
    }

    if (workMode) {
      query += ` AND LOWER(j.work_mode) = LOWER($${paramIndex})`;
      params.push(workMode);
      paramIndex++;
    }

    query += ` ORDER BY j.created_at DESC`;

    const result = await pool.query(query, params);
    
    // Transform rows to match frontend formatting
    const jobs = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      company: row.company || 'Company',
      location: row.location || 'Remote',
      type: row.type || 'Full-time',
      salary: row.salary || 'Competitive',
      rating: '4.5',
      tags: row.tags || ['General'],
      posted: 'Recently',
      logo: (row.company || 'C').charAt(0).toUpperCase()
    }));

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}