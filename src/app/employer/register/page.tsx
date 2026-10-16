'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EmployerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'mobile' | 'otp' | 'existing_modal' | 'basic_details' | 'company_details' | 'terms_modal'>('mobile');
  const [mobile, setMobile] = useState('');
  const [existingCompany, setExistingCompany] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 6-Digit OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    accountType: 'company',
    fullName: '',
    email: '',
    password: '',
    hiringFor: 'your company',
    companyName: '',
    industry: 'Technology',
    employeeRange: '50-200',
    designation: '',
    pincode: '',
    address: ''
  });
  const [registerError, setRegisterError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      alert('Please enter a valid mobile number.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('otp');
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (enteredOtp !== '000000') {
      setOtpError('Invalid OTP. Use dummy OTP: 000000');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/employer/check-mobile?mobile=${encodeURIComponent(mobile)}`);
      const data = await res.json();

      if (data.exists) {
        setExistingCompany(data.companyName || 'Rani Educomp LLP');
        setStep('existing_modal');
      } else {
        setStep('basic_details');
      }
    } catch (err) {
      setStep('basic_details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTermsAndRegister = async () => {
    setLoading(true);
    setRegisterError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          mobileNumber: mobile,
          role: 'EMPLOYER',
          accountType: formData.accountType,
          companyName: formData.companyName,
          industry: formData.industry,
          designation: formData.designation,
          address: formData.address,
          termsAccepted: true,
          termsAcceptedAt: new Date().toISOString()
        })
      });
      const data = await res.json();

      if (res.ok || (data.error && data.error.includes('already exists'))) {
        localStorage.setItem('user', JSON.stringify({ name: formData.companyName || formData.fullName, email: formData.email, role: 'EMPLOYER' }));
        router.push('/employer/dashboard');
      } else {
        setRegisterError(data.error || 'Registration failed.');
        setStep('company_details');
      }
    } catch (err) {
      localStorage.setItem('user', JSON.stringify({ name: formData.companyName || 'TechCorp', email: formData.email || 'recruiter@company.com', role: 'EMPLOYER' }));
      router.push('/employer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 flex items-center justify-center relative p-6">
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="absolute top-0 left-0 w-full p-8 flex items-center z-20">
        <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
          ROLEMATCH<span className="text-indigo-500">.</span>
        </Link>
      </div>

      {/* Expanded Card Size matching the red box */}
      <div className="group w-full max-w-6xl h-[620px] rounded-[2.5rem] bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl">
        
        {/* Floating Close Button */}
        <Link href="/" className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-indigo-400 transition-all text-slate-400 z-50 shadow-md">
          ✕
        </Link>

        {/* Left Hero Section */}
        <div className="w-full md:w-5/12 bg-slate-900/50 p-12 lg:p-16 flex flex-col justify-center border-r border-slate-700/50">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-white mb-6 leading-tight">
            Find & hire the right talent with us
          </h1>
          <p className="text-sm text-slate-400 font-medium mb-10">
            Trusted by 9 Cr+ candidates | 5 Lakh+ employers
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3 overflow-hidden">
              <div className="inline-block h-10 w-10 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center font-bold text-xs text-white">JD</div>
              <div className="inline-block h-10 w-10 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center font-bold text-xs text-white">AS</div>
              <div className="inline-block h-10 w-10 rounded-full bg-pink-500 border-2 border-slate-900 flex items-center justify-center font-bold text-xs text-white">MK</div>
              <div className="inline-block h-10 w-10 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center font-bold text-xs text-white">TS</div>
            </div>
            <span className="text-xs text-slate-400 font-medium ml-2">Join thousands of recruiters</span>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-7/12 p-12 lg:p-16 flex flex-col justify-center bg-slate-900/20 relative">
          
          {step === 'mobile' && (
            <>
              <h2 className="text-2xl font-extrabold tracking-tight text-white mb-6">Continue with mobile</h2>
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mobile number</label>
                  <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
                    <div className="bg-slate-800 px-4 py-3.5 text-sm font-bold text-slate-300 border-r border-slate-700 flex items-center gap-1">+91</div>
                    <input 
                      type="tel" 
                      required 
                      placeholder="Enter mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white outline-none font-medium" 
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition cursor-pointer">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-extrabold tracking-tight text-white mb-2">Enter the OTP sent to SMS on</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-indigo-400">+91 {mobile}</span>
                  <button onClick={() => setStep('mobile')} className="text-xs text-slate-400 underline hover:text-white">Edit</button>
                </div>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex gap-3 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-12 h-14 bg-slate-900 border border-slate-700 rounded-xl text-center text-xl font-extrabold text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  ))}
                </div>
                {otpError && <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{otpError}</p>}
                <p className="text-[11px] text-slate-500 italic">Hint: Use OTP 000000</p>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition cursor-pointer">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            </>
          )}

          {/* STEP 1: BASIC DETAILS */}
          {step === 'basic_details' && (
            <>
              <div className="mb-4 border-b border-slate-700/50 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Step 1 of 2</span>
                  <h2 className="text-xl font-extrabold tracking-tight text-white">Basic details</h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">+91 {mobile}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">You're creating account as</label>
                  <div className="flex gap-6 text-xs font-bold text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="accountType" checked={formData.accountType === 'company'} onChange={() => setFormData({...formData, accountType: 'company'})} className="accent-indigo-600" />
                      Company/business
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="accountType" checked={formData.accountType === 'individual'} onChange={() => setFormData({...formData, accountType: 'individual'})} className="accent-indigo-600" />
                      Individual/proprietor
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Full name *</label>
                  <input type="text" required placeholder="Name as per PAN" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Official email ID *</label>
                  <input type="email" required placeholder="Enter email ID" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Create password *</label>
                  <input type="password" required placeholder="Enter new password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                </div>

                <button 
                  type="button" 
                  onClick={() => {
                    if (!formData.fullName || !formData.email || !formData.password) {
                      alert('Please fill in all basic details.');
                      return;
                    }
                    setStep('company_details');
                  }} 
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition cursor-pointer mt-2"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* STEP 2: COMPANY DETAILS */}
          {step === 'company_details' && (
            <>
              <div className="mb-4 border-b border-slate-700/50 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Step 2 of 2</span>
                  <h2 className="text-xl font-extrabold tracking-tight text-white">Company details</h2>
                </div>
                <button onClick={() => setStep('basic_details')} className="text-xs text-slate-400 hover:text-white underline">Back</button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Hiring for</label>
                  <div className="flex gap-6 text-xs font-bold text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="hiringFor" checked={formData.hiringFor === 'your company'} onChange={() => setFormData({...formData, hiringFor: 'your company'})} className="accent-indigo-600" />
                      Your company
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="hiringFor" checked={formData.hiringFor === 'consultancy'} onChange={() => setFormData({...formData, hiringFor: 'consultancy'})} className="accent-indigo-600" />
                      A consultancy
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Company name *</label>
                  <input type="text" required placeholder="Enter company name" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Select industry</label>
                  <select value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500">
                    <option value="Technology">Technology / Software</option>
                    <option value="Finance">Banking & Finance</option>
                    <option value="Healthcare">Healthcare & Biotech</option>
                    <option value="E-Commerce">E-Commerce & Retail</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Designation *</label>
                    <input type="text" required placeholder="Your designation" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Pin code</label>
                    <input type="text" placeholder="Postal code" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Company address</label>
                  <textarea rows={2} placeholder="Enter company address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 resize-none"></textarea>
                </div>

                <button 
                  type="button" 
                  onClick={() => {
                    if (!formData.companyName || !formData.designation) {
                      alert('Please fill in required company details.');
                      return;
                    }
                    setStep('terms_modal');
                  }} 
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition cursor-pointer mt-2"
                >
                  Complete Registration
                </button>
              </div>
            </>
          )}

        </div>

      </div>

      {/* TERMS & CONDITIONS MODAL OVERLAY */}
      {step === 'terms_modal' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[999999]">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in duration-200">
            <h3 className="text-2xl font-extrabold text-white mb-2">Terms & Conditions</h3>
            <p className="text-xs text-slate-400 mb-4">Please review and accept our terms to complete your recruiter registration.</p>
            
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 overflow-y-auto text-xs text-slate-300 space-y-4 mb-6 flex-1 shadow-inner">
              <p className="leading-relaxed">
                We thank you for subscribing to Rolematch.com. For uninterrupted services, a superior user experience, and maintaining data security, it is important that there is a strict adherence to the Terms and conditions that govern usage of our services.
              </p>
              <div>
                <strong className="text-indigo-400 block mb-1">1. Sharing of Rolematch.com account</strong>
                <p>User cannot share their account login and password details with any individual. The same will be treated as a violation of our Terms & Conditions.</p>
              </div>
              <div>
                <strong className="text-indigo-400 block mb-1">2. Sending NVite to non-relevant candidates</strong>
                <p>Users should refrain from sending non-recruitment NVites to users outside the target audience. Violating this rule may result in your account being flagged as 'spam'.</p>
              </div>
              <div>
                <strong className="text-indigo-400 block mb-1">3. Mass download of Resumes</strong>
                <p>The facility to download resumes is provided as an aid to user's recruitment activities only. Any mass download of Resumes from the database using any kind of software is strictly prohibited.</p>
              </div>
              <div>
                <strong className="text-indigo-400 block mb-1">4. Job postings for purposes other than Recruitment</strong>
                <p>"Rolematch Job Postings" have the sole purpose of helping recruiters find candidates with more relevance and high intent.</p>
              </div>
              <div>
                <strong className="text-indigo-400 block mb-1">5. Asking Jobseekers for money</strong>
                <p>There should not be any activity or reference for money from the jobseekers for any direct/indirect favor or otherwise.</p>
              </div>
            </div>

            {registerError && <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">{registerError}</p>}

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setStep('company_details')}
                className="w-1/3 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-widest transition cursor-pointer"
              >
                Decline
              </button>
              <button 
                type="button"
                disabled={loading}
                onClick={handleAcceptTermsAndRegister}
                className="w-2/3 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                {loading ? 'Saving Compliance...' : 'Accept & Complete Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}