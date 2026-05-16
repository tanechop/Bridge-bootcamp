import { Link } from 'react-router-dom';
import { Building2, MapPin, Clock } from 'lucide-react';
import { jobsApi } from '../services/api';
import React, { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobsApi.getAll();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 max-w-7xl mx-auto bg-surface">
      {/* Profile Summary */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div>
            <span className="text-[10px] text-on-surface-variant tracking-[0.2em] uppercase mb-2 block font-bold">CANDIDATE DOSSIER</span>
            <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-2">Alexander Thorne</h1>
            <p className="text-lg text-secondary max-w-lg">Senior Editorial Strategist & Content Designer based in New York. Specializing in high-growth tech narratives.</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">Open to Work</span>
            <span className="bg-surface-container-high text-on-surface-variant px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">Product Design</span>
          </div>
        </div>
      </section>



      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8 editorial-shadow">
            <h3 className="text-lg font-bold mb-6 text-on-surface">Application Pipeline</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-surface-tint"></div>
                  <span className="text-sm font-medium">Interviews</span>
                </div>
                <span className="font-bold text-surface-tint">04</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></div>
                  <span className="text-sm font-medium">Offer Pending</span>
                </div>
                <span className="font-bold">01</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                  <span className="text-sm font-medium">Applied</span>
                </div>
                <span className="font-bold">12</span>
              </div>
            </div>
          </div>

          
        </div>

        {/* Right Column: Jobs */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-on-surface">Curated Opportunities</h2>
            <button className="text-surface-tint text-xs font-bold tracking-widest uppercase hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-secondary">Loading opportunities...</div>
            ) : jobs.length > 0 ? jobs.map((job) => (
              <Link to={`/job/${job.id}`} key={job.id} className="block group bg-surface-container-lowest p-6 rounded-xl hover:shadow-lg transition-all border border-transparent hover:border-surface-tint/10">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <Building2 className="text-secondary" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-lg font-bold text-on-surface group-hover:text-surface-tint transition-colors">{job.title}</h4>
                      <span className="text-lg font-bold text-on-surface">{job.salary}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                      <div className="flex items-center gap-1 text-secondary text-sm">
                        <Building2 size={14} /> {job.company}
                      </div>
                      <div className="flex items-center gap-1 text-secondary text-sm">
                        <MapPin size={14} /> {job.location}
                      </div>
                      <div className="flex items-center gap-1 text-secondary text-sm">
                        <Clock size={14} /> {job.posted}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(job.skills || []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold tracking-widest uppercase rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="p-12 text-center text-secondary">No opportunities found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
