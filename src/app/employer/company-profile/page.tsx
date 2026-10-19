'use client';
import React, { useState, useEffect } from 'react';

interface CompanyProfileData {
  companyName: string;
  username: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  companyType: string;
  industryType: string;
  contactPerson: string;
  alias: string;
  designation: string;
  websiteUrl: string;
  profileHotVacancies: string;
  profileClassifieds: string;
  phone1: string;
  phone2: string;
  tanNumber: string;
  kycStatus: string;
  kycName: string;
  kycDocumentName: string;
  kycDocumentUrl: string;
  addressLabel: string;
  address: string;
  country: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
}

const INITIAL_DATA: CompanyProfileData = {
  companyName: '',
  username: '',
  email: '',
  countryCode: '91',
  mobileNumber: '',
  companyType: 'Corporate House',
  industryType: 'Software Services',
  contactPerson: '',
  alias: '',
  designation: '',
  websiteUrl: '',
  profileHotVacancies: '',
  profileClassifieds: '',
  phone1: '',
  phone2: '',
  tanNumber: '',
  kycStatus: 'PENDING',
  kycName: '',
  kycDocumentName: '',
  kycDocumentUrl: '',
  addressLabel: 'Primary Address',
  address: '',
  country: 'India',
  city: '',
  state: '',
  pincode: '',
  gstin: 'Unregistered',
};

