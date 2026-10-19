import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

function extractFileKey(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  const match = value.match(/\/f\/([^/?#\s]+)/);
  return match && match[1] ? match[1] : null;
}

async function ensureEmployerProfileColumns(sql: any) {
  await sql`
    ALTER TABLE employer_profiles
      ADD COLUMN IF NOT EXISTS full_name TEXT,
      ADD COLUMN IF NOT EXISTS company_name TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS mobile_number TEXT,
      ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '91',
      ADD COLUMN IF NOT EXISTS hiring_for TEXT DEFAULT 'company',
      ADD COLUMN IF NOT EXISTS industry_type TEXT DEFAULT 'Software Services',
      ADD COLUMN IF NOT EXISTS alias TEXT,
      ADD COLUMN IF NOT EXISTS designation TEXT,
      ADD COLUMN IF NOT EXISTS website_url TEXT,
      ADD COLUMN IF NOT EXISTS profile_hot_vacancies TEXT,
      ADD COLUMN IF NOT EXISTS profile_classifieds TEXT,
      ADD COLUMN IF NOT EXISTS phone_2 TEXT,
      ADD COLUMN IF NOT EXISTS tan_number TEXT,
      ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'PENDING',
      ADD COLUMN IF NOT EXISTS kyc_name TEXT,
      ADD COLUMN IF NOT EXISTS kyc_firm_type TEXT,
      ADD COLUMN IF NOT EXISTS kyc_proof_type TEXT,
      ADD COLUMN IF NOT EXISTS kyc_document_name TEXT,
      ADD COLUMN IF NOT EXISTS kyc_document_url TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS state TEXT,
      ADD COLUMN IF NOT EXISTS pincode TEXT,
      ADD COLUMN IF NOT EXISTS gstin TEXT DEFAULT 'Unregistered'
  `;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    await ensureEmployerProfileColumns(sql);

    const rows = await sql`
      SELECT 
        u.id as account_user_id,
        u.email as user_email,
        ep.*
      FROM users u
      LEFT JOIN employer_profiles ep ON u.id = ep.user_id
      WHERE LOWER(u.email) = LOWER(${email})
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        email,
        username: email,
        kycStatus: 'PENDING',
      });
    }

    const r = rows[0];
    const resolvedPhone = r.phone || r.mobile_number || r.mobile || '';
    const resolvedName = r.full_name || r.contact_person || '';

    return NextResponse.json({
      companyName: r.company_name || resolvedName || '',
      username: r.user_email || email,
      email: r.user_email || email,
      countryCode: r.country_code || '91',
      mobileNumber: resolvedPhone,
      companyType:
        r.hiring_for === 'agency' ? 'Recruitment Agency' : 'Corporate House',
      industryType: r.industry_type || 'Software Services',
      contactPerson: resolvedName,
      alias: r.alias || resolvedName,
      designation: r.designation || '',
      websiteUrl: r.website_url || '',
      profileHotVacancies: r.profile_hot_vacancies || '',
      profileClassifieds: r.profile_classifieds || '',
      phone1: resolvedPhone,
      phone2: r.phone_2 || '',
      tanNumber: r.tan_number || '',
      kycStatus: r.kyc_status || 'PENDING',
      kycName: r.kyc_name || r.kyc_proof_type || '',
      kycFirmType: r.kyc_firm_type || '',
      kycProofType: r.kyc_proof_type || '',
      kycDocumentName: r.kyc_document_name || '',
      kycDocumentUrl: r.kyc_document_url || '',
      addressLabel: 'Primary Address',
      address: r.address || '',
      country: r.country || 'India',
      city: r.city || '',
      state: r.state || '',
      pincode: r.pincode || '',
      gstin: r.gstin || 'Unregistered',
    });
  } catch (error: any) {
    console.error('GET /api/employer/company-profile error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load company profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const email = body.email;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    await ensureEmployerProfileColumns(sql);

    // 1. Look up the user in the users table
    const users = await sql`
      SELECT id, email FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = users[0].id;

    // 2. Check if employer_profiles row exists and get any existing KYC document URL
    const existingProfile = await sql`
      SELECT user_id, kyc_document_url FROM employer_profiles WHERE user_id = ${userId} LIMIT 1
    `;

    const oldKycDocumentUrl =
      existingProfile.length > 0 ? existingProfile[0].kyc_document_url : null;

    // 3. Upload new KYC document to UploadThing if file data is included
    let kycDocumentUrl: string | null = body.kycDocumentUrl ?? null;
    const kycDocumentBase64: string | null = body.kycDocumentData ?? null;
    const kycDocumentName: string | null = body.kycDocumentName ?? null;

    if (kycDocumentBase64 && kycDocumentName) {
      try {
        const matches = kycDocumentBase64.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64String = matches[2];
          const buffer = Buffer.from(base64String, 'base64');
          const fileObj = new File([buffer], kycDocumentName, {
            type: mimeType,
          });

          const uploadResult = await utapi.uploadFiles(fileObj);
          const item = Array.isArray(uploadResult)
            ? uploadResult[0]
            : uploadResult;

          if (item?.data) {
            kycDocumentUrl =
              (item.data as any).ufsUrl || item.data.url || null;

            // Delete previous KYC file from UploadThing if it existed
            const oldKey = extractFileKey(oldKycDocumentUrl);
            if (oldKey) {
              try {
                await utapi.deleteFiles(oldKey);
              } catch (delErr) {
                console.warn('Could not delete old KYC file:', delErr);
              }
            }
          }
        }
      } catch (uploadErr) {
        console.error('UploadThing KYC upload error:', uploadErr);
      }
    }

    if (existingProfile.length === 0) {
      await sql`
        INSERT INTO employer_profiles (user_id, kyc_status)
        VALUES (${userId}, ${body.kycStatus || 'PENDING'})
      `;
    }

    // 4. If this request is a KYC verification submission from the dashboard modal
    if (body.kycDocumentName || body.kycProofType) {
      const statusToSave = body.kycStatus || 'APPROVED';
      const proofToSave = body.kycProofType || body.kycName || '';
      const firmToSave = body.kycFirmType || 'Company/ Partnership';
      const docNameToSave = body.kycDocumentName || '';
      const docUrlToSave = kycDocumentUrl || '';

      await sql`
        UPDATE employer_profiles
        SET
          kyc_status = ${statusToSave},
          kyc_name = ${proofToSave},
          kyc_firm_type = ${firmToSave},
          kyc_proof_type = ${proofToSave},
          kyc_document_name = ${docNameToSave},
          kyc_document_url = ${docUrlToSave}
        WHERE user_id = ${userId}
      `;

      return NextResponse.json({
        success: true,
        kycStatus: statusToSave,
        kycDocumentUrl: docUrlToSave,
      });
    }

    // 5. Otherwise, update company profile fields from /employer/company-profile
    const contactPerson = body.contactPerson ?? '';
    const resolvedPhone = body.phone1 ?? body.mobileNumber ?? '';
    const alias = body.alias ?? '';
    const designation = body.designation ?? '';
    const websiteUrl = body.websiteUrl ?? '';
    const profileHotVacancies = body.profileHotVacancies ?? '';
    const profileClassifieds = body.profileClassifieds ?? '';
    const phone2 = body.phone2 ?? '';
    const tanNumber = body.tanNumber ?? '';
    const kycName = body.kycName ?? '';
    const address = body.address ?? '';
    const country = body.country ?? 'India';
    const city = body.city ?? '';
    const state = body.state ?? '';
    const pincode = body.pincode ?? '';
    const gstin = body.gstin ?? 'Unregistered';

    await sql`
      UPDATE employer_profiles
      SET
        full_name = ${contactPerson},
        phone = ${resolvedPhone},
        mobile_number = ${resolvedPhone},
        alias = ${alias},
        designation = ${designation},
        website_url = ${websiteUrl},
        profile_hot_vacancies = ${profileHotVacancies},
        profile_classifieds = ${profileClassifieds},
        phone_2 = ${phone2},
        tan_number = ${tanNumber},
        kyc_name = ${kycName},
        address = ${address},
        country = ${country},
        city = ${city},
        state = ${state},
        pincode = ${pincode},
        gstin = ${gstin}
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PUT /api/employer/company-profile error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update company profile' },
      { status: 500 }
    );
  }
}