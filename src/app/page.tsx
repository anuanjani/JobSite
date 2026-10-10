'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function HomePage() {
  const trendingCategories = [
    { title: 'Software Engineering', jobs: '12,450 Jobs', icon: '💻' },
    { title: 'Data Science & AI', jobs: '8,230 Jobs', icon: '🧠' },
    { title: 'Product Design', jobs: '5,100 Jobs', icon: '🎨' },
    { title: 'Marketing & Sales', jobs: '3,800 Jobs', icon: '📈' }
  ];

  return (
    <div className="relative pb-20">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 blur-[120px] rounded-full pointer-events-none fixed z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none fixed z-0"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
        
        {/* OUR REUSABLE NAVBAR! */}
        <Navbar />

        {/* HERO SECTION */}
        <div className="flex flex-col items-center text-center mt-12 mb-20 max-w-4xl mx-auto">
          <span className="text-fuchsia-400 font-bold tracking-widest text-sm uppercase mb-6 bg-fuchsia-500/10 px-4 py-1.5 rounded-full border border-fuchsia-500/20">
            The Future of Hiring
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-8 leading-[1.1]">
            Find your next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">dream role.</span>
          </h1>

          {/* HOME PAGE SEARCH BAR */}
          <div className="w-full rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-2 flex flex-col md:flex-row items-center gap-3 shadow-lg focus-within:border-slate-500 transition-colors">
            <span className="text-slate-400 pl-4 hidden md:block">🔍</span>
            <input 
              type="text" 
              placeholder="Job title, keywords, or company" 
              className="flex-1 bg-transparent outline-none text-sm text-slate-200 font-medium placeholder-slate-500 w-full p-3 md:p-0" 
            />
            <Link href="/jobs" className="bg-white text-black px-10 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition w-full md:w-auto text-center shrink-0 block">
              Search
            </Link>
          </div>
        </div>

        {/* TRENDING JOB CATEGORIES */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-extrabold tracking-tighter text-white mb-8 text-center">Trending Job Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCategories.map((category, index) => (
              <Link href="/jobs" key={index} className="group p-6 rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:border-fuchsia-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(192,38,211,0.15)] flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-fuchsia-400 transition-colors">{category.title}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{category.jobs}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}