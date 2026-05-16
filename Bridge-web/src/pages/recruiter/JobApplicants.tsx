import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import { applicationsApi, jobsApi, authApi } from '../../services/api';

const TABS = ['All', 'Payment Validated', 'CV Uploaded', 'Shortlisted', 'Rejected'];

export default function JobApplicants() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [interests, setInterests] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, appsData, me] = await Promise.all([
          jobsApi.getById(Number(id)),
          applicationsApi.getByJob(Number(id)),
          authApi.getMe()
        ]);
        setJob(jobData);
        setApplicants(appsData);
        setUser(me);
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filtered = applicants.filter(a => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Payment Validated') return a.paymentStatus === 'Validated';
    if (activeTab === 'CV Uploaded') return a.cvStatus === 'Uploaded';
    if (activeTab === 'Shortlisted') return (interests[a.id] ?? a.recruiterInterest) === 'Shortlisted';
    if (activeTab === 'Rejected') return (interests[a.id] ?? a.recruiterInterest) === 'Rejected';
    return true;
  });

  const setInterest = (applicantId: number, val: string) => 
    setInterests(prev => ({ ...prev, [applicantId]: val }));

  if (loading) return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading applicants...</div>;

  return (
    <div className="ats-root">
      <Sidebar role="recruiter" />
      <div className="ats-main">
        <TopBar userName={user?.name || 'Recruiter'} role="Recruiter" />
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/recruiter/my-posts" style={{ fontSize: '0.8rem', color: 'var(--color-ats-accent)', textDecoration: 'none' }}>← My Job Posts</Link>
            <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', margin: '0.5rem 0 0.25rem' }}>
              {job?.title || 'Loading...'}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', margin: 0 }}>{job?.company} · {applicants.length} Applicants</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {TABS.map(t => <button key={t} onClick={() => setActiveTab(t)} className={`ats-tab${activeTab === t ? ' active' : ''}`}>{t}</button>)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-ats-muted)' }}>
                No applicants found for this filter.
              </div>
            ) : filtered.map(a => {
              const seeker = a.user;
              const profile = seeker?.seekerProfile;
              return (
                <div key={a.id} className="ats-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--color-ats-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {seeker?.name?.charAt(0) || 'U'}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-ats-text)', margin: '0 0 0.25rem' }}>{seeker?.name || 'Unknown'}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', margin: '0 0 0.5rem' }}>
                      {profile?.education ? `${profile.education.degree} in ${profile.education.field}` : 'No education info'} · {profile?.yearsExp || 'N/A'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {profile?.skills?.map((s: string) => (
                        <span key={s} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', border: '1px solid var(--color-ats-border)', borderRadius: '9999px', color: 'var(--color-ats-muted)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  {/* Badges */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ats-muted)' }}>Applied {new Date(a.appliedOn).toLocaleDateString()}</span>
                    <StatusBadge status={a.paymentStatus} />
                    <StatusBadge status={a.cvStatus} />
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <Link to="/recruiter/cv-review" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ats-accent)', textDecoration: 'none', padding: '0.4rem 0.875rem', border: '1px solid var(--color-ats-accent)', borderRadius: '0.375rem' }}>View CV</Link>
                    <select
                      value={interests[a.id] ?? a.recruiterInterest}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setInterest(a.id, val);
                        try {
                          await applicationsApi.update(a.id, { recruiterInterest: val });
                        } catch (err) {
                          console.error(err);
                          alert(err instanceof Error ? err.message : 'Could not update status');
                        }
                      }}
                      style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-ats-surface)', border: '1px solid var(--color-ats-border)', color: 'var(--color-ats-text)', borderRadius: '0.375rem', padding: '0.375rem 0.625rem', cursor: 'pointer' }}
                    >
                      <option value="None">Set Status</option>
                      <option value="Interested">Mark as Interested</option>
                      <option value="Shortlisted">Shortlist</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
