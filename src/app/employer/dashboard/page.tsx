'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmployerDashboardPage() {
  const [employerName, setEmployerName] = useState('Employer');
  const [employerEmail, setEmployerEmail] = useState('');
  const [kycStatus, setKycStatus] = useState<'LOADING' | 'PENDING' | 'APPROVED'>('LOADING');
  const [showDemoModal, setShowDemoModal] = useState<string | null>(null);

  // Interactive KYC Modal States
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycStep, setKycStep] = useState<1 | 2>(1);
  const [firmType, setFirmType] = useState<
    'Company/ Partnership' | 'Proprietorship' | 'Individual' | ''
  >('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [proofType, setProofType] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycSuccess, setKycSuccess] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      setKycStatus('PENDING');
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      const email = parsed.email || '';
      if (parsed.name) {
        setEmployerName(parsed.name);
      }
      setEmployerEmail(email);

      if (!email) {
        setKycStatus('PENDING');
        return;
      }

      // Check cached KYC status first so banner never flashes if already approved
      const cachedKyc = localStorage.getItem(`kyc_status_${email.toLowerCase()}`);
      if (cachedKyc === 'APPROVED') {
        setKycStatus('APPROVED');
      }

      // Fetch profile name and live KYC status from Neon DB
      fetch(`/api/employer/company-profile?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.contactPerson) {
            setEmployerName(data.contactPerson);
          }
          if (data?.kycStatus?.toUpperCase() === 'APPROVED') {
            setKycStatus('APPROVED');
            localStorage.setItem(`kyc_status_${email.toLowerCase()}`, 'APPROVED');
          } else if (cachedKyc !== 'APPROVED') {
            setKycStatus('PENDING');
          }
        })
        .catch(() => {
          if (cachedKyc !== 'APPROVED') {
            setKycStatus('PENDING');
          }
        });
    } catch {
      setKycStatus('PENDING');
    }
  }, []);

  // Read file as Base64 Data URL so it can be stored in the database
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 4 * 1024 * 1024) {
        setFileError('File size exceeds 4MB limit. Please upload a file under 4MB.');
        return;
      }

      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadedFileData(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinishKyc = async () => {
    if (!proofType || !uploadedFileName) return;
    setKycSubmitting(true);
    setFileError('');

    try {
      const res = await fetch('/api/employer/company-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: employerEmail,
          kycStatus: 'APPROVED',
          kycName: proofType,
          kycFirmType: firmType || 'Company/ Partnership',
          kycProofType: proofType,
          kycDocumentName: uploadedFileName,
          kycDocumentData: uploadedFileData || '',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save KYC');
      }

      // Immediately hide banner and persist status
      setKycStatus('APPROVED');
      if (employerEmail) {
        localStorage.setItem(`kyc_status_${employerEmail.toLowerCase()}`, 'APPROVED');
      }

      setKycSubmitting(false);
      setKycSuccess(true);

      setTimeout(() => {
        setShowKycModal(false);
        setKycSuccess(false);
        setKycStep(1);
      }, 1800);
    } catch {
      setKycSubmitting(false);
      setFileError('Could not save KYC document to database. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-10 px-6 md:px-12 relative">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Heading */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-6">
          Welcome, {employerName}!
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* ==========================================================
              LEFT / MAIN COLUMN
             ========================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. IMPORTANT: YOUR KYC IS PENDING BANNER (Disappears once APPROVED) */}
            {kycStatus === 'PENDING' && (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6 shadow-lg">
                <span className="inline-block px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-extrabold mb-2">
                  Important
                </span>
                <h2 className="text-base font-extrabold text-white">
                  Your KYC is pending
                </h2>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  Complete your KYC to secure all your future transactions and
                  enjoy a seamless experience
                </p>
                <button
                  onClick={() => {
                    setShowKycModal(true);
                    setKycStep(1);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow cursor-pointer"
                >
                  Complete KYC
                </button>
              </div>
            )}

            {/* 2. RESDEX - RESUME DATABASE CARD */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-white mb-4">
                  Resdex - Rolematch&apos;s resume database
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>
                      Easily find relevant candidates from our database with
                      smart search and filters.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>
                      Reach verified and talented jobseekers across all
                      industries.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>
                      Find quality candidates with completely verified
                      information
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>
                      Instantly reach candidates using customized communication
                      via Email/Phone/SMS/Chat.
                    </span>
                  </li>
                </ul>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/employer/buy-online"
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow"
                  >
                    Buy Now
                  </Link>
                  <button
                    onClick={() => setShowDemoModal('Resdex')}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Request for a demo
                  </button>
                </div>
              </div>

              <div className="w-full sm:w-44 h-36 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center justify-center p-4 shrink-0 text-center">
                <div className="text-4xl mb-2">👩‍💻</div>
                <span className="text-[11px] font-bold text-slate-400">
                  Smart Candidate Search
                </span>
              </div>
            </div>

            {/* 3. JOB POSTING CARD */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-white mb-4">
                  Job posting
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>Post job in just 2 mins</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>
                      Reach active jobseekers matching your exact role criteria.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>
                      Get quality applies guaranteed with 30 days visibility of
                      your job ads
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>Contact candidates directly via call or mail</span>
                  </li>
                </ul>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/employer/buy-online"
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow"
                  >
                    Buy Now
                  </Link>
                  <button
                    onClick={() => setShowDemoModal('Job Posting')}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Request for a demo
                  </button>
                </div>
              </div>

              <div className="w-full sm:w-44 h-36 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center justify-center p-4 shrink-0 text-center">
                <div className="text-4xl mb-2">📢</div>
                <span className="text-[11px] font-bold text-slate-400">
                  Instant Job Broadcast
                </span>
              </div>
            </div>

            {/* 4. ELIGIBLE FOR POSTING A FREE JOB CARD */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  You are eligible for posting a Free Job
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-5">
                  Start without any charges and upgrade later
                </p>
                <Link
                  href="/employer/jobs/new"
                  className="inline-block px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow"
                >
                  Post a free job
                </Link>
              </div>

              <div className="w-full sm:w-44 h-28 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-center text-3xl shrink-0">
                🖥️✨
              </div>
            </div>

            {/* 5. CREATE SUB-USERS CARD */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-7 shadow-xl">
              <h3 className="text-base font-extrabold text-white mb-2">
                Create Sub-Users
              </h3>
              <p className="text-xs text-slate-400">
                You have not created sub-users yet.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                <Link
                  href="/settings"
                  className="text-blue-400 font-bold hover:underline"
                >
                  Click here
                </Link>{' '}
                to create sub-users and assign them product access rights.
              </p>
            </div>
          </div>

          {/* ==========================================================
              RIGHT COLUMN
             ========================================================== */}
          <aside className="lg:col-span-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl lg:sticky lg:top-24">
              <h3 className="text-base font-extrabold text-white mb-5">
                Join upcoming webinars
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3.5">
                  <div className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center shrink-0">
                    <span className="block text-xs font-extrabold text-blue-400">
                      Upcoming
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      10:15 AM
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 leading-snug">
                    Job Posting Essentials - Post Smarter on Rolematch
                  </p>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center shrink-0">
                    <span className="block text-xs font-extrabold text-blue-400">
                      Session 2
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      10:15 AM
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 leading-snug">
                    Resdex Essentials: Find the Right Talent, Faster
                  </p>
                </div>
              </div>

              <Link
                href="/help"
                className="block w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition shadow"
              >
                View all webinars
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Bottom-Right Rolematch Help Button */}
      <Link
        href="/help"
        className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-2xl transition"
      >
        <span>🎧</span>
        <span>Rolematch Help</span>
      </Link>

      {/* =====================================================================
          INTERACTIVE KYC VERIFICATION MODAL
         ==================================================================== */}
      {showKycModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-8 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowKycModal(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {kycSuccess ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  KYC Verified &amp; Approved!
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Your document has been saved and your KYC status is now
                  Approved.
                </p>
              </div>
            ) : kycStep === 1 ? (
              /* STEP 1: FIRM TYPE & TERMS CONSENT */
              <div>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-600 text-white px-2 py-0.5 rounded mb-1">
                      KYC
                    </span>
                    <span className="text-2xl">🧑‍💻</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    Complete your KYC and secure your account
                  </h3>
                </div>

                <div className="mb-6 p-5 rounded-2xl bg-slate-800/50 border border-slate-700/70">
                  <label className="block text-xs font-bold text-slate-300 mb-3.5">
                    Choose one, that best describes your firm
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        'Company/ Partnership',
                        'Proprietorship',
                        'Individual',
                      ] as const
                    ).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFirmType(type)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
                          firmType === type
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            firmType === type
                              ? 'border-blue-400 bg-blue-500'
                              : 'border-slate-500'
                          }`}
                        >
                          {firmType === type && (
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          )}
                        </span>
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-7">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300 leading-relaxed">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>
                      I provide consent for the verification of the documents
                      submitted here, for purposes mentioned in the{' '}
                      <Link
                        href="/privacy"
                        className="text-blue-400 font-bold hover:underline"
                      >
                        Privacy Policy
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/terms"
                        className="text-blue-400 font-bold hover:underline"
                      >
                        Terms and conditions
                      </Link>{' '}
                      . I also consent to get this verification done via third
                      party service provider.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    disabled={!consentChecked || !firmType}
                    onClick={() => setKycStep(2)}
                    className={`px-8 py-3 rounded-xl font-bold text-xs transition shadow-lg ${
                      consentChecked && firmType
                        ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                        : 'bg-blue-600/40 text-white/60 cursor-not-allowed'
                    }`}
                  >
                    Start KYC Process
                  </button>

                  <p className="text-[11px] text-slate-400 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!firmType) setFirmType('Company/ Partnership');
                        setConsentChecked(true);
                        setKycStep(2);
                      }}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Click here
                    </button>{' '}
                    to complete this process through your phone
                  </p>
                </div>
              </div>
            ) : (
              /* STEP 2: DOCUMENT SELECTION & UPLOAD */
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-6 pb-4 border-b border-slate-800 pr-8">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      KYC Verification
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Complete KYC verification process to access Rolematch
                      features
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs text-slate-400 shrink-0">
                    <div>
                      KYC helpline:{' '}
                      <strong className="text-slate-200">0120-7102131</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mon to Sat (10 AM to 6 PM)
                    </div>
                  </div>
                </div>

                <div className="space-y-5 mb-8">
                  {/* Proof Type Select */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Name and Address proof type
                    </label>
                    <select
                      value={proofType}
                      onChange={(e) => setProofType(e.target.value)}
                      className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">Please select</option>
                      <option value="GST Certificate">GST Certificate</option>
                      <option value="Certificate of Incorporation">
                        Certificate of Incorporation
                      </option>
                      <option value="Udyam Aadhaar Number">
                        Udyam Aadhaar Number
                      </option>
                    </select>
                  </div>

                  {/* Uploaded Files List (with green bottom progress bar + trash icon) */}
                  {uploadedFileName && (
                    <div className="max-w-sm">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Files
                      </label>
                      <div className="flex items-center justify-between py-2 border-b-2 border-emerald-500 text-xs text-white font-semibold">
                        <span className="truncate pr-3">{uploadedFileName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFileName(null);
                            setUploadedFileData(null);
                          }}
                          className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload Proof Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Upload Proof
                    </label>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Upto 2 documents in pdf, jpeg or png format with maximum
                      4MB can be uploaded.
                    </p>
                    <label className="inline-block px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 text-xs font-bold border border-blue-500/60 cursor-pointer transition">
                      <span>Choose file</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {fileError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
                      <span className="text-red-400 font-bold">!</span>
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setKycStep(1)}
                    className="px-6 py-2.5 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/10 font-bold text-xs cursor-pointer transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!proofType || !uploadedFileName || kycSubmitting}
                    onClick={handleFinishKyc}
                    className={`px-7 py-2.5 rounded-lg font-bold text-xs transition shadow ${
                      proofType && uploadedFileName && !kycSubmitting
                        ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                        : 'bg-blue-600/40 text-white/60 cursor-not-allowed'
                    }`}
                  >
                    {kycSubmitting ? 'Saving...' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                Request a Demo – {showDemoModal}
              </h3>
              <button
                onClick={() => setShowDemoModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              Our enterprise hiring specialist will reach out to your registered
              contact details to walk you through {showDemoModal}.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDemoModal(null)}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}