export default function EmployerCompanyProfilePage() {
  const [data, setData] = useState<CompanyProfileData>(INITIAL_DATA);
  const [draft, setDraft] = useState<CompanyProfileData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingKyc, setIsEditingKyc] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      const email = parsed.email || '';
      const cachedKyc = email
        ? localStorage.getItem(`kyc_status_${email.toLowerCase()}`)
        : null;

      fetch(`/api/employer/company-profile?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData && !resData.error) {
            const resolvedKycStatus =
              resData.kycStatus?.toUpperCase() === 'APPROVED' ||
              cachedKyc === 'APPROVED'
                ? 'APPROVED'
                : resData.kycStatus || 'PENDING';

            const merged: CompanyProfileData = {
              companyName:
                resData.companyName ||
                parsed.companyName ||
                parsed.name ||
                'Company Profile',
              username: resData.username || email,
              email: resData.email || email,
              countryCode: resData.countryCode || '91',
              mobileNumber:
                resData.mobileNumber || parsed.phone || parsed.mobile || '',
              companyType: resData.companyType || 'Corporate House',
              industryType: resData.industryType || 'Software Services',
              contactPerson: resData.contactPerson || parsed.name || '',
              alias:
                resData.alias || resData.contactPerson || parsed.name || '',
              designation: resData.designation || '',
              websiteUrl: resData.websiteUrl || '',
              profileHotVacancies: resData.profileHotVacancies || '',
              profileClassifieds: resData.profileClassifieds || '',
              phone1:
                resData.phone1 || resData.mobileNumber || parsed.phone || '',
              phone2: resData.phone2 || '',
              tanNumber: resData.tanNumber || '',
              kycStatus: resolvedKycStatus,
              kycName: resData.kycName || '',
              kycDocumentName: resData.kycDocumentName || '',
              kycDocumentUrl: resData.kycDocumentUrl || '',
              addressLabel: resData.addressLabel || 'Primary Address',
              address: resData.address || '',
              country: resData.country || 'India',
              city: resData.city || '',
              state: resData.state || '',
              pincode: resData.pincode || '',
              gstin: resData.gstin || 'Unregistered',
            };
            setData(merged);
            setDraft(merged);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  const handleSave = async (section: 'account' | 'company' | 'kyc') => {
    setSavingSection(section);
    setSaveMessage('');

    try {
      const res = await fetch('/api/employer/company-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      if (res.ok) {
        setData(draft);
        if (section === 'account') setIsEditingAccount(false);
        if (section === 'company') setIsEditingCompany(false);
        if (section === 'kyc') setIsEditingKyc(false);

        setSaveMessage('Changes saved successfully.');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch {
      setData(draft);
    } finally {
      setSavingSection(null);
    }
  };

  const handleCancel = (section: 'account' | 'company' | 'kyc') => {
    setDraft(data);
    if (section === 'account') setIsEditingAccount(false);
    if (section === 'company') setIsEditingCompany(false);
    if (section === 'kyc') setIsEditingKyc(false);
  };

  const isApproved = data.kycStatus?.toUpperCase() === 'APPROVED';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="pb-6 border-b border-slate-800">
          <p className="text-base font-bold text-slate-400">Company Profile</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {loading ? 'Loading...' : data.companyName || 'Company Name'}
          </h1>
        </div>

        {saveMessage && (
          <div className="mt-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
            ✓ {saveMessage}
          </div>
        )}

        {/* ================================================================
            SECTION 1: ACCOUNT DETAILS
           ================================================================ */}
        <section className="py-8 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-base font-extrabold text-white">
              Account Details
            </h2>
            {!isEditingAccount && (
              <button
                onClick={() => setIsEditingAccount(true)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4 text-sm max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Username:
              </label>
              <div className="sm:col-span-7 text-xs font-semibold text-slate-200">
                {data.username || '—'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Email for Communication:
              </label>
              <div className="sm:col-span-7 text-xs font-semibold text-slate-200">
                {data.email || '—'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Mobile Number:
              </label>
              <div className="sm:col-span-7">
                {isEditingAccount ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={draft.countryCode}
                      onChange={(e) =>
                        setDraft({ ...draft, countryCode: e.target.value })
                      }
                      className="w-16 bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-500">-</span>
                    <input
                      type="text"
                      value={draft.mobileNumber}
                      onChange={(e) =>
                        setDraft({ ...draft, mobileNumber: e.target.value })
                      }
                      className="w-48 bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    +{data.countryCode} - {data.mobileNumber || '—'}
                  </span>
                )}
              </div>
            </div>

            {isEditingAccount && (
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6 pt-2">
                <div className="sm:col-span-5"></div>
                <div className="sm:col-span-7 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleSave('account')}
                    disabled={savingSection === 'account'}
                    className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow"
                  >
                    {savingSection === 'account' ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel('account')}
                    className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================
            SECTION 2: COMPANY DETAILS
           ================================================================ */}
        <section className="py-8 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-base font-extrabold text-white">
              Company Details
            </h2>
            {!isEditingCompany && (
              <button
                onClick={() => setIsEditingCompany(true)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4 text-sm max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Company Type:
              </label>
              <div className="sm:col-span-7 text-xs font-semibold text-slate-200">
                {data.companyType}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Industry Type:
              </label>
              <div className="sm:col-span-7 text-xs font-semibold text-slate-200">
                {data.industryType}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                {isEditingCompany && (
                  <span className="text-red-400 mr-1">*</span>
                )}
                Contact Person:
              </label>
              <div className="sm:col-span-7">
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={draft.contactPerson}
                    onChange={(e) =>
                      setDraft({ ...draft, contactPerson: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.contactPerson}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Alias:
              </label>
              <div className="sm:col-span-7">
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={draft.alias}
                    onChange={(e) =>
                      setDraft({ ...draft, alias: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.alias}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Contact Person&apos;s Designation:
              </label>
              <div className="sm:col-span-7">
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={draft.designation}
                    onChange={(e) =>
                      setDraft({ ...draft, designation: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.designation}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Website URL:
              </label>
              <div className="sm:col-span-7">
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={draft.websiteUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, websiteUrl: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.websiteUrl}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Profile for Hot Vacancies:
              </label>
              <div className="sm:col-span-7">
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={draft.profileHotVacancies}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        profileHotVacancies: e.target.value,
                      })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.profileHotVacancies}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Profile for Classifieds:
              </label>
              <div className="sm:col-span-7">
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={draft.profileClassifieds}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        profileClassifieds: e.target.value,
                      })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.profileClassifieds}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                {isEditingCompany && (
                  <span className="text-red-400 mr-1">*</span>
                )}
                Phone Number 1:
              </label>
              <div className="sm:col-span-7">
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={draft.phone1}
                    onChange={(e) =>
                      setDraft({ ...draft, phone1: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.phone1}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Phone Number 2:
              </label>
              <div className="sm:col-span-7">
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={draft.phone2}
                    onChange={(e) =>
                      setDraft({ ...draft, phone2: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.phone2}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                TAN Number:
              </label>
              <div className="sm:col-span-7">
                {isEditingCompany ? (
                  <input
                    type="text"
                    value={draft.tanNumber}
                    onChange={(e) =>
                      setDraft({ ...draft, tanNumber: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.tanNumber}
                  </span>
                )}
              </div>
            </div>

            {isEditingCompany && (
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6 pt-2">
                <div className="sm:col-span-5"></div>
                <div className="sm:col-span-7 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleSave('company')}
                    disabled={savingSection === 'company'}
                    className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow"
                  >
                    {savingSection === 'company' ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel('company')}
                    className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================
            SECTION 3: KYC DETAILS (Turns APPROVED & Green once verified)
           ================================================================ */}
        <section className="pt-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-base font-extrabold text-white">KYC Details</h2>
            {!isEditingKyc && (
              <button
                onClick={() => setIsEditingKyc(true)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4 text-sm max-w-2xl">
            {/* KYC Status Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                KYC Status:
              </label>
              <div className="sm:col-span-7">
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    isApproved
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                  }`}
                >
                  {isApproved ? 'APPROVED' : data.kycStatus || 'PENDING'}
                </span>
              </div>
            </div>

            {/* Uploaded KYC Document (Stored in UploadThing & Neon DB) */}
            {data.kycDocumentName && (
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
                <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                  Verified Document:
                </label>
                <div className="sm:col-span-7 text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <span>📎 {data.kycDocumentName}</span>
                  {data.kycDocumentUrl && (
                    <a
                      href={data.kycDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline ml-2"
                    >
                      (View on UploadThing)
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Name:
              </label>
              <div className="sm:col-span-7">
                {isEditingKyc ? (
                  <input
                    type="text"
                    value={draft.kycName}
                    onChange={(e) =>
                      setDraft({ ...draft, kycName: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.kycName}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Address Label:
              </label>
              <div className="sm:col-span-7 text-xs font-semibold text-slate-200">
                {data.addressLabel || 'Primary Address'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Address:
              </label>
              <div className="sm:col-span-7">
                {isEditingKyc ? (
                  <input
                    type="text"
                    value={draft.address}
                    onChange={(e) =>
                      setDraft({ ...draft, address: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.address}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Country:
              </label>
              <div className="sm:col-span-7">
                {isEditingKyc ? (
                  <input
                    type="text"
                    value={draft.country}
                    onChange={(e) =>
                      setDraft({ ...draft, country: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.country}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                City:
              </label>
              <div className="sm:col-span-7">
                {isEditingKyc ? (
                  <input
                    type="text"
                    value={draft.city}
                    onChange={(e) =>
                      setDraft({ ...draft, city: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.city}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                State:
              </label>
              <div className="sm:col-span-7">
                {isEditingKyc ? (
                  <input
                    type="text"
                    value={draft.state}
                    onChange={(e) =>
                      setDraft({ ...draft, state: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.state}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                Pincode:
              </label>
              <div className="sm:col-span-7">
                {isEditingKyc ? (
                  <input
                    type="text"
                    value={draft.pincode}
                    onChange={(e) =>
                      setDraft({ ...draft, pincode: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.pincode}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6">
              <label className="sm:col-span-5 sm:text-right text-xs font-semibold text-slate-400">
                GSTIN:
              </label>
              <div className="sm:col-span-7">
                {isEditingKyc ? (
                  <input
                    type="text"
                    value={draft.gstin}
                    onChange={(e) =>
                      setDraft({ ...draft, gstin: e.target.value })
                    }
                    className="w-full max-w-xs bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-200">
                    {data.gstin || 'Unregistered'}
                  </span>
                )}
              </div>
            </div>

            {isEditingKyc && (
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-6 pt-2">
                <div className="sm:col-span-5"></div>
                <div className="sm:col-span-7 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleSave('kyc')}
                    disabled={savingSection === 'kyc'}
                    className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow"
                  >
                    {savingSection === 'kyc' ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel('kyc')}
                    className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}