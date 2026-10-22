import { NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';
import {
  sql,
  safeString,
  validateAndDecodeBase64File,
} from '../../../utils/db';

const utapi = new UTApi();

function extractFileKey(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  const match = value.match(/\/f\/([^/?#\s]+)/);
  return match && match[1] ? match[1] : null;
}

async function ensureCandidateColumns() {
  await sql`
    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE,
      name VARCHAR(255),
      phone VARCHAR(50),
      location VARCHAR(255),
      work_status VARCHAR(50) DEFAULT 'experienced',
      role VARCHAR(255),
      headline TEXT,
      company VARCHAR(255),
      experience VARCHAR(100),
      salary VARCHAR(100),
      notice_period VARCHAR(100),
      bio TEXT,
      skills TEXT,
      education TEXT,
      college VARCHAR(255),
      avatar TEXT,
      resume_url TEXT,
      resume_name TEXT,
      resume_updated_at VARCHAR(100),
      profile_data TEXT,
      updated_at VARCHAR(100)
    )
  `;

  await sql`
    ALTER TABLE candidate_profiles
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS work_status VARCHAR(50) DEFAULT 'experienced',
      ADD COLUMN IF NOT EXISTS role VARCHAR(255),
      ADD COLUMN IF NOT EXISTS headline TEXT,
      ADD COLUMN IF NOT EXISTS company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS experience VARCHAR(100),
      ADD COLUMN IF NOT EXISTS salary VARCHAR(100),
      ADD COLUMN IF NOT EXISTS notice_period VARCHAR(100),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS skills TEXT,
      ADD COLUMN IF NOT EXISTS education TEXT,
      ADD COLUMN IF NOT EXISTS college VARCHAR(255),
      ADD COLUMN IF NOT EXISTS avatar TEXT,
      ADD COLUMN IF NOT EXISTS resume_url TEXT,
      ADD COLUMN IF NOT EXISTS resume_name TEXT,
      ADD COLUMN IF NOT EXISTS resume_updated_at VARCHAR(100),
      ADD COLUMN IF NOT EXISTS profile_data TEXT,
      ADD COLUMN IF NOT EXISTS updated_at VARCHAR(100)
  `;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = safeString(searchParams.get('email'), 254).toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await ensureCandidateColumns();

    const users = await sql`
      SELECT id, email, role FROM users WHERE LOWER(TRIM(email)) = ${email} LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ email });
    }

    const user = users[0];
    const userRole = String(user.role || 'CANDIDATE').toUpperCase();

    if (userRole === 'EMPLOYER') {
      try {
        const emp = await sql`
          SELECT * FROM employer_profiles WHERE user_id = ${user.id} LIMIT 1
        `;
        if (emp.length > 0) {
          return NextResponse.json({
            name: emp[0].full_name || emp[0].company_name || '',
            role: 'EMPLOYER',
            email: user.email,
            phone: emp[0].phone || '',
            avatar: emp[0].avatar || '',
          });
        }
      } catch {}
      return NextResponse.json({
        name: '',
        role: 'EMPLOYER',
        email: user.email,
      });
    }

    const rows = await sql`
      SELECT * FROM candidate_profiles WHERE user_id = ${user.id} LIMIT 1
    `;

    const cp = rows[0] || {};
    let parsedProfileData: Record<string, any> = {};
    if (cp.profile_data) {
      try {
        parsedProfileData =
          typeof cp.profile_data === 'string'
            ? JSON.parse(cp.profile_data)
            : cp.profile_data;
      } catch {
        parsedProfileData = {};
      }
    }

    let parsedSkills: string[] = [];
    if (cp.skills) {
      try {
        const j = JSON.parse(cp.skills);
        if (Array.isArray(j)) parsedSkills = j;
        else
          parsedSkills = String(cp.skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
      } catch {
        parsedSkills = String(cp.skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } else if (Array.isArray(parsedProfileData.keySkills)) {
      parsedSkills = parsedProfileData.keySkills;
    }

    return NextResponse.json({
      id: cp.id,
      userId: user.id,
      name: cp.name || '',
      email: user.email,
      role: cp.role || 'CANDIDATE',
      workStatus: cp.work_status || 'experienced',
      phone: cp.phone || '',
      location: cp.location || '',
      designation: cp.role || parsedProfileData.designation || '',
      company: cp.company || parsedProfileData.company || '',
      experience: cp.experience || parsedProfileData.experience || '',
      salary: cp.salary || parsedProfileData.salary || '',
      noticePeriod: cp.notice_period || parsedProfileData.noticePeriod || '',
      headline: cp.headline || parsedProfileData.headline || '',
      bio: cp.bio || parsedProfileData.profileSummary || '',
      skills: parsedSkills,
      avatar: cp.avatar || '',
      resumeUrl: cp.resume_url || '',
      resumeName: cp.resume_name || '',
      resumeUpdatedAt: cp.resume_updated_at || '',
      updatedAt:
        parsedProfileData.lastUpdatedIso ||
        cp.updated_at ||
        new Date().toISOString(),
      searchAppearances: cp.search_appearances ?? 0,
      recruiterActions: cp.recruiter_actions ?? 0,
      employmentList: parsedProfileData.employmentList || [],
      educationList: parsedProfileData.educationList || [],
      itSkills: parsedProfileData.itSkills || [],
      projects: parsedProfileData.projects || [],
      accomplishments: parsedProfileData.accomplishments || {
        onlineProfiles: [],
        workSamples: [],
        publications: [],
        presentations: [],
        patents: [],
        certifications: [],
      },
      careerProfile: parsedProfileData.careerProfile || {
        currentIndustry: '',
        department: '',
        roleCategory: '',
        jobRole: '',
        desiredJobType: 'Permanent',
        desiredEmploymentType: 'Full Time',
        preferredJobRole: '',
        preferredLocations: '',
        preferredSalary: '',
        preferredShift: 'Day',
      },
      personalDetails: parsedProfileData.personalDetails || {
        gender: '',
        maritalStatus: '',
        dateOfBirth: '',
        category: '',
        workPermit: 'India',
        address: '',
        pincode: '',
      },
      languages: parsedProfileData.languages || [],
      diversity: parsedProfileData.diversity || {
        disabilityStatus: 'Do not have disability',
        militaryExperience: 'Never served',
        careerBreak: 'Have not taken',
      },
    });
  } catch (error: any) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load profile' },
      { status: 500 }
    );
  }
}

async function handleSaveProfile(request: Request) {
  try {
    const body = await request.json();
    const email = safeString(body?.email, 254).toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await ensureCandidateColumns();

    const users = await sql`
      SELECT id, email FROM users WHERE LOWER(TRIM(email)) = ${email} LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = users[0].id;

    const existingRows = await sql`
      SELECT * FROM candidate_profiles WHERE user_id = ${userId} LIMIT 1
    `;

    const existing = existingRows[0] || {};
    let existingProfileData: Record<string, any> = {};
    if (existing.profile_data) {
      try {
        existingProfileData =
          typeof existing.profile_data === 'string'
            ? JSON.parse(existing.profile_data)
            : existing.profile_data;
      } catch {
        existingProfileData = {};
      }
    }

    // 1. Validate & Upload Avatar to UploadThing if base64 provided
    let avatarUrl = body.avatar ?? existing.avatar ?? '';
    if (body.avatarBase64) {
      const validation = validateAndDecodeBase64File(
        body.avatarBase64,
        body.avatarFileName || 'avatar.png',
        'avatar'
      );

      if (!validation.valid || !validation.buffer || !validation.safeFileName) {
        return NextResponse.json(
          { error: validation.error || 'Invalid profile photo upload.' },
          { status: 400 }
        );
      }

      try {
        const fileObj = new File(
          [new Uint8Array(validation.buffer)],
          validation.safeFileName,
          { type: validation.mimeType }
        );
        const uploadRes = await utapi.uploadFiles(fileObj);
        const item = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes;
        if (item?.data) {
          avatarUrl = (item.data as any).ufsUrl || item.data.url || avatarUrl;
          const oldKey = extractFileKey(existing.avatar);
          if (oldKey) {
            try {
              await utapi.deleteFiles(oldKey);
            } catch {}
          }
        }
      } catch (e) {
        console.error('Avatar UploadThing error:', e);
      }
    }

    // 2. Validate & Upload or Delete Resume on UploadThing
    let resumeUrl = body.resumeUrl ?? existing.resume_url ?? '';
    let resumeName = body.resumeName ?? existing.resume_name ?? '';
    let resumeUpdatedAt =
      body.resumeUpdatedAt ?? existing.resume_updated_at ?? '';

    if (body.deleteResume) {
      const oldResumeKey = extractFileKey(existing.resume_url);
      if (oldResumeKey) {
        try {
          await utapi.deleteFiles(oldResumeKey);
        } catch {}
      }
      resumeUrl = '';
      resumeName = '';
      resumeUpdatedAt = '';
    } else if (body.resumeBase64) {
      const validation = validateAndDecodeBase64File(
        body.resumeBase64,
        body.resumeFileName || 'resume.pdf',
        'resume'
      );

      if (!validation.valid || !validation.buffer || !validation.safeFileName) {
        return NextResponse.json(
          { error: validation.error || 'Invalid resume file upload.' },
          { status: 400 }
        );
      }

      try {
        const fileObj = new File(
          [new Uint8Array(validation.buffer)],
          validation.safeFileName,
          { type: validation.mimeType }
        );
        const uploadRes = await utapi.uploadFiles(fileObj);
        const item = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes;
        if (item?.data) {
          resumeUrl = (item.data as any).ufsUrl || item.data.url || resumeUrl;
          resumeName = safeString(
            body.resumeFileName || validation.safeFileName,
            200
          );
          resumeUpdatedAt = new Date().toISOString();

          const oldResumeKey = extractFileKey(existing.resume_url);
          if (oldResumeKey) {
            try {
              await utapi.deleteFiles(oldResumeKey);
            } catch {}
          }
        }
      } catch (e) {
        console.error('Resume UploadThing error:', e);
      }
    }

    const nowIso = new Date().toISOString();

    // 3. Merge structured profile_data JSON
    const updatedProfileData = {
      ...existingProfileData,
      lastUpdatedIso: nowIso,
      designation: body.designation ?? existingProfileData.designation ?? '',
      company: body.company ?? existingProfileData.company ?? '',
      experience: body.experience ?? existingProfileData.experience ?? '',
      salary: body.salary ?? existingProfileData.salary ?? '',
      noticePeriod: body.noticePeriod ?? existingProfileData.noticePeriod ?? '',
      headline: body.headline ?? existingProfileData.headline ?? '',
      profileSummary: body.bio ?? existingProfileData.profileSummary ?? '',
      keySkills: Array.isArray(body.skills)
        ? body.skills
        : existingProfileData.keySkills || [],
      employmentList:
        body.employmentList ?? existingProfileData.employmentList ?? [],
      educationList:
        body.educationList ?? existingProfileData.educationList ?? [],
      itSkills: body.itSkills ?? existingProfileData.itSkills ?? [],
      projects: body.projects ?? existingProfileData.projects ?? [],
      accomplishments:
        body.accomplishments ??
        existingProfileData.accomplishments ?? {
          onlineProfiles: [],
          workSamples: [],
          publications: [],
          presentations: [],
          patents: [],
          certifications: [],
        },
      careerProfile:
        body.careerProfile ?? existingProfileData.careerProfile ?? {},
      personalDetails:
        body.personalDetails ?? existingProfileData.personalDetails ?? {},
      languages: body.languages ?? existingProfileData.languages ?? [],
      diversity: body.diversity ?? existingProfileData.diversity ?? {},
    };

    const resolvedName = safeString(body.name ?? existing.name ?? '', 255);
    const resolvedPhone = safeString(body.phone ?? existing.phone ?? '', 50);
    const resolvedLocation = safeString(
      body.location ?? existing.location ?? '',
      255
    );
    const resolvedWorkStatus = safeString(
      body.workStatus ?? existing.work_status ?? 'experienced',
      50
    );
    const resolvedRole = safeString(
      body.designation ??
        (updatedProfileData.employmentList?.[0]?.designation ||
          existing.role ||
          ''),
      255
    );
    const resolvedCompany = safeString(
      body.company ??
        (updatedProfileData.employmentList?.[0]?.company ||
          existing.company ||
          ''),
      255
    );
    const resolvedExperience = safeString(
      body.experience ?? existing.experience ?? '',
      100
    );
    const resolvedSalary = safeString(
      body.salary ?? existing.salary ?? '',
      100
    );
    const resolvedNoticePeriod = safeString(
      body.noticePeriod ?? existing.notice_period ?? '',
      100
    );
    const resolvedHeadline = safeString(
      body.headline ?? existing.headline ?? '',
      1000
    );
    const resolvedBio = safeString(body.bio ?? existing.bio ?? '', 4000);
    const resolvedSkills = Array.isArray(body.skills)
      ? body.skills.map((s: unknown) => safeString(s, 100)).filter(Boolean).join(', ')
      : safeString(existing.skills ?? '', 2000);
    const firstEdu = updatedProfileData.educationList?.[0];
    const resolvedEducation = safeString(
      firstEdu ? firstEdu.degree : existing.education ?? '',
      255
    );
    const resolvedCollege = safeString(
      firstEdu ? firstEdu.institute : existing.college ?? '',
      255
    );

    if (existingRows.length === 0) {
      await sql`
        INSERT INTO candidate_profiles (
          user_id, name, phone, location, work_status, role, headline, company,
          experience, salary, notice_period, bio, skills, education, college,
          avatar, resume_url, resume_name, resume_updated_at, profile_data, updated_at
        ) VALUES (
          ${userId}, ${resolvedName}, ${resolvedPhone}, ${resolvedLocation},
          ${resolvedWorkStatus}, ${resolvedRole}, ${resolvedHeadline}, ${resolvedCompany},
          ${resolvedExperience}, ${resolvedSalary}, ${resolvedNoticePeriod}, ${resolvedBio},
          ${resolvedSkills}, ${resolvedEducation}, ${resolvedCollege}, ${avatarUrl},
          ${resumeUrl}, ${resumeName}, ${resumeUpdatedAt},
          ${JSON.stringify(updatedProfileData)}, ${nowIso}
        )
      `;
    } else {
      await sql`
        UPDATE candidate_profiles
        SET
          name = ${resolvedName},
          phone = ${resolvedPhone},
          location = ${resolvedLocation},
          work_status = ${resolvedWorkStatus},
          role = ${resolvedRole},
          headline = ${resolvedHeadline},
          company = ${resolvedCompany},
          experience = ${resolvedExperience},
          salary = ${resolvedSalary},
          notice_period = ${resolvedNoticePeriod},
          bio = ${resolvedBio},
          skills = ${resolvedSkills},
          education = ${resolvedEducation},
          college = ${resolvedCollege},
          avatar = ${avatarUrl},
          resume_url = ${resumeUrl},
          resume_name = ${resumeName},
          resume_updated_at = ${resumeUpdatedAt},
          profile_data = ${JSON.stringify(updatedProfileData)},
          updated_at = ${nowIso}
        WHERE user_id = ${userId}
      `;
    }

    return NextResponse.json({
      success: true,
      avatar: avatarUrl,
      resumeUrl,
      resumeName,
      resumeUpdatedAt,
      updatedAt: nowIso,
    });
  } catch (error: any) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return handleSaveProfile(request);
}

export async function POST(request: Request) {
  return handleSaveProfile(request);
}