import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.resolve(process.cwd(), 'rolematch-scout.json');
const LEGACY_CACHE_PATH = path.resolve(
  process.cwd(),
  'scripts/scout-seen-jobs.json'
);

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function removeLegacyLocalCache() {
  try {
    if (fs.existsSync(LEGACY_CACHE_PATH)) {
      fs.unlinkSync(LEGACY_CACHE_PATH);
      console.log(
        '🧹 Removed stale local cache (scripts/scout-seen-jobs.json). Using live DB for validation.'
      );
    }
  } catch {}
}

/**
 * Decodes HTML entities BEFORE stripping tags so double-encoded tags
 * like &lt;strong&gt; are cleanly removed and never appear in titles.
 */
function stripHtml(html = '') {
  return String(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/<\/(p|div|li|h[1-6]|br|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\n\s*\n+/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Strict validation gate to ensure navigation links (e.g., "Saved Jobs",
 * "Join Talent Community", "Job Alerts") are never treated as job postings.
 */
function isValidJobPosting(title = '', sourceUrl = '', description = '') {
  const cleanTitle = String(title).trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const lowerUrl = String(sourceUrl).trim().toLowerCase();
  const lowerDesc = String(description).trim().toLowerCase();

  if (!cleanTitle || cleanTitle.length < 4 || cleanTitle.length > 140) {
    return false;
  }

  // Reject titles containing raw HTML tags or starting with a leading counter like "0 Your Saved Jobs"
  if (
    /<[^>]+>/.test(cleanTitle) ||
    /^\d+\s+your\b/i.test(cleanTitle) ||
    lowerTitle.includes('<strong>') ||
    lowerTitle.includes('</strong>')
  ) {
    return false;
  }

  // Reject non-job static/navigation URLs
  const blockedUrlPatterns = [
    '/saved-jobs',
    '/saved_jobs',
    '/job-alerts',
    '/alerts',
    '/talent-community',
    '/login',
    '/signin',
    '/register',
    '/privacy',
    '/terms',
    '/cookie',
    '/faq',
    '/about-us',
    '/life-at-',
    '/how-we-hire',
    '/locations',
    '/teams',
    '/blog',
  ];
  if (blockedUrlPatterns.some((pat) => lowerUrl.includes(pat))) {
    return false;
  }

  // Reject non-job UI labels and navigation headings
  const blockedTitlePatterns = [
    /\bsaved\s+jobs?\b/i,
    /\bno\s+saved\s+jobs\b/i,
    /\byour\s+saved\s+jobs\b/i,
    /\bjoin\s+our\s+talent\s+community\b/i,
    /\btalent\s+community\b/i,
    /\bjob\s+alerts?\b/i,
    /\bcreate\s+alert\b/i,
    /\bsearch\s+jobs?\b/i,
    /\bview\s+all\s+jobs?\b/i,
    /\bcurrent\s+openings\b/i,
    /\bmanage\s+preferences\b/i,
    /\bprivacy\s+policy\b/i,
    /\bcookie\s+policy\b/i,
    /\bsign\s+in\b/i,
    /\blog\s*in\b/i,
  ];
  if (blockedTitlePatterns.some((regex) => regex.test(cleanTitle))) {
    return false;
  }

  if (lowerDesc.includes('you don\'t currently have any saved jobs')) {
    return false;
  }

  return true;
}

/**
 * Checks if an existing database job record is corrupted/invalid (such as "0 Your <strong>Saved Jobs</strong>")
 * so the agent can automatically delete it from Neon DB.
 */
function isInvalidDatabaseJobRecord(jobRecord) {
  const title = String(jobRecord.title || '');
  const desc = String(jobRecord.description || '');
  const url = extractSourceUrlFromText(desc);
  return !isValidJobPosting(title, url, desc);
}

function normalizeJobTitle(title = '') {
  return String(title)
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, ' ')
    .replace(/\b(?:req|job\s*id|id|ref)\s*[:#-]?\s*\w+/gi, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function extractSourceUrlFromText(description = '') {
  const match = String(description).match(
    /(?:Source(?: Application)? URL|Apply URL|Apply online at)\s*:\s*(https?:\/\/[^\s]+)/i
  );
  return match && match[1] ? match[1].trim().toLowerCase() : '';
}

function isJobAlreadyInDatabase(candidateJob, companyName, dbIndex) {
  const compNorm = String(companyName || '')
    .toLowerCase()
    .trim();
  const titleNorm = normalizeJobTitle(candidateJob.title);
  const sourceUrlNorm = String(candidateJob.sourceUrl || '')
    .toLowerCase()
    .trim();

  if (sourceUrlNorm && dbIndex.sourceUrls.has(sourceUrlNorm)) {
    return true;
  }

  const companyTitleKey = `${compNorm}|${titleNorm}`;
  if (dbIndex.companyTitleKeys.has(companyTitleKey)) {
    return true;
  }

  if (
    dbIndex.titleLocationKeys.has(
      `${titleNorm}|${String(candidateJob.location || '')
        .toLowerCase()
        .trim()}`
    )
  ) {
    return true;
  }

  const candWords = titleNorm.split(' ').filter((w) => w.length > 2);
  if (candWords.length >= 2) {
    for (const existing of dbIndex.records) {
      const sameCompany =
        existing.companyNorm === compNorm ||
        existing.companyNorm === 'lula kula';
      if (!sameCompany) continue;

      const existingWords = existing.titleNorm
        .split(' ')
        .filter((w) => w.length > 2);
      if (existingWords.length < 2) continue;

      const overlap = candWords.filter((w) => existingWords.includes(w)).length;
      const similarity =
        overlap / Math.max(candWords.length, existingWords.length);
      if (similarity >= 0.85) {
        return true;
      }
    }
  }

  return false;
}

function registerJobInDbIndex(job, companyName, dbIndex) {
  const compNorm = String(companyName || '')
    .toLowerCase()
    .trim();
  const titleNorm = normalizeJobTitle(job.title);
  const locNorm = String(job.location || '')
    .toLowerCase()
    .trim();
  const sourceUrlNorm = String(
    job.sourceUrl || extractSourceUrlFromText(job.description)
  )
    .toLowerCase()
    .trim();

  if (sourceUrlNorm) dbIndex.sourceUrls.add(sourceUrlNorm);
  dbIndex.companyTitleKeys.add(`${compNorm}|${titleNorm}`);
  dbIndex.titleLocationKeys.add(`${titleNorm}|${locNorm}`);
  dbIndex.records.push({
    companyNorm: compNorm,
    titleNorm,
    locNorm,
  });
}

function isAllowedLocation(rawLocation = '') {
  if (!rawLocation) return false;
  const loc = String(rawLocation).trim();
  const lower = loc.toLowerCase();

  const blockedLocations = [
    'united states',
    'usa',
    'u.s.',
    'united kingdom',
    'uk',
    'canada',
    'australia',
    'germany',
    'romania',
    'poland',
    'mexico',
    'brazil',
    'colombia',
    'argentina',
    'malaysia',
    'kuala lumpur',
    'petaling jaya',
    'indonesia',
    'jakarta',
    'vietnam',
    'ho chi minh',
    'hanoi',
    'philippines',
    'manila',
    'thailand',
    'bangkok',
    'taiwan',
    'japan',
    'china',
    'ireland',
    'france',
    'spain',
    'italy',
    'netherlands',
    'egypt',
    'cairo',
    'south africa',
  ];

  if (blockedLocations.some((b) => new RegExp(`\\b${b}\\b`, 'i').test(lower))) {
    return false;
  }

  if (
    /(?:^|[,\s/-])(IN|IND|AE|ARE|SA|SAU|QA|QAT|KW|KWT|OM|OMN|SG|SGP)$/i.test(
      loc
    )
  ) {
    return true;
  }

  const allowedTerms = [
    'india',
    'uae',
    'united arab emirates',
    'saudi arabia',
    'ksa',
    'qatar',
    'kuwait',
    'oman',
    'singapore',
    'bengaluru',
    'bangalore',
    'hyderabad',
    'chennai',
    'mumbai',
    'navi mumbai',
    'thane',
    'pune',
    'gurugram',
    'gurgaon',
    'noida',
    'greater noida',
    'delhi',
    'new delhi',
    'ncr',
    'kolkata',
    'ahmedabad',
    'gandhinagar',
    'indore',
    'jaipur',
    'kochi',
    'cochin',
    'trivandrum',
    'thiruvananthapuram',
    'coimbatore',
    'mysuru',
    'mysore',
    'bhubaneswar',
    'visakhapatnam',
    'vizag',
    'chandigarh',
    'mohali',
    'nagpur',
    'vadodara',
    'surat',
    'bhopal',
    'lucknow',
    'maharashtra',
    'karnataka',
    'telangana',
    'tamil nadu',
    'madhya pradesh',
    'gujarat',
    'kerala',
    'haryana',
    'uttar pradesh',
    'dubai',
    'abu dhabi',
    'sharjah',
    'ajman',
    'ras al khaimah',
    'fujairah',
    'riyadh',
    'jeddah',
    'dammam',
    'khobar',
    'al khobar',
    'dhahran',
    'jubail',
    'makkah',
    'medina',
    'neom',
    'doha',
    'lusail',
    'al rayyan',
    'al wakrah',
    'kuwait city',
    'hawalli',
    'salmiya',
    'al ahmadi',
    'muscat',
    'salalah',
    'sohar',
    'nizwa',
  ];

  return allowedTerms.some((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
  });
}

function isWithinRecencyWindow(
  rawTimestamp,
  maxHours = 12,
  maxRetentionDays = 4
) {
  if (!rawTimestamp) return true;

  const now = Date.now();
  const str = String(rawTimestamp).trim().toLowerCase();

  if (
    str === 'just now' ||
    str === 'just posted' ||
    str === 'today' ||
    str === 'yesterday' ||
    str.includes('minute') ||
    str.includes('min ago')
  ) {
    return true;
  }

  const hoursMatch = str.match(/(\d+)\s*(?:hour|hr|h)\b/i);
  if (hoursMatch) {
    return parseInt(hoursMatch[1], 10) <= maxHours;
  }

  const daysMatch = str.match(/(\d+)\s*day/i);
  if (daysMatch) {
    return parseInt(daysMatch[1], 10) < maxRetentionDays;
  }

  const parsedDate = new Date(rawTimestamp);
  if (!isNaN(parsedDate.getTime())) {
    const ageMs = now - parsedDate.getTime();
    if (str.includes(':')) {
      return (
        ageMs >= -12 * 60 * 60 * 1000 &&
        ageMs <= Math.max(maxHours, 24) * 60 * 60 * 1000
      );
    }
    return ageMs <= maxRetentionDays * 24 * 60 * 60 * 1000;
  }

  return true;
}

function isJobOlderThanDays(jobRecord, maxDays = 4) {
  const cutoffMs = maxDays * 24 * 60 * 60 * 1000;
  const rawDate = jobRecord.created_at || jobRecord.posted_date;
  if (!rawDate) return false;

  const parsedMs = new Date(rawDate).getTime();
  if (isNaN(parsedMs)) return false;

  return Date.now() - parsedMs >= cutoffMs;
}

function extractSkills(text, configuredKeywords = []) {
  const commonTechSkills = [
    'Java',
    'Python',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Angular',
    'Vue',
    'Selenium',
    'API Automation',
    'Playwright',
    'Cypress',
    'Appium',
    'TestNG',
    'JUnit',
    'REST API',
    'GraphQL',
    'SQL',
    'PostgreSQL',
    'MongoDB',
    'SAP',
    'ABAP',
    'S/4HANA',
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'Jenkins',
    'Git',
    'Golang',
    'C++',
    'C#',
    '.NET',
    'DevOps',
    'Automation Testing',
    'Performance Testing',
    'JMeter',
    'TOSCA',
    'Agile',
    ...configuredKeywords,
  ];

  const found = new Set();
  const lowerText = text.toLowerCase();

  for (const skill of commonTechSkills) {
    if (skill && lowerText.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  }

  return Array.from(found).slice(0, 8).join(', ') || 'Software Engineering';
}

function inferWorkMode(title, location, description, fallback = 'Hybrid') {
  const combined = `${title} ${location} ${description}`.toLowerCase();
  if (combined.includes('remote') || combined.includes('work from home')) {
    return 'Remote';
  }
  if (combined.includes('hybrid')) {
    return 'Hybrid';
  }
  if (
    combined.includes('on-site') ||
    combined.includes('onsite') ||
    combined.includes('in-office')
  ) {
    return 'On-site';
  }
  return fallback;
}

function inferExperience(description, fallback = '3 - 8 Yrs') {
  const rangeMatch = description.match(
    /(\d{1,2})\s*(?:-|to|–)\s*(\d{1,2})\+?\s*(?:years|yrs)/i
  );
  if (rangeMatch) {
    return `${rangeMatch[1]} - ${rangeMatch[2]} Yrs`;
  }
  const singleMatch = description.match(
    /(\d{1,2})\+?\s*(?:years|yrs)\s+of\s+experience/i
  );
  if (singleMatch) {
    return `${singleMatch[1]}+ Yrs`;
  }
  return fallback;
}

async function fetchJobDetailPage(jobUrl) {
  try {
    const res = await fetch(jobUrl, { headers: REQUEST_HEADERS });
    if (!res.ok) return null;
    const html = await res.text();

    const ldJsonRegex =
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = ldJsonRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1].trim());
        const nodes = Array.isArray(parsed)
          ? parsed
          : parsed['@graph']
          ? parsed['@graph']
          : [parsed];
        for (const node of nodes) {
          if (node['@type'] === 'JobPosting') {
            const locObj = Array.isArray(node.jobLocation)
              ? node.jobLocation[0]
              : node.jobLocation;
            const addr = locObj?.address;
            const locParts = [
              addr?.addressLocality,
              addr?.addressRegion,
              addr?.addressCountry,
            ].filter(Boolean);

            return {
              isVerifiedJobPosting: true,
              title: node.title ? stripHtml(node.title) : undefined,
              location: locParts.length > 0 ? locParts.join(', ') : undefined,
              datePosted: node.datePosted,
              description: node.description
                ? `${stripHtml(node.description)}\n\nSource URL: ${jobUrl}`
                : undefined,
            };
          }
        }
      } catch {}
    }

    const descMatch =
      html.match(
        /<span[^>]+class=["'][^"']*jobdescription[^"']*["'][^>]*>([\s\S]*?)<\/span>/i
      ) ||
      html.match(
        /<div[^>]+class=["'][^"']*job-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
      ) ||
      html.match(
        /<div[^>]+itemprop=["']description["'][^>]*>([\s\S]*?)<\/div>/i
      );

    if (descMatch && descMatch[1]) {
      return {
        isVerifiedJobPosting: true,
        description: `${stripHtml(descMatch[1])}\n\nSource URL: ${jobUrl}`,
      };
    }
  } catch {}
  return null;
}

/**
 * Parses SAP SuccessFactors career pages (YASH Technologies & Avaya)
 */
async function crawlSuccessFactors(company) {
  const { companyName, careerUrl } = company;
  const origin = new URL(careerUrl).origin;
  const results = [];

  const res = await fetch(careerUrl, { headers: REQUEST_HEADERS });
  if (!res.ok) return results;
  const html = await res.text();

  const rowRegex =
    /<tr[^>]+class=["'][^"']*data-row[^"']*["'][^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = [];
  let rm;

  while ((rm = rowRegex.exec(html)) !== null) {
    const rowHtml = rm[1];
    const linkMatch = rowHtml.match(
      /<a[^>]+class=["'][^"']*jobTitle-link[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i
    );
    if (!linkMatch) continue;

    const href = linkMatch[1].trim();
    const title = stripHtml(linkMatch[2]);
    const fullUrl = href.startsWith('http')
      ? href
      : `${origin}${href.startsWith('/') ? '' : '/'}${href}`;

    const locMatch = rowHtml.match(
      /<span[^>]+class=["'][^"']*jobLocation[^"']*["'][^>]*>([\s\S]*?)<\/span>/i
    );
    const location = locMatch ? stripHtml(locMatch[1]) : '';

    const dateMatch = rowHtml.match(
      /<span[^>]+class=["'][^"']*jobDate[^"']*["'][^>]*>([\s\S]*?)<\/span>/i
    );
    const rawDate = dateMatch ? stripHtml(dateMatch[1]) : '';

    if (!isValidJobPosting(title, fullUrl)) continue;

    rows.push({
      externalId: fullUrl,
      sourceUrl: fullUrl,
      title,
      companyName,
      location,
      rawPublishedAt: rawDate,
    });
  }

  const allowedRows = rows.filter((r) => isAllowedLocation(r.location));

  for (const item of allowedRows.slice(0, 25)) {
    const detail = await fetchJobDetailPage(item.sourceUrl);
    const pubDate = detail?.datePosted || item.rawPublishedAt;
    const finalTitle = detail?.title || item.title;
    const finalDesc =
      detail?.description ||
      `${finalTitle} at ${companyName} (${item.location}).\n\nSource URL: ${item.sourceUrl}`;

    if (!isValidJobPosting(finalTitle, item.sourceUrl, finalDesc)) continue;

    results.push({
      ...item,
      title: finalTitle,
      location: detail?.location || item.location,
      rawPublishedAt: pubDate,
      postedDate: pubDate
        ? new Date(pubDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      description: finalDesc,
    });
  }

  return results;
}

/**
 * Parses Grab Careers (https://www.grab.careers/en/jobs/)
 * Strictly matches numeric Grab job IDs (/en/jobs/<digits>/<slug>/) so static pages
 * like /en/jobs/saved-jobs/ are never crawled.
 */
async function crawlGrab(company) {
  const { companyName, careerUrl } = company;
  const origin = new URL(careerUrl).origin;
  const results = [];

  const res = await fetch(careerUrl, { headers: REQUEST_HEADERS });
  if (!res.ok) return results;
  const html = await res.text();

  // Require numeric job ID segment (/en/jobs/744000.../)
  const linkRegex =
    /<a[^>]+href=["'](\/en\/jobs\/\d+\/[^"'?#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const jobLinks = new Map();
  let m;

  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1].trim();
    const fullUrl = `${origin}${href}`;
    const titleText = stripHtml(m[2]);

    if (
      !jobLinks.has(fullUrl) &&
      isValidJobPosting(titleText, fullUrl)
    ) {
      jobLinks.set(fullUrl, titleText);
    }
  }

  for (const [jobUrl, fallbackTitle] of Array.from(jobLinks.entries()).slice(
    0,
    25
  )) {
    const detail = await fetchJobDetailPage(jobUrl);
    // Require verified job metadata on the Grab detail page
    if (!detail || !detail.isVerifiedJobPosting) continue;

    const finalTitle = detail.title || fallbackTitle;
    const location = detail.location || 'Singapore';
    const finalDesc =
      detail.description ||
      `${finalTitle} at ${companyName} (${location}).\n\nSource URL: ${jobUrl}`;

    if (
      !isAllowedLocation(location) ||
      !isValidJobPosting(finalTitle, jobUrl, finalDesc)
    ) {
      continue;
    }

    results.push({
      externalId: jobUrl,
      sourceUrl: jobUrl,
      title: finalTitle,
      companyName,
      location,
      rawPublishedAt: detail.datePosted || null,
      postedDate: detail.datePosted
        ? String(detail.datePosted).split('T')[0]
        : new Date().toISOString().split('T')[0],
      description: finalDesc,
    });
  }

  return results;
}

/**
 * Parses QualityKiosk Careers (https://qualitykiosk.com/careers/current-openings/)
 */
async function crawlQualityKiosk(company) {
  const { companyName, careerUrl } = company;
  const results = [];

  const res = await fetch(careerUrl, { headers: REQUEST_HEADERS });
  if (!res.ok) return results;
  const html = await res.text();

  const blockRegex =
    /<(?:h[2-5]|a)[^>]*>([\s\S]*?)<\/(?:h[2-5]|a)>([\s\S]{0,800}?)(?=<(?:h[2-5]|a)|<\/section|<\/div|$)/gi;
  let hm;
  const seenTitles = new Set();

  while ((hm = blockRegex.exec(html)) !== null) {
    const title = stripHtml(hm[1]);
    const snippet = stripHtml(hm[2]);

    if (
      !title ||
      title.length < 5 ||
      title.length > 85 ||
      seenTitles.has(title.toLowerCase()) ||
      !isValidJobPosting(title, careerUrl, snippet)
    ) {
      continue;
    }

    const looksLikeRole =
      /\b(engineer|qa|automation|test|testing|lead|manager|developer|architect|consultant|sdet|analyst|specialist|devops|cloud|java|python|selenium|performance)\b/i.test(
        title
      );

    if (!looksLikeRole) continue;
    seenTitles.add(title.toLowerCase());

    const locMatch = snippet.match(
      /\b(Mumbai|Navi Mumbai|Pune|Bengaluru|Bangalore|Hyderabad|Chennai|Noida|Gurugram|Dubai|UAE|Singapore|Riyadh|Doha|Kuwait|Muscat|India)\b/i
    );
    const location = locMatch ? `${locMatch[1]}, India` : 'Navi Mumbai, India';

    if (!isAllowedLocation(location)) continue;

    results.push({
      externalId: `${companyName}-${title}`,
      sourceUrl: careerUrl,
      title,
      companyName,
      location,
      rawPublishedAt: null,
      postedDate: new Date().toISOString().split('T')[0],
      description: `${
        snippet || `${title} opening at ${companyName}.`
      }\n\nSource URL: ${careerUrl}`,
    });
  }

  return results;
}

async function crawlCompanyJobs(company) {
  const { companyName, careerUrl } = company;
  console.log(`\n🔍 Scanning ${companyName} (${careerUrl})...`);

  try {
    if (
      careerUrl.includes('careers.yash.com') ||
      careerUrl.includes('careers.avaya.com')
    ) {
      return await crawlSuccessFactors(company);
    }
    if (careerUrl.includes('grab.careers')) {
      return await crawlGrab(company);
    }
    if (careerUrl.includes('qualitykiosk.com')) {
      return await crawlQualityKiosk(company);
    }
    return await crawlSuccessFactors(company);
  } catch (err) {
    console.error(`❌ Error scanning ${companyName}:`, err.message);
    return [];
  }
}

async function executeScoutCycle() {
  removeLegacyLocalCache();

  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`❌ Config file not found at ${CONFIG_PATH}`);
    return;
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const { baseUrl, employerEmail, employerPassword } = config.rolematchPortal;
  const criteria = config.criteria || {};
  const companies = config.companies || [];
  const maxHours = Number(criteria.postedWithinHours ?? 12);
  const deleteOlderThanDays = Number(criteria.deleteOlderThanDays ?? 4);

  console.log('\n====================================================');
  console.log(`🚀 ROLEMATCH SCOUT RUN — ${new Date().toLocaleString()}`);
  console.log(
    `🌍 Allowed Locations: India, UAE, Saudi Arabia, Qatar, Kuwait, Oman, Singapore`
  );
  console.log(
    `⏱️  Window: Last ${maxHours}h | Auto-Delete: >= ${deleteOlderThanDays} days old`
  );
  console.log('====================================================');

  const loginRes = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: baseUrl,
      Referer: `${baseUrl}/login`,
    },
    body: JSON.stringify({
      email: employerEmail,
      password: employerPassword,
    }),
  });

  if (!loginRes.ok) {
    console.error(`❌ Rolematch login failed: ${await loginRes.text()}`);
    return;
  }
  console.log(`✅ Authenticated with Rolematch as ${employerEmail}`);

  // Query live Rolematch DB to purge >=4d old jobs, purge invalid/non-job entries, and build deduplication index
  const existingRes = await fetch(`${baseUrl}/api/jobs`, {
    headers: { Origin: baseUrl },
  });
  const existingData = await existingRes.json();
  const existingJobs = Array.isArray(existingData.jobs)
    ? existingData.jobs
    : [];

  const dbIndex = {
    sourceUrls: new Set(),
    companyTitleKeys: new Set(),
    titleLocationKeys: new Set(),
    records: [],
  };

  let deletedCount = 0;

  for (const existingJob of existingJobs) {
    const isOld = isJobOlderThanDays(existingJob, deleteOlderThanDays);
    const isInvalid = isInvalidDatabaseJobRecord(existingJob);

    if (isOld || isInvalid) {
      try {
        const delRes = await fetch(
          `${baseUrl}/api/jobs?id=${encodeURIComponent(String(existingJob.id))}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Origin: baseUrl,
              Referer: `${baseUrl}/employer/jobs`,
            },
          }
        );
        if (delRes.ok) {
          deletedCount++;
          console.log(
            isInvalid
              ? `🧹 Removed invalid non-job entry from DB: #${existingJob.id} "${existingJob.title}"`
              : `🗑️  Deleted ${deleteOlderThanDays}+ day old job from DB: #${existingJob.id} "${existingJob.title}"`
          );
          continue;
        }
      } catch {}
    }

    registerJobInDbIndex(
      existingJob,
      existingJob.company_name || '',
      dbIndex
    );
  }

  console.log(
    `🗄️  Database Validation: ${dbIndex.records.length} valid active job(s) currently in Rolematch DB.`
  );

  let totalPublished = 0;

  for (const company of companies) {
    const rawJobs = await crawlCompanyJobs(company);

    const recencyMatched = rawJobs.filter(
      (j) =>
        isValidJobPosting(j.title, j.sourceUrl, j.description) &&
        isAllowedLocation(j.location) &&
        isWithinRecencyWindow(j.rawPublishedAt, maxHours, deleteOlderThanDays)
    );

    let skippedDuplicates = 0;
    const jobsToPublish = [];

    for (const job of recencyMatched) {
      if (isJobAlreadyInDatabase(job, company.companyName, dbIndex)) {
        skippedDuplicates++;
        continue;
      }
      jobsToPublish.push(job);
    }

    console.log(
      `   Found ${rawJobs.length} valid location-matched job(s) | ${skippedDuplicates} already in DB (skipped) | ${jobsToPublish.length} to publish.`
    );

    for (const job of jobsToPublish.slice(
      0,
      criteria.maxJobsPerCompany || 50
    )) {
      if (isJobAlreadyInDatabase(job, company.companyName, dbIndex)) {
        continue;
      }

      const payload = {
        isScoutAgent: true,
        title: job.title,
        companyName: company.companyName,
        employerEmail,
        location: job.location,
        workMode:
          job.workMode ||
          inferWorkMode(
            job.title,
            job.location,
            job.description,
            criteria.defaultWorkMode
          ),
        salary: 'Not Disclosed',
        experience: inferExperience(
          job.description || '',
          criteria.defaultExperience || '3 - 8 Yrs'
        ),
        openings: 1,
        postedDate: job.postedDate || new Date().toISOString().split('T')[0],
        noticePeriod: criteria.defaultNoticePeriod || '30 Days',
        skills: extractSkills(
          `${job.title} ${job.description}`,
          criteria.includeKeywords
        ),
        description: job.description,
      };

      const postRes = await fetch(`${baseUrl}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: baseUrl,
          Referer: `${baseUrl}/employer/jobs/new`,
        },
        body: JSON.stringify(payload),
      });

      if (postRes.ok) {
        registerJobInDbIndex(job, company.companyName, dbIndex);
        totalPublished++;
        console.log(
          `   ✅ Published to DB: "${job.title}" — ${company.companyName} [${payload.location}]`
        );
      } else {
        const err = await postRes.text();
        console.warn(`   ⚠️ Failed to publish "${job.title}": ${err}`);
      }
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(
    `🎉 Run complete! Published: ${totalPublished} | Cleaned/Deleted: ${deletedCount}`
  );
  console.log('----------------------------------------------------');
}

async function startAgent() {
  await executeScoutCycle();

  const config = fs.existsSync(CONFIG_PATH)
    ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
    : {};
  const runOnceFlag = process.argv.includes('--once');
  const autoRun = !runOnceFlag && (config.schedule?.autoRun ?? true);
  const intervalHours = Number(config.schedule?.runEveryHours ?? 12);
  const intervalMs = intervalHours * 60 * 60 * 1000;

  if (autoRun) {
    console.log(
      `\n⏰ Auto-Scheduler active: Next run in ${intervalHours} hours.`
    );
    setInterval(executeScoutCycle, intervalMs);
  }
}

startAgent();