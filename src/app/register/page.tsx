'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    workStatus: 'experienced'
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify({ name: formData.name, email: formData.email }));
        setStatus('success');
        router.push('/candidate/dashboard');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
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

      <div className="absolute top-0 left-0 w-full p-8 flex items-center z-20">
        <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">ROLEMATCH<span className="text-fuchsia-500">.</span></Link>
      </div>

      <div className="group w-full max-w-5xl rounded-[2rem] bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl">
        
        <Link href="/" className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-fuchsia-400 transition-all duration-300 opacity-0 group-hover:opacity-100 text-slate-400 z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </Link>
        
        <div className="w-full md:w-5/12 bg-slate-900/50 p-10 lg:p-12 flex flex-col border-r border-slate-700/50">
            <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl mb-10 shadow-inner">🚀</div>
            <h2 className="text-3xl font-extrabold tracking-tighter text-white mb-8">On registering, you can</h2>
            
            <div className="space-y-6">
              {[
                'Build your profile and let top recruiters find you instantly',
                'Get premium job postings delivered right to your email',
                'Find a job and accelerate your career trajectory'
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  <p className="text-sm font-medium text-slate-300">{text}</p>
                </div>
              ))}
            </div>
        </div>

        <div className="w-full md:w-7/12 p-10 lg:p-12">
          <h1 className="text-3xl font-extrabold tracking-tighter text-white mb-2">Create Account</h1>
          <p className="text-sm text-slate-400 font-medium mb-8">Join India's premium talent network.</p>
          
          <form onSubmit={handleRegister} className="space-y-5 relative z-20">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name *</label>
              <input type="text" placeholder="What is your name?" required onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-600" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email ID *</label>
              <input type="email" placeholder="Tell us your Email ID" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-600" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Password *</label>
              <input type="password" placeholder="(Minimum 6 characters)" required minLength={6} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-600" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Mobile Number *</label>
              <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-fuchsia-500 transition-colors">
                <div className="bg-slate-800 px-4 py-3 text-sm font-bold text-slate-400 border-r border-slate-700 flex items-center justify-center">+91</div>
                <input type="tel" placeholder="Enter your mobile number" required onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Work Status *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button type="button" onClick={() => setFormData({...formData, workStatus: 'experienced'})} className={`p-4 rounded-xl border text-left transition-colors duration-200 ${formData.workStatus === 'experienced' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold text-sm ${formData.workStatus === 'experienced' ? 'text-white' : 'text-slate-300'}`}>I'm experienced</span>
                    <span className="text-lg">💼</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium leading-tight block mt-2">I have work experience (excluding internships)</span>
                </button>

                <button type="button" onClick={() => setFormData({...formData, workStatus: 'fresher'})} className={`p-4 rounded-xl border text-left transition-colors duration-200 ${formData.workStatus === 'fresher' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold text-sm ${formData.workStatus === 'fresher' ? 'text-white' : 'text-slate-300'}`}>I'm a fresher</span>
                    <span className="text-lg">🎓</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium leading-tight block mt-2">I am a student/ Haven't worked after graduation</span>
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-4">{error}</p>}

            {/* BULLETPROOF ANIMATED BUTTON */}
            <button 
              type="submit" 
              disabled={status === 'loading'} 
              className={`relative overflow-hidden flex items-center justify-center w-full font-bold text-xs uppercase tracking-widest py-4 rounded-xl mt-8 transition-colors duration-300 ${
                status === 'loading' 
                  ? 'text-white shadow-[0_0_25px_rgba(192,38,211,0.4)] bg-slate-900 border border-slate-700' 
                  : 'bg-white text-black hover:bg-slate-200 border border-transparent'
              }`}
            >
              {/* React Inline Style directly powers the 4-second width expansion */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 z-0"
                style={{
                  width: status === 'loading' ? '100%' : '0%',
                  transition: 'width 4000ms ease-out'
                }}
              ></div>

              <div className="relative z-10 flex items-center gap-3">
                {status === 'loading' ? (
                  <>
                    <div className="flex gap-1 items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="tracking-[0.2em] drop-shadow-md">Registering</span>
                  </>
                ) : (
                  'Register Now'
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