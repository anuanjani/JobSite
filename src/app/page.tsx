'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

export default function HomePage() {
  const router = useRouter();
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTitle) query.append('title', searchTitle);
    if (searchLocation) query.append('location', searchLocation);
    router.push(`/jobs?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-pink-500/30 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-fuchsia-600/15 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Reusable Header */}
      <Header accentColor="pink" />

      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-20 relative z-10 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700/80 text-xs font-bold text-pink-400 mb-6 uppercase tracking-widest shadow-sm">
          The Future of Hiring
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white max-w-4xl mb-6 leading-[1.1]">
          Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">breakthrough role.</span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-400 max-w-xl mb-12 font-medium">
          Connect directly with top employers, showcase your verified skills, and accelerate your career trajectory.
        </p>

        {/* Search Bar Box */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 flex flex-col md:flex-row gap-2 shadow-2xl">
          <div className="flex-1 flex items-center px-4 py-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
            <svg className="w-5 h-5 text-slate-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Job title, skills, or company" 
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" 
            />
          </div>

          <div className="flex-1 flex items-center px-4 py-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
            <svg className="w-5 h-5 text-slate-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Location or remote" 
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" 
            />
          </div>

          <button type="submit" className="bg-white hover:bg-slate-200 text-slate-950 font-extrabold px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition cursor-pointer shadow-md">
            Search Jobs
          </button>
        </form>
      </div>
    </div>
  );
}