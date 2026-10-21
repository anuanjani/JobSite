'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    workStatus: 'experienced',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation & DB Check States
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [checkingField, setCheckingField] = useState<'email' | 'mobile' | null>(
    null
  );
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [mobileError, setMobileError] = useState('');

  // Modal PIN states & refs
  const [activeModal, setActiveModal] = useState<'email' | 'mobile' | null>(
    null
  );
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [pinError, setPinError] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const isPasswordValid = passwordRegex.test(formData.password);
  const isNameValid = formData.name.trim().length > 0;

  const isFormValid =
    isNameValid && isPasswordValid && emailVerified && mobileVerified;

  const validateEmailFormat = (rawEmail: string): string => {
    if (!rawEmail) {
      return 'Please enter your email address.';
    }
    if (/\s/.test(rawEmail)) {
      return 'Please correct email format (spaces are not allowed).';
    }
    if (!emailRegex.test(rawEmail)) {
      return 'Please correct email format (e.g. name@example.com).';
    }
    return '';
  };

  const handleOpenValidate = async (type: 'email' | 'mobile') => {
    setError('');

    if (type === 'email') {
      setEmailTouched(true);
      const formatErr = validateEmailFormat(formData.email);
      if (formatErr) {
        setEmailError(formatErr);
        return;
      }
      setEmailError('');

      setCheckingField('email');
      try {
        await new Promise((r) => setTimeout(r, 700));
        const res = await fetch('/api/register/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email.trim() }),
        });
        const data = await res.json();

        if (!res.ok || data.exists) {
          setEmailError(data.error || 'This Email ID is already registered.');
          setCheckingField(null);
          return;
        }
      } catch {
        setEmailError('Unable to verify email right now. Please try again.');
        setCheckingField(null);
        return;
      }
      setCheckingField(null);
    }

    if (type === 'mobile') {
      setMobileError('');
      const cleanMobile = formData.mobile.replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        setMobileError('Please enter a valid 10-digit mobile number first.');
        return;
      }

      setCheckingField('mobile');
      try {
        await new Promise((r) => setTimeout(r, 700));
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
          setCheckingField(null);
          return;
        }
      } catch {
        setMobileError(
          'Unable to verify mobile number right now. Please try again.'
        );
        setCheckingField(null);
        return;
      }
      setCheckingField(null);
    }

    setPin(['', '', '', '', '', '']);
    setPinError('');
    setActiveModal(type);
  };

  const handlePinChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyPin = async () => {
    const enteredPin = pin.join('');
    if (enteredPin !== '000000') {
      setPinError('Invalid PIN. Use dummy PIN: 000000');
      return;
    }

    setVerifyingPin(true);
    await new Promise((r) => setTimeout(r, 600));
    setVerifyingPin(false);

    if (activeModal === 'email') {
      setEmailVerified(true);
      setEmailError('');
    } else if (activeModal === 'mobile') {
      setMobileVerified(true);
      setMobileError('');
    }
    setActiveModal(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError(
        'Please ensure all fields are filled and both Email & Mobile are validated.'
      );
      return;
    }

    setStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          mobileNumber: formData.mobile.replace(/\D/g, ''),
          workStatus: formData.workStatus,
          role: 'CANDIDATE',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            role: 'CANDIDATE',
          })
        );
        setStatus('success');
        router.push('/candidate/dashboard');
      } else {
        setError(data.error || 'Registration failed.');
        setStatus('idle');
      }
    } catch {
      setError('Failed to connect to server.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex items-center justify-center relative p-6 py-24">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="group w-full max-w-5xl rounded-[2rem] bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl">
        {/* Top Right Close Button (Appears on hover) */}
        <Link
          href="/"
          className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-fuchsia-400 transition-all duration-300 text-slate-400 z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          ✕
        </Link>

        {/* Left Info Panel */}
        <div className="w-full md:w-5/12 bg-slate-900/50 p-10 lg:p-12 flex flex-col border-r border-slate-700/50 justify-between">
          <div>
            <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl mb-10 shadow-inner">
              🚀
            </div>
            <h2 className="text-3xl font-extrabold tracking-tighter text-white mb-8">
              On registering, you can
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
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
                <p className="text-sm font-medium text-slate-300">
                  Build your profile and let top recruiters find you instantly
                </p>
              </div>
              <div className="flex items-start gap-4">
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
                <p className="text-sm font-medium text-slate-300">
                  Get premium job postings delivered right to your email
                </p>
              </div>
              <div className="flex items-start gap-4">
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
                <p className="text-sm font-medium text-slate-300">
                  Find a job and accelerate your career trajectory
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-7/12 p-10 lg:p-12">
          <h1 className="text-3xl font-extrabold tracking-tighter text-white mb-2">
            Create Account
          </h1>
          <p className="text-sm text-slate-400 font-medium mb-8">
            Join India&apos;s premium talent network.
          </p>

          <form
            noValidate
            onSubmit={handleRegister}
            className="space-y-5 relative z-20"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>

            {/* Email with Live Space/Format Check & Validate Button */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Email ID *
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  disabled={emailVerified}
                  onBlur={() => {
                    setEmailTouched(true);
                    if (formData.email && !emailVerified) {
                      setEmailError(validateEmailFormat(formData.email));
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, email: val });
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
                  className={`flex-1 bg-slate-900 border rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors disabled:opacity-50 ${
                    emailError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-700 focus:border-fuchsia-500'
                  }`}
                />
                {emailVerified ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={checkingField === 'email'}
                    onClick={() => handleOpenValidate('email')}
                    className="relative overflow-hidden bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-fuchsia-600/60 text-white px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer shrink-0"
                  >
                    {checkingField === 'email' && (
                      <div
                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                        style={{ animation: 'shimmer 1.5s infinite' }}
                      ></div>
                    )}
                    <span className="relative z-10">
                      {checkingField === 'email' ? 'Checking...' : 'Validate'}
                    </span>
                  </button>
                )}
              </div>
              {emailError && (
                <p className="text-red-400 text-xs font-bold bg-red-500/10 px-3.5 py-2.5 rounded-xl border border-red-500/20 mt-2 flex items-center gap-2">
                  <span>⚠</span>
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            {/* Password with Eye Show/Hide Toggle + Enterprise Requirements Checklist */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a strong password"
                  value={formData.password}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
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
                <div className="absolute left-0 top-[calc(100%+6px)] w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl shadow-xl z-50 text-xs text-slate-300 space-y-1.5">
                  <p className="font-bold text-white">Password requirements:</p>
                  <p
                    className={`flex items-center gap-2 ${
                      /[A-Z]/.test(formData.password)
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>{/[A-Z]/.test(formData.password) ? '✓' : '•'}</span>{' '}
                    At least one uppercase letter (A-Z)
                  </p>
                  <p
                    className={`flex items-center gap-2 ${
                      /[a-z]/.test(formData.password)
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>{/[a-z]/.test(formData.password) ? '✓' : '•'}</span>{' '}
                    At least one lowercase letter (a-z)
                  </p>
                  <p
                    className={`flex items-center gap-2 ${
                      /\d/.test(formData.password)
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>{/\d/.test(formData.password) ? '✓' : '•'}</span> At
                    least one number (0-9)
                  </p>
                  <p
                    className={`flex items-center gap-2 ${
                      /[\W_]/.test(formData.password)
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>{/[\W_]/.test(formData.password) ? '✓' : '•'}</span>{' '}
                    At least one special character (!@#$%^&amp;*)
                  </p>
                  <p
                    className={`flex items-center gap-2 ${
                      formData.password.length >= 8
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>{formData.password.length >= 8 ? '✓' : '•'}</span>{' '}
                    Minimum 8 characters
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Number with Validate Button */}
            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Mobile Number *
              </label>
              <div className="flex gap-2">
                <div
                  className={`flex-1 flex bg-slate-900 border rounded-xl overflow-hidden transition-colors ${
                    mobileError
                      ? 'border-red-500 focus-within:border-red-500'
                      : 'border-slate-700 focus-within:border-fuchsia-500'
                  }`}
                >
                  <div className="bg-slate-800 px-4 py-3 text-sm font-bold text-slate-400 border-r border-slate-700 flex items-center justify-center">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    disabled={mobileVerified}
                    placeholder="Enter 10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10);
                      setFormData({ ...formData, mobile: digits });
                      setMobileError('');
                    }}
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none disabled:opacity-50"
                  />
                </div>
                {mobileVerified ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={checkingField === 'mobile'}
                    onClick={() => handleOpenValidate('mobile')}
                    className="relative overflow-hidden bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-fuchsia-600/60 text-white px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer shrink-0"
                  >
                    {checkingField === 'mobile' && (
                      <div
                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                        style={{ animation: 'shimmer 1.5s infinite' }}
                      ></div>
                    )}
                    <span className="relative z-10">
                      {checkingField === 'mobile' ? 'Checking...' : 'Validate'}
                    </span>
                  </button>
                )}
              </div>
              {mobileError && (
                <p className="text-red-400 text-xs font-bold mt-2">
                  {mobileError}
                </p>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                Work Status *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, workStatus: 'experienced' })
                  }
                  className={`p-4 rounded-xl border text-left transition-colors duration-200 cursor-pointer ${
                    formData.workStatus === 'experienced'
                      ? 'border-fuchsia-500 bg-fuchsia-500/10'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-white">
                      I&apos;m experienced
                    </span>
                    <span className="text-lg">💼</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-2">
                    I have work experience
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, workStatus: 'fresher' })
                  }
                  className={`p-4 rounded-xl border text-left transition-colors duration-200 cursor-pointer ${
                    formData.workStatus === 'fresher'
                      ? 'border-fuchsia-500 bg-fuchsia-500/10'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-white">
                      I&apos;m a fresher
                    </span>
                    <span className="text-lg">🎓</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-2">
                    I am a student
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!isFormValid || status === 'loading'}
              className={`relative overflow-hidden flex h-14 w-full items-center justify-center rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all duration-300 mt-8 ${
                status === 'loading'
                  ? 'cursor-wait bg-slate-800 text-slate-300 border border-slate-700'
                  : !isFormValid
                  ? 'cursor-not-allowed bg-slate-800/50 text-slate-500 border border-slate-800 opacity-60'
                  : 'bg-white text-slate-950 hover:bg-slate-200 shadow-lg cursor-pointer'
              }`}
            >
              {status === 'loading' && (
                <div
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  style={{ animation: 'shimmer 1.5s infinite' }}
                ></div>
              )}
              <div className="relative z-10 flex items-center gap-3">
                {status === 'loading' ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin text-fuchsia-400"
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
                    <span>REGISTERING...</span>
                  </>
                ) : (
                  <span>REGISTER NOW</span>
                )}
              </div>
            </button>
          </form>

          <p className="text-center text-xs font-medium text-slate-500 mt-8 relative z-20">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-white font-bold hover:underline cursor-pointer transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* 6-DIGIT PIN VERIFICATION MODAL */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[999999]">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-xl font-extrabold text-white mb-2">
              Enter 6-Digit PIN
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Sent to your{' '}
              {activeModal === 'email'
                ? formData.email
                : `+91 ${formData.mobile}`}
            </p>

            <div className="flex gap-2 justify-center mb-6">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    pinInputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(e.target.value, idx)}
                  onKeyDown={(e) => handlePinKeyDown(e, idx)}
                  className="w-10 h-12 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-bold text-white outline-none focus:border-fuchsia-500"
                />
              ))}
            </div>

            {pinError && (
              <p className="text-red-400 text-xs font-bold bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 mb-4">
                {pinError}
              </p>
            )}
            <p className="text-[11px] text-slate-500 italic mb-6">
              Dummy PIN for testing: 000000
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verifyingPin}
                onClick={handleVerifyPin}
                className="relative overflow-hidden flex-1 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition cursor-pointer"
              >
                {verifyingPin && (
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                    style={{ animation: 'shimmer 1.5s infinite' }}
                  ></div>
                )}
                <span className="relative z-10">
                  {verifyingPin ? 'Verifying...' : 'Verify PIN'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}