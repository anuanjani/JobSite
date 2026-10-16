'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE');
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', mobile: '', workStatus: 'experienced' 
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Enterprise Password Validation Regex: Minimum length 8, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password complexity before submitting
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    setStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          mobileNumber: formData.mobile,
          workStatus: formData.workStatus,
          role: role
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify({ 
          name: formData.name.trim(), 
          email: formData.email.toLowerCase().trim(), 
          role: role 
        }));
        setStatus('success');
        if (role === 'EMPLOYER') {
          router.push('/employer/dashboard');
        } else {
          router.push('/candidate/dashboard');
        }
      } else {
        setError(data.error || 'Registration failed.');
        setStatus('idle');
      }
    } catch (err) {
      setError('Failed to connect to server.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex items-center justify-center relative p-6 py-24">
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Top Left Logo */}
      <div className="absolute top-0 left-0 w-full p-8 flex items-center z-20">
        <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
          ROLEMATCH<span className="text-pink-500">.</span>
        </Link>
      </div>

      <div className="group w-full max-w-5xl rounded-[2rem] bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl">
        
        {/* Top Right Close Button */}
        <Link href="/" className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-fuchsia-400 transition-all duration-300 opacity-0 group-hover:opacity-100 text-slate-400 z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
        </Link>
        
        {/* Left Info Panel */}
        <div className="w-full md:w-5/12 bg-slate-900/50 p-10 lg:p-12 flex flex-col border-r border-slate-700/50 justify-between">
            <div>
              <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl mb-10 shadow-inner">
                {role === 'CANDIDATE' ? '🚀' : '🏢'}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tighter text-white mb-8">
                {role === 'CANDIDATE' ? 'On registering, you can' : 'Find top talent instantly'}
              </h2>
              <div className="space-y-6">
                {role === 'CANDIDATE' ? (
                  <>
                    <div className="flex items-start gap-4"><svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg><p className="text-sm font-medium text-slate-300">Build your profile and let top recruiters find you instantly</p></div>
                    <div className="flex items-start gap-4"><svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg><p className="text-sm font-medium text-slate-300">Get premium job postings delivered right to your email</p></div>
                    <div className="flex items-start gap-4"><svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg><p className="text-sm font-medium text-slate-300">Find a job and accelerate your career trajectory</p></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-4"><svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg><p className="text-sm font-medium text-slate-300">Post jobs and reach thousands of qualified professionals</p></div>
                    <div className="flex items-start gap-4"><svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg><p className="text-sm font-medium text-slate-300">Manage applicants seamlessly with advanced tracking tools</p></div>
                  </>
                )}
              </div>
            </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-7/12 p-10 lg:p-12">
          <h1 className="text-3xl font-extrabold tracking-tighter text-white mb-2">Create Account</h1>
          <p className="text-sm text-slate-400 font-medium mb-6">Join India's premium talent network.</p>
          
          {/* ROLE SWITCH TOGGLE */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-700 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('CANDIDATE')}
              className={`py-2.5 text-xs font-bold rounded-lg transition-all ${role === 'CANDIDATE' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole('EMPLOYER')}
              className={`py-2.5 text-xs font-bold rounded-lg transition-all ${role === 'EMPLOYER' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Employer
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5 relative z-20">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                {role === 'CANDIDATE' ? 'Full Name *' : 'Company Name *'}
              </label>
              <input 
                type="text" 
                required 
                placeholder={role === 'CANDIDATE' ? 'e.g. John Doe' : 'e.g. Acme Corp'}
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email ID *</label>
              <input 
                type="email" 
                required 
                placeholder="name@example.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" 
              />
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Password *</label>
              <input 
                type="password" 
                required 
                placeholder="Create a strong password"
                value={formData.password}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" 
              />
              
              {/* Auto-suggest / Helper Tooltip on Focus */}
              {isPasswordFocused && (
                <div className="absolute left-0 top-[calc(100%+6px)] w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl shadow-xl z-50 text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-200">
                  <p className="font-bold text-white">Password requirements:</p>
                  <p className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{/[A-Z]/.test(formData.password) ? '✓' : '•'}</span> At least one uppercase letter (A-Z)
                  </p>
                  <p className={`flex items-center gap-2 ${/[a-z]/.test(formData.password) ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{/[a-z]/.test(formData.password) ? '✓' : '•'}</span> At least one lowercase letter (a-z)
                  </p>
                  <p className={`flex items-center gap-2 ${/\d/.test(formData.password) ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{/\d/.test(formData.password) ? '✓' : '•'}</span> At least one number (0-9)
                  </p>
                  <p className={`flex items-center gap-2 ${/[\W_]/.test(formData.password) ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{/[\W_]/.test(formData.password) ? '✓' : '•'}</span> At least one special character (!@#$%^&*)
                  </p>
                  <p className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{formData.password.length >= 8 ? '✓' : '•'}</span> Minimum 8 characters
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Mobile Number *</label>
              <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-fuchsia-500 transition-colors">
                <div className="bg-slate-800 px-4 py-3 text-sm font-bold text-slate-400 border-r border-slate-700 flex items-center justify-center">+91</div>
                <input 
                  type="tel" 
                  required 
                  placeholder="Enter mobile number"
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})} 
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none" 
                />
              </div>
            </div>

            {role === 'CANDIDATE' && (
              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Work Status *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({...formData, workStatus: 'experienced'})} className={`p-4 rounded-xl border text-left transition-colors duration-200 ${formData.workStatus === 'experienced' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}>
                    <div className="flex justify-between items-center mb-1"><span className={`font-bold text-sm ${formData.workStatus === 'experienced' ? 'text-white' : 'text-slate-300'}`}>I'm experienced</span><span className="text-lg">💼</span></div>
                    <span className="text-[10px] text-slate-400 font-medium leading-tight block mt-2">I have work experience</span>
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, workStatus: 'fresher'})} className={`p-4 rounded-xl border text-left transition-colors duration-200 ${formData.workStatus === 'fresher' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}>
                    <div className="flex justify-between items-center mb-1"><span className={`font-bold text-sm ${formData.workStatus === 'fresher' ? 'text-white' : 'text-slate-300'}`}>I'm a fresher</span><span className="text-lg">🎓</span></div>
                    <span className="text-[10px] text-slate-400 font-medium leading-tight block mt-2">I am a student</span>
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-4">{error}</p>}

            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>

            <button 
              type="submit" 
              disabled={status === 'loading'} 
              className={`relative overflow-hidden flex h-14 w-full items-center justify-center rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 mt-8 ${
                status === 'loading' 
                  ? 'cursor-wait bg-slate-800 text-slate-400 border border-slate-700 shadow-inner' 
                  : 'bg-white text-black hover:bg-slate-200 border-transparent'
              }`}
            >
              {status === 'loading' && (
                <div 
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  style={{ animation: 'shimmer 1.5s infinite' }}
                ></div>
              )}

              <div className="relative z-10 flex items-center gap-3">
                {status === 'loading' ? (
                  <span className="tracking-[0.2em]">REGISTERING...</span>
                ) : (
                  'REGISTER NOW'
                )}
              </div>
            </button>
          </form>
          
          <p className="text-center text-xs font-medium text-slate-500 mt-8 relative z-20">
            Already have an account? <Link href="/login" className="text-white font-bold hover:underline cursor-pointer transition">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}