import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, GraduationCap, Clock } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import KPICard from '../../components/KPICard';
import StatusBadge from '../../components/StatusBadge';
import TopBar from '../../components/TopBar';
import { jobsApi, applicationsApi } from '../../services/api';

export default function RecruiterDashboard() {
  const { user } = useOutletContext<{ user: any }>();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [seekers, setSeekers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    field: '',
    degree: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, applicantsData] = await Promise.all([
          jobsApi.getMine(),
          applicationsApi.getAll(),
        ]);
        setJobs(jobsData);
        setApplicants(applicantsData);
        // derivation of seekers from applications or a future seekers endpoint
        const seekerList = applicantsData.map((a: any) => ({
          ...a.user,
          ...a.user.seekerProfile,
          id: a.user.id
        })).filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.id === v.id) === i);
        setSeekers(seekerList);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const RECENT_POSTS = useMemo(() => 
    jobs.slice(0, 4).map((j: any) => ({
      ...j,
      postedDate: j.posted,
      applicants: j._count?.applications ?? j.applications ?? 0,
      status: j.moderationStatus === 'Flagged' ? 'Flagged' : j.moderationStatus === 'Closed' ? 'Closed' : 'Active',
    })), [jobs]);

  const filteredSeekers = useMemo(() => {
    return seekers.filter(seeker => {
      const nameMatch = seeker.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const titleMatch = seeker.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || titleMatch;
      
      const matchesExp = !filters.experience || seeker.yearsExp === filters.experience;
      const matchesLoc = !filters.location || seeker.city?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesField = !filters.field || seeker.education?.field?.toLowerCase().includes(filters.field.toLowerCase());
      const matchesDegree = !filters.degree || seeker.education?.degree === filters.degree;

      return matchesSearch && matchesExp && matchesLoc && matchesField && matchesDegree;
    });
  }, [searchTerm, filters, seekers]);

  if (loading) {
    return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading dashboard...</div>;
  }

  const userName = user?.name || 'Recruiter';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar userName={userName} role="Recruiter" />
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <KPICard label="Active Job Posts" value={jobs.length} accent="var(--color-ats-success)" />
        <KPICard label="Total Applicants" value={applicants.length} />
        <KPICard label="CVs to Review" value={applicants.filter(a => a.cvStatus === 'Pending').length} accent="var(--color-ats-warning)" />
        <KPICard label="Positions Filled" value={0} accent="var(--color-ats-accent)" />
      </div>

      {/* Seeker Search Section */}
      <div className="ats-card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'var(--color-ats-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Search size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-ats-text)', margin: 0 }}>Find Talent</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', margin: 0 }}>Search for seekers based on their characteristics</p>
          </div>
        </div>

        {/* Filters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="ats-label">Search Name or Title</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="ats-input"
                placeholder="e.g. Jean Dupont..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="ats-label">Experience</label>
            <select
              className="ats-input"
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            >
              <option value="">All Experience</option>
              <option value="0–1 year">0–1 year</option>
              <option value="1–3 years">1–3 years</option>
              <option value="3–5 years">3–5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>
          <div>
            <label className="ats-label">Location</label>
            <input
              type="text"
              className="ats-input"
              placeholder="e.g. Abidjan"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
          <div>
            <label className="ats-label">Field</label>
            <input
              type="text"
              className="ats-input"
              placeholder="e.g. Computer Science"
              value={filters.field}
              onChange={(e) => setFilters({ ...filters, field: e.target.value })}
            />
          </div>
          <div>
            <label className="ats-label">Degree</label>
            <select
              className="ats-input"
              value={filters.degree}
              onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
            >
              <option value="">All Degrees</option>
              <option value="Bachelor's">Bachelor's</option>
              <option value="Master's">Master's</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div style={{ border: '1px solid var(--color-ats-border)', borderRadius: '0.75rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead style={{ backgroundColor: 'var(--color-ats-surface)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-ats-muted)' }}>Seeker</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-ats-muted)' }}>Experience</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-ats-muted)' }}>Location</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-ats-muted)' }}>Education</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-ats-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeekers.length > 0 ? filteredSeekers.map(seeker => (
                <tr key={seeker.id} style={{ borderBottom: '1px solid var(--color-ats-border)', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-ats-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
                        {seeker.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-ats-text)' }}>{seeker.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-ats-muted)' }}>{seeker.title || 'No Title'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--color-ats-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={14} />
                      {seeker.yearsExp || '0'} yrs
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--color-ats-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <MapPin size={14} />
                      {seeker.city || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--color-ats-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <GraduationCap size={14} />
                      {seeker.education?.degree || 'N/A'} in {seeker.education?.field || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Link
                      to={`/recruiter/cv-review`}
                      style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ats-accent)', textDecoration: 'none' }}
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-ats-muted)' }}>
                    No seekers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Recent Posts */}
      <div className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-ats-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-ats-text)', margin: 0 }}>My Recent Posts</h2>
          <Link to="/recruiter/my-posts" style={{ fontSize: '0.8rem', color: 'var(--color-ats-accent)', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
              {['Job Title', 'Type', 'Posted', 'Applicants', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ats-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_POSTS.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-ats-text)' }}>{p.title}</td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--color-ats-muted)' }}>{p.type}</td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--color-ats-muted)' }}>{new Date(p.posted).toLocaleDateString()}</td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--color-ats-text)', fontWeight: 600 }}>{p.applicants}</td>
                <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={p.status} /></td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/recruiter/my-posts/${p.id}/applicants`} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ats-accent)', textDecoration: 'none' }}>View</Link>
                    <span style={{ color: 'var(--color-ats-border)' }}>·</span>
                    <button style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ats-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Applicants */}
      <div className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-ats-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-ats-text)', margin: 0 }}>Recent Applicants</h2>
        </div>
        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {applicants.slice(0, 5).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-ats-surface)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-ats-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{a.user?.name?.charAt(0) || 'U'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-ats-text)' }}>{a.user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-ats-muted)' }}>{a.job?.title}</div>
              </div>
              <StatusBadge status={a.paymentStatus} />
              <StatusBadge status={a.cvStatus} />
              <Link to="/recruiter/cv-review" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ats-accent)', textDecoration: 'none' }}>View CV</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Link to="/recruiter/post-job" style={{ textDecoration: 'none' }}>
          <div className="ats-card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-ats-accent)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-ats-border)')}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>+</div>
            <div style={{ fontWeight: 700, color: 'var(--color-ats-text)', fontSize: '0.9rem' }}>Post a New Job</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', marginTop: '0.25rem' }}>Create a new open position</div>
          </div>
        </Link>
        <Link to="/recruiter/cv-review" style={{ textDecoration: 'none' }}>
          <div className="ats-card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-ats-accent)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-ats-border)')}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📄</div>
            <div style={{ fontWeight: 700, color: 'var(--color-ats-text)', fontSize: '0.9rem' }}>Review Pending CVs</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', marginTop: '0.25rem' }}>{applicants.filter(a => a.cvStatus === 'Pending').length} CVs awaiting review</div>
          </div>
        </Link>
      </div>
    </div>
    </div>
  );
}
