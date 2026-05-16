import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import { jobsApi, authApi } from '../../services/api';

const TABS = ['All', 'Active', 'Closed', 'Draft'];

export default function MyJobPosts() {
  const [activeTab, setActiveTab] = useState('All');
  const [jobs, setJobs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allJobs, me] = await Promise.all([
          jobsApi.getMine(),
          authApi.getMe()
        ]);
        // Filter jobs by current company/user if needed, 
        // though backend should ideally return only user's jobs for recruiters
        setJobs(allJobs);
        setUser(me);
      } catch (error) {
        console.error("Error fetching job posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = jobs.filter(p => {
    const status = p.moderationStatus === 'Flagged' ? 'Flagged' : p.moderationStatus === 'Closed' ? 'Closed' : 'Active';
    if (activeTab === 'All') return true;
    if (activeTab === 'Draft') return false;
    return status === activeTab;
  });

  if (loading) return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading job posts...</div>;

  return (
    <div className="ats-root">
      <Sidebar role="recruiter" />
      <div className="ats-main">
        <TopBar userName={user?.name || 'Recruiter'} role="Recruiter" />
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', margin: 0 }}>My Job Posts</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {TABS.map(t => <button key={t} onClick={() => setActiveTab(t)} className={`ats-tab${activeTab === t ? ' active' : ''}`}>{t}</button>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
            {filtered.map(p => (
              <div key={p.id} className="ats-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-ats-text)', margin: 0 }}>{p.title}</h3>
                  <StatusBadge status={p.moderationStatus === 'Flagged' ? 'Flagged' : p.moderationStatus === 'Closed' ? 'Closed' : 'Active'} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--color-ats-muted)' }}>
                  <span>{p.type}</span>
                  <span>·</span>
                  <span>Posted: {new Date(p.posted).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.625rem', borderTop: '1px solid var(--color-ats-border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-ats-text)', fontWeight: 600 }}>{p._count?.applications ?? 0} Applicants</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/recruiter/my-posts/${p.id}/applicants`} className="ats-btn-primary" style={{ textDecoration: 'none', padding: '0.4rem 0.875rem', fontSize: '0.8rem', display: 'inline-block', borderRadius: '0.5rem' }}>
                      View Applicants
                    </Link>
                    <button className="ats-btn-ghost" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>Edit / Close</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
