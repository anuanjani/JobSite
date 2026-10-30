'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EmployerRegisterPage() {
  const router = useRouter();

  // Step 0 = Mobile & OTP verification | Step 1 = Basic details | Step 2 = Company details
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const [formData, setFormData] = useState({
    mobile: '',
    accountType: 'company' as 'company' | 'individual',
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    industry: 'Software Services',
    employees: '11-50',
    designation: '',
    pincode: '',
    city: '',
    state: '',
    address: '',
  });

  // Step 0 Mobile & OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');

  // Step 1 Email & Email-Triggered Password States
  const [emailError, setEmailError] = useState('');
  const [emailSuccessMsg, setEmailSuccessMsg] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailPasswordSent, setEmailPasswordSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Shared Button Loading & Error States
  const [loadingAction, setLoadingAction] = useState<
    'send-otp' | 'verify-otp' | 'send-email-pwd' | 'step-1' | 'submit' | null
  >(null);
  const [formError, setFormError] = useState('');

  // Strict Enterprise Email & Password Regexes
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const isPasswordValid = passwordRegex.test(formData.password);

  // Cooldown timer for resending emailed password
  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = setInterval(() => {
      setEmailCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [emailCooldown]);

  // Live Email Format Validator (Catches spaces & invalid formats immediately)
  const validateEmailFormat = (rawEmail: string): string => {
    if (!rawEmail) {
      return 'Please enter your official email ID.';
    }
    if (/\s/.test(rawEmail)) {
      return 'Please correct email format (spaces are not allowed).';
    }
    if (!emailRegex.test(rawEmail)) {
      return 'Please correct email format (e.g. name@company.com).';
    }
    return '';
  };

  // ---------------------------------------------------------------------------
  // STEP 0 HANDLERS: MOBILE DB CHECK & OTP
  // ---------------------------------------------------------------------------
  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError('');
    const cleanMobile = formData.mobile.replace(/\D/g, '');

    if (cleanMobile.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoadingAction('send-otp');
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const res = await fetch('/api/register/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile }),
      });
      const data = await res.json();

      if (!res.ok || data.exists) {
        setMobileError(
          data.error || 'This mobile number is already registered.'
        );
        setLoadingAction(null);
        return;
      }

      setOtp(['', '', '', '', '', '']);
      setOtpSent(true);
    } catch {
      setMobileError(
        'Unable to verify mobile number right now. Please try again.'
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (otp.join('') !== '000000') {
      setOtpError('Invalid OTP. Use dummy OTP: 000000');
      return;
    }

    setLoadingAction('verify-otp');
    await new Promise((r) => setTimeout(r, 1200));
    setLoadingAction(null);
    setStep(1);
  };

  // ---------------------------------------------------------------------------
  // STEP 1A HANDLER: REAL-TIME DUPLICATE EMAIL CHECK & SEND PASSWORD TO EMAIL
  // ---------------------------------------------------------------------------
  const handleSendPasswordToEmail = async () => {
    setEmailError('');
    setEmailSuccessMsg('');
    setFormError('');
    setEmailTouched(true);

    const formatErr = validateEmailFormat(formData.email);
    if (formatErr) {
      setEmailError(formatErr);
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    setLoadingAction('send-email-pwd');

    try {
      const res = await fetch('/api/register/email-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: cleanEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailPasswordSent(false);
        setEmailError(
          data.error ||
            'This Email ID is already registered. Please sign in or use a different email.'
        );
        return;
      }

      setEmailPasswordSent(true);
      setEmailCooldown(30);
      setEmailSuccessMsg(
        data.message ||
          `Verification password sent to ${cleanEmail}. Enter the exact password below.`
      );
    } catch {
      setEmailError(
        'Failed to trigger verification email. Please check your connection and try again.'
      );
    } finally {
      setLoadingAction(null);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 1B HANDLER: VALIDATE EMAILED PASSWORD + NEON DB CHECK
  // ---------------------------------------------------------------------------
  const handleContinueStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setEmailTouched(true);

    if (!formData.fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const formatErr = validateEmailFormat(formData.email);
    if (formatErr) {
      setEmailError(formatErr);
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();

    if (!emailPasswordSent) {
      setFormError(
        'Please click "Get Password" next to your email address to receive your verification password first.'
      );
      return;
    }

    if (!isPasswordValid) {
      setIsPasswordFocused(true);
      setFormError(
        'Please enter the valid enterprise password sent to your email (uppercase, lowercase, number, special character, 8+ chars).'
      );
      return;
    }

    setLoadingAction('step-1');

    try {
      await new Promise((r) => setTimeout(r, 900));

      // Verify that the entered password matches the exact password emailed to the user
      const verifyRes = await fetch('/api/register/email-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: cleanEmail,
          password: formData.password,
        }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        setFormError(
          verifyData.error ||
            'The password you entered does not match the password sent to your email.'
        );
        setLoadingAction(null);
        return;
      }

      if (!formData.companyName) {
        setFormData((prev) => ({
          ...prev,
          companyName: prev.fullName.trim(),
        }));
      }

      setLoadingAction(null);
      setStep(2);
    } catch {
      setEmailError(
        'Failed to validate email password with database. Please try again.'
      );
      setLoadingAction(null);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 2 HANDLER: FINAL EMPLOYER REGISTRATION SUBMIT
  // ---------------------------------------------------------------------------
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.companyName.trim() || !formData.designation.trim()) {
      setFormError('Please fill in all required company details.');
      return;
    }

    setLoadingAction('submit');

    try {
      await new Promise((r) => setTimeout(r, 1400));
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          mobileNumber: formData.mobile.replace(/\D/g, ''),
          phone: formData.mobile.replace(/\D/g, ''),
          hiringFor: formData.accountType,
          companyName: formData.companyName.trim(),
          industry: formData.industry,
          industryType: formData.industry,
          employees: formData.employees,
          employeeCount: formData.employees,
          designation: formData.designation.trim(),
          pincode: formData.pincode.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          address: formData.address.trim(),
          role: 'EMPLOYER',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Registration failed.');
        setLoadingAction(null);
        return;
      }

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id || data.user?.id,
          name: formData.fullName.trim(),
          companyName: formData.companyName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.mobile.replace(/\D/g, ''),
          role: 'EMPLOYER',
        })
      );

      window.dispatchEvent(
        new CustomEvent('profile-updated', { detail: data.user || data })
      );

      router.push('/employer/dashboard');
    } catch {
      setFormError('Failed to connect to server. Please try again.');
      setLoadingAction(null);
    }
  };

  // Helper to render the exact Login Page button + shimmer + spinner animation
  const renderEnterpriseButton = ({
    isLoading,
    isDisabled,
    idleText,
    loadingText,
  }: {
    isLoading: boolean;
    isDisabled?: boolean;
    idleText: string;
    loadingText: string;
  }) => (
    <button
      type="submit"
      disabled={isLoading || isDisabled}
      className={`relative overflow-hidden flex h-14 w-full items-center justify-center rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all duration-300 mt-6 ${
        isLoading
          ? 'cursor-wait bg-slate-800 text-slate-300 border border-slate-700'
          : isDisabled
          ? 'cursor-not-allowed bg-slate-800/50 text-slate-500 border border-slate-800 opacity-60'
          : 'bg-white text-slate-950 hover:bg-slate-200 shadow-lg cursor-pointer'
      }`}
    >
      {isLoading && (
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          style={{ animation: 'shimmer 1.5s infinite' }}
        ></div>
      )}
      <div className="relative z-10 flex items-center gap-3">
        {isLoading ? (
          <>
            <svg
              className="w-4 h-4 animate-spin text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <span>{loadingText}</span>
          </>
        ) : (
          <span>{idleText}</span>
        )}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 flex items-center justify-center relative p-6 py-24">
      {/* Login-Identical Shimmer Keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Ambient Glow */}
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Main Card with `group` so top-right (✕) hides when cursor leaves card */}
      <div className="group w-full max-w-5xl rounded-[2rem] bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl">
        {/* Top Right Close Button (Appears on card hover just like Login page) */}
        <Link
          href="/"
          className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-indigo-400 transition-all duration-300 text-slate-400 z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          ✕
        </Link>

        {/* ============================================================
            LEFT ENTERPRISE INFO PANEL
           ============================================================ */}
        <div className="w-full md:w-5/12 bg-slate-900/50 p-10 lg:p-12 flex flex-col border-r border-slate-700/50 justify-between">
          <div>
            <div className="inline-block px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 mb-6">
              Enterprise Talent Cloud
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white leading-[1.1] mb-4">
              Find &amp; hire the{' '}
              <span className="text-indigo-400">right talent</span> with us.
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-400 mb-8">
              Trusted by 9 Cr+ candidates | 5 Lakh+ employers
            </p>

            {/* Enterprise Value Checklist */}
            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-3.5">
                <svg
                  className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <p className="text-xs sm:text-sm font-medium text-slate-300">
                  Post jobs in 2 minutes &amp; receive verified applicant
                  profiles
                </p>
              </div>
              <div className="flex items-start gap-3.5">
                <svg
                  className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <p className="text-xs sm:text-sm font-medium text-slate-300">
                  Instant access to Resdex database with smart skill filters
                </p>
              </div>
              <div className="flex items-start gap-3.5">
                <svg
                  className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <p className="text-xs sm:text-sm font-medium text-slate-300">
                  Enterprise-grade KYC security &amp; dedicated sub-user roles
                </p>
              </div>
            </div>

            {/* Recruiter Avatar Stack */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[11px] font-extrabold text-white">
                  JD
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-slate-900 flex items-center justify-center text-[11px] font-extrabold text-white">
                  AS
                </div>
                <div className="w-9 h-9 rounded-full bg-pink-600 border-2 border-slate-900 flex items-center justify-center text-[11px] font-extrabold text-white">
                  MK
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[11px] font-extrabold text-slate-950">
                  TS
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Join thousands of recruiters
              </span>
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-slate-800/80 text-xs text-slate-400">
            Looking for a job instead?{' '}
            <Link
              href="/register"
              className="text-pink-400 font-bold hover:underline"
            >
              Register as Candidate &rarr;
            </Link>
          </div>
        </div>

        {/* ============================================================
            RIGHT FORM PANEL
           ============================================================ */}
        <div className="w-full md:w-7/12 p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Enterprise 3-Step Progress Bar */}
            <div className="flex items-center gap-2 mb-8 pr-10">
              {[
                { idx: 0, label: '1. Mobile OTP' },
                { idx: 1, label: '2. Basic Details' },
                { idx: 2, label: '3. Company Info' },
              ].map((item) => {
                const isActive = step === item.idx;
                const isDone = step > item.idx;
                return (
                  <div key={item.idx} className="flex-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-500'
                          : isActive
                          ? 'bg-indigo-500'
                          : 'bg-slate-800'
                      }`}
                    />
                    <span
                      className={`block text-[10px] font-extrabold uppercase tracking-wider mt-2 ${
                        isDone
                          ? 'text-emerald-400'
                          : isActive
                          ? 'text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {isDone ? `✓ ${item.label.slice(3)}` : item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {step === 0 && (
              /* STEP 0: MOBILE VERIFICATION */
              <div>
                <h1 className="text-3xl font-extrabold tracking-tighter text-white mb-2">
                  Verify Mobile Number
                </h1>
                <p className="text-sm text-slate-400 font-medium mb-8">
                  Enter your official 10-digit mobile number to begin employer
                  onboarding.
                </p>

                {!otpSent ? (
                  <form
                    noValidate
                    onSubmit={handleSendMobileOtp}
                    className="space-y-5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Mobile Number *
                        </label>
                        <span className="text-[10px] font-bold text-slate-500">
                          {formData.mobile.length}/10 digits
                        </span>
                      </div>

                      <div
                        className={`flex h-14 bg-slate-900 border rounded-xl overflow-hidden transition-colors ${
                          mobileError
                            ? 'border-red-500 focus-within:border-red-500'
                            : 'border-slate-700 focus-within:border-indigo-500'
                        }`}
                      >
                        <div className="bg-slate-800 px-5 text-sm font-bold text-slate-400 border-r border-slate-700 flex items-center justify-center shrink-0">
                          +91
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Enter 10-digit mobile number"
                          value={formData.mobile}
                          onChange={(e) => {
                            const digits = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 10);
                            setFormData({ ...formData, mobile: digits });
                            setMobileError('');
                          }}
                          className="flex-1 bg-transparent px-4 text-sm text-white outline-none"
                        />
                      </div>

                      {mobileError && (
                        <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20 mt-3">
                          {mobileError}
                        </p>
                      )}
                    </div>

                    {renderEnterpriseButton({
                      isLoading: loadingAction === 'send-otp',
                      isDisabled: formData.mobile.length !== 10,
                      idleText: 'CONTINUE',
                      loadingText: 'VERIFYING NUMBER...',
                    })}
                  </form>
                ) : (
                  <form
                    noValidate
                    onSubmit={handleVerifyMobileOtp}
                    className="space-y-5"
                  >
                    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Enter 6-Digit OTP sent to +91 {formData.mobile}
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
                        >
                          Change Number
                        </button>
                      </div>

                      <div className="flex gap-2.5 sm:gap-3 justify-start mb-3">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              otpRefs.current[idx] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(e.target.value, idx)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                            className="w-11 h-12 sm:w-12 sm:h-13 bg-slate-950 border border-slate-700 rounded-xl text-center text-base font-bold text-white outline-none focus:border-indigo-500"
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Use enterprise test OTP: 000000
                      </p>

                      {otpError && (
                        <p className="text-red-400 text-xs font-bold bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 mt-3">
                          {otpError}
                        </p>
                      )}
                    </div>

                    {renderEnterpriseButton({
                      isLoading: loadingAction === 'verify-otp',
                      isDisabled: otp.join('').length !== 6,
                      idleText: 'VERIFY & CONTINUE',
                      loadingText: 'VERIFYING OTP...',
                    })}
                  </form>
                )}
              </div>
            )}

            {step === 1 && (
              /* STEP 1: BASIC DETAILS + REAL-TIME EMAIL PASSWORD TRIGGER */
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tighter text-white">
                      Basic Details
                    </h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                      Set up your recruiter credentials and account type.
                    </p>
                  </div>
                  {formData.mobile && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0">
                      ✓ +91 {formData.mobile}
                    </span>
                  )}
                </div>

                <form
                  noValidate
                  onSubmit={handleContinueStep1}
                  className="space-y-5"
                >
                  {/* Account Type Enterprise Cards */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">
                      YOU&apos;RE CREATING ACCOUNT AS *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, accountType: 'company' })
                        }
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          formData.accountType === 'company'
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            formData.accountType === 'company'
                              ? 'border-indigo-400 bg-indigo-600'
                              : 'border-slate-500'
                          }`}
                        >
                          {formData.accountType === 'company' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <div>
                          <span className="block text-xs font-extrabold text-white">
                            Company / Business
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            Corporate or agency hiring
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            accountType: 'individual',
                          })
                        }
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          formData.accountType === 'individual'
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            formData.accountType === 'individual'
                              ? 'border-indigo-400 bg-indigo-600'
                              : 'border-slate-500'
                          }`}
                        >
                          {formData.accountType === 'individual' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <div>
                          <span className="block text-xs font-extrabold text-white">
                            Individual / Proprietor
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            Independent proprietor
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Official Email ID + Real-Time Password Email Trigger */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        OFFICIAL EMAIL ID *
                      </label>
                      {emailPasswordSent && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                          ✓ Password Sent to Email
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={formData.email}
                        onBlur={() => {
                          setEmailTouched(true);
                          if (formData.email) {
                            setEmailError(validateEmailFormat(formData.email));
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, email: val });
                          setEmailPasswordSent(false);
                          setEmailSuccessMsg('');

                          if (/\s/.test(val)) {
                            setEmailError(
                              'Please correct email format (spaces are not allowed).'
                            );
                          } else if (emailTouched && val) {
                            setEmailError(validateEmailFormat(val));
                          } else {
                            setEmailError('');
                          }
                        }}
                        className={`flex-1 bg-slate-900 border rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-colors ${
                          emailError
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-slate-700 focus:border-indigo-500'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={handleSendPasswordToEmail}
                        disabled={
                          loadingAction === 'send-email-pwd' ||
                          emailCooldown > 0
                        }
                        className="px-4 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[11px] font-extrabold uppercase tracking-wider transition cursor-pointer shrink-0 shadow-lg"
                      >
                        {loadingAction === 'send-email-pwd'
                          ? 'Sending...'
                          : emailCooldown > 0
                          ? `Resend (${emailCooldown}s)`
                          : emailPasswordSent
                          ? 'Resend Password'
                          : 'Get Password'}
                      </button>
                    </div>

                    {emailError && (
                      <p className="text-red-400 text-xs font-bold bg-red-500/10 px-3.5 py-2.5 rounded-xl border border-red-500/20 mt-2 flex items-center gap-2">
                        <span>⚠</span>
                        <span>{emailError}</span>
                      </p>
                    )}

                    {emailSuccessMsg && !emailError && (
                      <p className="text-emerald-300 text-xs font-bold bg-emerald-500/10 px-3.5 py-2.5 rounded-xl border border-emerald-500/25 mt-2 flex items-center gap-2">
                        <span>✓</span>
                        <span>{emailSuccessMsg}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Input with Fixed Vertically Centered Eye Toggle + Enterprise Checklist */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      {emailPasswordSent
                        ? 'ENTER PASSWORD RECEIVED ON EMAIL *'
                        : 'CREATE / VERIFY PASSWORD (SENT ON EMAIL) *'}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder={
                          emailPasswordSent
                            ? 'Paste the password received on your email'
                            : 'Click "Get Password" above to receive password on email'
                        }
                        value={formData.password}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                      />

                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        title={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                        className="absolute right-3.5 flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {isPasswordFocused && (
                      <div className="absolute left-0 top-[calc(100%+6px)] w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl shadow-2xl z-50 text-xs text-slate-300 space-y-1.5">
                        <p className="font-bold text-white">
                          Enterprise password verification requirements:
                        </p>
                        <p
                          className={`flex items-center gap-2 ${
                            emailPasswordSent
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          <span>{emailPasswordSent ? '✓' : '•'}</span> Must
                          match the password sent to your official email ID
                        </p>
                        <p
                          className={`flex items-center gap-2 ${
                            /[A-Z]/.test(formData.password)
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {/[A-Z]/.test(formData.password) ? '✓' : '•'}
                          </span>{' '}
                          At least one uppercase letter (A-Z)
                        </p>
                        <p
                          className={`flex items-center gap-2 ${
                            /[a-z]/.test(formData.password)
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {/[a-z]/.test(formData.password) ? '✓' : '•'}
                          </span>{' '}
                          At least one lowercase letter (a-z)
                        </p>
                        <p
                          className={`flex items-center gap-2 ${
                            /\d/.test(formData.password)
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {/\d/.test(formData.password) ? '✓' : '•'}
                          </span>{' '}
                          At least one number (0-9)
                        </p>
                        <p
                          className={`flex items-center gap-2 ${
                            /[\W_]/.test(formData.password)
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {/[\W_]/.test(formData.password) ? '✓' : '•'}
                          </span>{' '}
                          At least one special character (!@#$%^&amp;*)
                        </p>
                        <p
                          className={`flex items-center gap-2 ${
                            formData.password.length >= 8
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {formData.password.length >= 8 ? '✓' : '•'}
                          </span>{' '}
                          Minimum 8 characters
                        </p>
                      </div>
                    )}
                  </div>

                  {formError && (
                    <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                      {formError}
                    </p>
                  )}

                  {renderEnterpriseButton({
                    isLoading: loadingAction === 'step-1',
                    idleText: 'CONTINUE',
                    loadingText: 'VALIDATING CREDENTIALS...',
                  })}
                </form>
              </div>
            )}

            {step === 2 && (
              /* STEP 2: COMPANY DETAILS */
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tighter text-white">
                      Company Details
                    </h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                      Complete your organization profile to activate your
                      recruiter console.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-indigo-400 hover:underline mt-2 cursor-pointer"
                  >
                    &larr; Back
                  </button>
                </div>

                <form
                  noValidate
                  onSubmit={handleFinalSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        COMPANY NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter company name"
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        YOUR DESIGNATION *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your designation"
                        value={formData.designation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            designation: e.target.value,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        INDUSTRY TYPE *
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Software Services">
                          Software Services
                        </option>
                        <option value="IT Consulting">IT Consulting</option>
                        <option value="FinTech & Banking">
                          FinTech &amp; Banking
                        </option>
                        <option value="E-Commerce">E-Commerce</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Manufacturing">Manufacturing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        COMPANY SIZE *
                      </label>
                      <select
                        value={formData.employees}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employees: e.target.value,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="1-10">1 - 10 Employees</option>
                        <option value="11-50">11 - 50 Employees</option>
                        <option value="51-200">51 - 200 Employees</option>
                        <option value="201-500">201 - 500 Employees</option>
                        <option value="500+">500+ Employees</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        CITY *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        STATE *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter state"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                        PINCODE *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="6-digit pincode"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pincode: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                      PRIMARY ADDRESS *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Building, street, and area"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  {formError && (
                    <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                      {formError}
                    </p>
                  )}

                  {renderEnterpriseButton({
                    isLoading: loadingAction === 'submit',
                    idleText: 'COMPLETE REGISTRATION',
                    loadingText: 'CREATING EMPLOYER ACCOUNT...',
                  })}
                </form>
              </div>
            )}
          </div>

          {/* Bottom Sign-In Link */}
          <div className="mt-8 pt-6 border-t border-slate-800/70 text-center">
            <p className="text-xs font-medium text-slate-400">
              Already have an employer account?{' '}
              <Link
                href="/login"
                className="text-white font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}