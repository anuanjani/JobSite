'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

// Massive Embedded JSON Dataset for Jobs in India/Remote
const RAW_JOB_DATA = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Google', location: 'Bengaluru', type: 'Hybrid', salary: '₹ 35-50 Lacs PA', rating: '4.8', tags: ['React', 'Next.js', 'TypeScript', 'Redux'], posted: 'Just Now', logo: 'G' },
  { id: 2, title: 'Software Engineer II (Backend)', company: 'Amazon', location: 'Hyderabad', type: 'In-Office', salary: '₹ 28-45 Lacs PA', rating: '4.2', tags: ['Java', 'AWS', 'Microservices'], posted: '2 Hours Ago', logo: 'A' },
  { id: 3, title: 'Full Stack Developer', company: 'TechCorp Solutions', location: 'Remote', type: 'Remote', salary: '₹ 15-25 Lacs PA', rating: '4.1', tags: ['Node.js', 'React', 'MongoDB'], posted: '1 Day Ago', logo: 'T' },
  { id: 4, title: 'Data Scientist', company: 'Microsoft', location: 'Bengaluru', type: 'Hybrid', salary: '₹ 40-60 Lacs PA', rating: '4.7', tags: ['Python', 'Machine Learning', 'PyTorch'], posted: '3 Days Ago', logo: 'M' },
  { id: 5, title: 'SDE-1 (Fresher)', company: 'Flipkart', location: 'Bengaluru', type: 'In-Office', salary: '₹ 18-24 Lacs PA', rating: '4.3', tags: ['Data Structures', 'Java', 'Algorithms'], posted: '4 Hours Ago', logo: 'F' },
  { id: 6, title: 'Cloud Architect', company: 'IBM', location: 'Pune', type: 'Hybrid', salary: '₹ 30-55 Lacs PA', rating: '4.0', tags: ['AWS', 'Azure', 'Kubernetes'], posted: '1 Week Ago', logo: 'I' },
  { id: 7, title: 'UI/UX Designer', company: 'Studio AI', location: 'Mumbai', type: 'Remote', salary: '₹ 12-18 Lacs PA', rating: '4.5', tags: ['Figma', 'Prototyping', 'Wireframing'], posted: '5 Hours Ago', logo: 'S' },
  { id: 8, title: 'DevOps Engineer', company: 'Accenture', location: 'Chennai', type: 'In-Office', salary: '₹ 14-22 Lacs PA', rating: '3.9', tags: ['Docker', 'Jenkins', 'CI/CD'], posted: '2 Days Ago', logo: 'A' },
  { id: 9, title: 'Product Manager', company: 'Atlassian', location: 'Remote', type: 'Remote', salary: '₹ 50-80 Lacs PA', rating: '4.9', tags: ['Agile', 'Jira', 'Strategy'], posted: 'Just Now', logo: 'A' },
  { id: 10, title: 'React Native Developer', company: 'Zomato', location: 'Gurugram', type: 'Hybrid', salary: '₹ 20-35 Lacs PA', rating: '4.4', tags: ['React Native', 'Mobile', 'JavaScript'], posted: '6 Days Ago', logo: 'Z' },
  { id: 11, title: 'Backend Developer (Python)', company: 'TCS', location: 'Noida', type: 'In-Office', salary: '₹ 8-15 Lacs PA', rating: '3.8', tags: ['Python', 'Django', 'SQL'], posted: '2 Weeks Ago', logo: 'T' },
  { id: 12, title: 'Machine Learning Engineer', company: 'Infosys', location: 'Bengaluru', type: 'Hybrid', salary: '₹ 12-20 Lacs PA', rating: '3.7', tags: ['NLP', 'TensorFlow', 'Python'], posted: '1 Day Ago', logo: 'I' }
];

// Extract unique terms for autocomplete
const SUGGESTED_JOBS = Array.from(new Set(RAW_JOB_DATA.flatMap(job => [job.title, job.company, ...job.tags])));
const SUGGESTED_LOCATIONS = Array.from(new Set(RAW_JOB_DATA.map(job => job.location)));

