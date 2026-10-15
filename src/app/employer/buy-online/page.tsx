'use client';
import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';

export default function BuyOnlinePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/30">
      
      {/* Dark Navbar wrapper so it still matches the root site identity, but the page content below is light */}
      <div className="bg-[#0B0F19]">
        <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8"><Navbar /></div>
      </div>

      <main className="w-full pb-20">
        
        {/* ================= HERO PRICING (SMB) ================= */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-8 pt-16 pb-20 text-center">
          <p className="text-blue-600 font-extrabold text-sm tracking-wider uppercase mb-3">Exclusive Packages for Small Businesses & Startups</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">Post a job and get instant CV recommendations</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 30 Days Plan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-left hover:border-blue-300 transition-all relative shadow-xl hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-xl rounded-tr-3xl shadow-sm">Newly Launched</div>
              <h3 className="text-blue-600 font-extrabold text-lg mb-2">30 Days Plan</h3>
              <div className="text-4xl font-black text-slate-900 mb-6">₹3,500</div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Key Features</p>
              <ul className="space-y-4 mb-8 text-sm text-slate-700">
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg><b>2 SMB Job postings</b></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>Get <b>unlimited applies</b></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg><b>Instant CV recommendations</b> from database, while applies follow</li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg><b>Job Promotion included</b></li>
              </ul>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-blue-500/20">Buy now</button>
              <p className="text-[10px] text-slate-400 mt-4 text-center">*GST as applicable</p>
            </div>

            {/* 45 Days Plan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-left hover:border-blue-300 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              <h3 className="text-blue-600 font-extrabold text-lg mb-2">45 Days Plan</h3>
              <div className="text-4xl font-black text-slate-900 mb-6">₹4,500</div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Key Features</p>
              <ul className="space-y-4 mb-8 text-sm text-slate-700">
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg><b>3 SMB Job postings</b></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>Get <b>unlimited applies</b></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg><b>Instant CV recommendations</b> from database</li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg><b>Job Promotion included</b></li>
              </ul>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-blue-500/20">Buy now</button>
              <p className="text-[10px] text-slate-400 mt-4 text-center">*GST as applicable</p>
            </div>

            {/* 60 Days Plan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-left hover:border-blue-300 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              <h3 className="text-blue-600 font-extrabold text-lg mb-2">60 Days Plan</h3>
              <div className="text-4xl font-black text-slate-900 mb-6">₹6,000</div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Key Features</p>
              <ul className="space-y-4 mb-8 text-sm text-slate-700">
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg><b>5 SMB Job postings</b></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>Get <b>unlimited applies</b></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg><b>Instant CV recommendations</b> from database</li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg><b>Job Promotion included</b></li>
              </ul>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-blue-500/20">Buy now</button>
              <p className="text-[10px] text-slate-400 mt-4 text-center">*GST as applicable</p>
            </div>
          </div>
        </section>

        {/* ================= SECONDARY PRICING (CORPORATE & STARTER) ================= */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Corporates Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
              <p className="text-blue-600 font-extrabold text-sm tracking-wider uppercase mb-2">For Corporates</p>
              <h2 className="text-2xl font-black text-slate-900 mb-8">Job posting & candidate database solutions</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Job Posting</h4>
                    <div className="text-blue-600 font-extrabold mb-1">2 Hot vacancy</div>
                    <div className="text-3xl font-black text-slate-900 mb-6">₹3,300</div>
                    <ul className="space-y-3 text-sm text-slate-600 mb-8 font-medium">
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>Detailed job description</li>
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>3 job locations</li>
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>Unlimited applies</li>
                    </ul>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">Buy now</button>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">RESDEX</h4>
                    <div className="text-3xl font-black text-slate-900 mb-1">Custom price</div>
                    <div className="text-sm text-slate-500 font-medium mb-6">Based on your plan</div>
                    <ul className="space-y-3 text-sm text-slate-600 mb-8 font-medium">
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>CV views as per plan</li>
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>Unlimited search results</li>
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>20+ advanced filters</li>
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>Download CVs in bulk</li>
                    </ul>
                  </div>
                  <button className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2.5 rounded-xl transition-colors">Contact sales</button>
                </div>
              </div>
            </div>

            {/* Starters Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
              <div>
                <p className="text-emerald-500 font-extrabold text-sm tracking-wider uppercase mb-2">For Starters</p>
                <h2 className="text-2xl font-black text-slate-900 mb-8">Ideal for first-time hirers</h2>
                <div className="bg-emerald-50/50 rounded-2xl p-8 border border-emerald-100 text-center mb-8">
                  <div className="text-4xl font-black text-emerald-600 mb-8">Free job posting</div>
                  <ul className="space-y-4 text-sm text-slate-700 font-medium text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-3"><svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>Upto 250 character job description</li>
                    <li className="flex items-center gap-3"><svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>1 job location</li>
                    <li className="flex items-center gap-3"><svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>50 applies</li>
                  </ul>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-md shadow-blue-500/20">Post a free job</button>
            </div>

          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="bg-white py-20 border-y border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Here's why recruiters trust us</h2>
            <p className="text-slate-500 mb-12 text-lg">Testimonials from valued clients who've elevated their hiring with RoleMatch</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-left shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed italic mb-8">"As a Core Engineering Employer, I feel confident of having relevant, available and genuine Resumes through RESDEX. Its Search Engine Capabilities and parsing techniques are unmatched."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 font-black flex items-center justify-center text-blue-600 shadow-sm">IS</div>
                  <div><h4 className="font-bold text-slate-900 text-sm">Kreeti Mathur</h4><p className="text-[11px] text-slate-500 font-medium">Human Resources, ISGEC</p></div>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-left shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed italic mb-8">"RoleMatch has been one of our most reliable sources for recruitment with a very efficient team who would go out of their way to make sure that requests are taken care of immediately."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 font-black flex items-center justify-center text-emerald-600 shadow-sm">IR</div>
                  <div><h4 className="font-bold text-slate-900 text-sm">Naveen Malhotra</h4><p className="text-[11px] text-slate-500 font-medium">Senior Manager Talent, Group IRIS</p></div>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-left shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed italic mb-8">"RoleMatch has a strong data base of profiles. It has given vast accessibility to most of the job seekers in India and the relevancy of the profiles are undoubtedly good."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 font-black flex items-center justify-center text-purple-600 shadow-sm">NT</div>
                  <div><h4 className="font-bold text-slate-900 text-sm">Padma Thyagarajan</h4><p className="text-[11px] text-slate-500 font-medium">Head - HR, Niteo</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