export default function JobsPage() {
  // Filter States
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  
  // Search Autocomplete States
  const [jobQuery, setJobQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Active Displayed Jobs
  const [displayedJobs, setDisplayedJobs] = useState(RAW_JOB_DATA);

  // Refs for clicking outside
  const jobSearchRef = useRef<HTMLDivElement>(null);
  const locationSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (jobSearchRef.current && !jobSearchRef.current.contains(event.target as Node)) setShowJobSuggestions(false);
      if (locationSearchRef.current && !locationSearchRef.current.contains(event.target as Node)) setShowLocationSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Real-time Filter Logic ---
  useEffect(() => {
    let filtered = RAW_JOB_DATA;

    if (selectedWorkModes.length > 0) {
      filtered = filtered.filter(job => selectedWorkModes.includes(job.type));
    }
    if (jobQuery.trim() !== '') {
      const q = jobQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(q) || 
        job.company.toLowerCase().includes(q) || 
        job.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (locationQuery.trim() !== '') {
      filtered = filtered.filter(job => job.location.toLowerCase().includes(locationQuery.toLowerCase()));
    }
    setDisplayedJobs(filtered);
  }, [selectedWorkModes, jobQuery, locationQuery]);

  const toggleWorkMode = (mode: string) => setSelectedWorkModes(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]);
  const toggleExperience = (exp: string) => setSelectedExperiences(prev => prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]);
  const clearFilters = () => { 
    setSelectedWorkModes([]); 
    setSelectedExperiences([]); 
    setJobQuery('');
    setLocationQuery('');
  };

  // --- Autocomplete Logic ---
  const handleJobQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setJobQuery(value);
    if (value.length >= 2) {
      const matches = SUGGESTED_JOBS.filter(job => job.toLowerCase().includes(value.toLowerCase())).slice(0, 8);
      setJobSuggestions(matches);
      setShowJobSuggestions(true);
    } else {
      setShowJobSuggestions(false);
    }
  };

  const handleLocationQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationQuery(value);
    if (value.length >= 2) {
      const matches = SUGGESTED_LOCATIONS.filter(loc => loc.toLowerCase().includes(value.toLowerCase())).slice(0, 8);
      setLocationSuggestions(matches);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  return (
    <div className="relative pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 blur-[120px] rounded-full pointer-events-none fixed z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none fixed z-0"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
        
        {/* OUR CLEAN REUSABLE NAVBAR! */}
        <Navbar />

        {/* PAGE HEADER & SMART SEARCH */}
        <div className="mb-10 max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-6">Find your next role.</h1>
          
          <div className="rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-2 flex flex-col md:flex-row items-center gap-3 shadow-lg focus-within:border-slate-500 transition-colors max-w-4xl relative z-40">
            
            <div className="relative flex-1 flex items-center w-full" ref={jobSearchRef}>
              <span className="text-slate-400 pl-4 pr-2 hidden md:block">🔍</span>
              <input 
                type="text" 
                value={jobQuery}
                onChange={handleJobQueryChange}
                placeholder="Job title, skills, or company" 
                className="w-full bg-transparent outline-none text-sm text-slate-200 font-medium placeholder-slate-500 p-3 md:p-0" 
                onFocus={() => jobQuery.length >= 2 && setShowJobSuggestions(true)}
              />
              {showJobSuggestions && jobSuggestions.length > 0 && (
                <div className="absolute top-[120%] left-0 w-[120%] bg-slate-800 border border-slate-600 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 py-2">
                  {jobSuggestions.map((job) => (
                    <div 
                      key={job} 
                      onClick={() => { setJobQuery(job); setShowJobSuggestions(false); }}
                      className="px-5 py-3 text-sm text-slate-300 font-medium hover:bg-slate-700 hover:text-fuchsia-400 cursor-pointer transition-colors"
                    >
                      {job}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-700 hidden md:block"></div>
            
            <div className="relative flex-1 flex items-center w-full" ref={locationSearchRef}>
              <span className="text-slate-400 pl-2 pr-2 hidden md:block">📍</span>
              <input 
                type="text" 
                value={locationQuery}
                onChange={handleLocationQueryChange}
                placeholder="Location" 
                className="w-full bg-transparent outline-none text-sm text-slate-200 font-medium placeholder-slate-500 p-3 md:p-0" 
                onFocus={() => locationQuery.length >= 2 && setShowLocationSuggestions(true)}
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-[120%] left-0 w-full bg-slate-800 border border-slate-600 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 py-2">
                  {locationSuggestions.map((loc) => (
                    <div 
                      key={loc} 
                      onClick={() => { setLocationQuery(loc); setShowLocationSuggestions(false); }}
                      className="px-5 py-3 text-sm text-slate-300 font-medium hover:bg-slate-700 hover:text-fuchsia-400 cursor-pointer transition-colors"
                    >
                      {loc}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="bg-white text-black px-10 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition w-full md:w-auto text-center shrink-0">Search</button>
          </div>
        </div>

        {/* MAIN LAYOUT: Filters + Job Board */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
          
          {/* LEFT SIDEBAR: Interactive Filters */}
          <aside className="xl:col-span-3 space-y-8">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[2rem] p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-6 flex justify-between">
                Filters
                <span onClick={clearFilters} className="text-fuchsia-400 cursor-pointer hover:text-fuchsia-300 transition">Clear</span>
              </h3>
              
              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-500 mb-4">WORK MODE</h4>
                <div className="space-y-3">
                  {['Remote', 'Hybrid', 'In-Office'].map(mode => (
                    <div key={mode} onClick={() => toggleWorkMode(mode)} className="flex items-center gap-3 cursor-pointer group select-none">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors duration-200 ${selectedWorkModes.includes(mode) ? 'bg-fuchsia-500 border-fuchsia-500' : 'border-slate-600 group-hover:border-fuchsia-500'}`}>
                        {selectedWorkModes.includes(mode) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm transition ${selectedWorkModes.includes(mode) ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'}`}>{mode}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-500 mb-4">EXPERIENCE</h4>
                <div className="space-y-3">
                  {['Fresher', '1-3 Years', '3-5 Years', '5+ Years'].map(exp => (
                    <div key={exp} onClick={() => toggleExperience(exp)} className="flex items-center gap-3 cursor-pointer group select-none">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors duration-200 ${selectedExperiences.includes(exp) ? 'bg-fuchsia-500 border-fuchsia-500' : 'border-slate-600 group-hover:border-fuchsia-500'}`}>
                        {selectedExperiences.includes(exp) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm transition ${selectedExperiences.includes(exp) ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'}`}>{exp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-4">SALARY RANGE</h4>
                <input type="range" className="w-full accent-fuchsia-500 cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-400 font-bold mt-2">
                  <span>0L</span>
                  <span>50L+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: Job Listings */}
          <main className="xl:col-span-9 flex flex-col gap-5">
            <div className="flex justify-between items-center mb-2 px-2">
              <p className="text-sm font-medium text-slate-400">Showing <strong className="text-white">{displayedJobs.length}</strong> jobs matching your criteria</p>
              <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer">
                <option>Sort by: Relevant</option>
                <option>Sort by: Date</option>
                <option>Sort by: Salary</option>
              </select>
            </div>

            {displayedJobs.length === 0 ? (
               <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-12 text-center">
                 <p className="text-4xl mb-4">🕵️‍♂️</p>
                 <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
                 <p className="text-sm text-slate-400">Try adjusting your search criteria or clearing filters.</p>
               </div>
            ) : (
              displayedJobs.map((job) => (
                <div key={job.id} className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 md:p-8 hover:bg-slate-800/80 hover:border-slate-600 transition cursor-pointer group relative overflow-hidden">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex gap-6 items-start">
                      <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-300 font-black text-2xl shrink-0 shadow-inner">
                        {job.logo}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-fuchsia-400 transition mb-2">{job.title}</h3>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400 font-medium">
                          <span className="text-slate-200">{job.company}</span>
                          <span className="flex items-center gap-1"><span className="text-yellow-500">★</span> {job.rating}</span>
                          <span className="flex items-center gap-1.5">📍 {job.location}</span>
                          <span className="flex items-center gap-1.5">💰 {job.salary}</span>
                          <span className="flex items-center gap-1.5">💼 {job.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="hidden md:block bg-slate-700 hover:bg-white hover:text-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition shrink-0">
                      Apply Now
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-6 pt-6 border-t border-slate-700/50 gap-4">
                    <div className="flex items-center flex-wrap gap-2">
                      {job.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold tracking-wider uppercase text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500">{job.posted}</span>
                  </div>
                </div>
              ))
            )}
            
            {displayedJobs.length > 0 && (
              <div className="mt-8 flex justify-center">
                 <button className="bg-transparent border border-slate-600 text-white hover:border-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition">
                   Load More Jobs
                 </button>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}