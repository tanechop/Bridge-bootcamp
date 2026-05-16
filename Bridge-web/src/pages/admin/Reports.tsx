import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import KPICard from '../../components/KPICard';
import { adminApi, authApi, type AdminReportsPayload } from '../../services/api';

export default function Reports() {
  const [data, setData] = useState<AdminReportsPayload | null>(null);
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [rep, me] = await Promise.all([adminApi.getReports(), authApi.getMe()]);
        setData(rep);
        setAdminName(me.name || 'Admin');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monthly = data?.monthlyRegistrations ?? [];
  const maxSeek = monthly.length ? Math.max(...monthly.map((m) => m.seekers), 1) : 1;

  if (loading) {
    return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading reports...</div>;
  }

  return (
    <div className="ats-root">
      <Sidebar role="admin" />
      <div className="ats-main">
        <TopBar userName={adminName} role="Admin" />
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', margin: 0 }}>Reports & Analytics</h1>
          {error && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-ats-danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div className="ats-card">
            <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-ats-text)', marginBottom: '1.25rem' }}>Registration Trends (Monthly)</h2>
            {monthly.length === 0 ? (
              <p style={{ color: 'var(--color-ats-muted)', fontSize: '0.85rem' }}>No data yet.</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: 140, position: 'relative', paddingLeft: '2rem' }}>
                {monthly.map((m) => (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', height: 120, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-ats-accent)', zIndex: 1 }} title={`Seekers: ${m.seekers}`} />
                      <div style={{ width: '40%', height: `${(m.seekers / maxSeek) * 100}px`, backgroundColor: 'rgba(59,130,246,0.2)', borderRadius: '2px 2px 0 0', minHeight: 4 }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 600 }}>{m.month}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ats-card">
            <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-ats-text)', marginBottom: '1.25rem' }}>Application Volume (Top Jobs)</h2>
            {(!data?.topJobs || data.topJobs.length === 0) && <p style={{ color: 'var(--color-ats-muted)', fontSize: '0.85rem' }}>No applications yet.</p>}
            {data?.topJobs && data.topJobs.length > 0 && (() => {
              const maxA = Math.max(...data.topJobs.map((j) => j.applicants), 1);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data.topJobs.map((j) => (
                    <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ width: 180, fontSize: '0.8rem', color: 'var(--color-ats-text)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title}</span>
                      <div style={{ flex: 1, height: 22, backgroundColor: 'var(--color-ats-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(j.applicants / maxA) * 100}%`, backgroundColor: 'var(--color-ats-accent)', borderRadius: '4px', transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ width: 30, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-ats-text)', textAlign: 'right' }}>{j.applicants}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-ats-text)', marginBottom: '1rem' }}>Payment Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <KPICard label="Total (validated × fee)" value={data?.paymentStats?.totalCollectedLabel ?? '0 XAF'} accent="var(--color-ats-success)" />
              <KPICard label="Validated" value={data?.paymentStats?.validated ?? 0} accent="var(--color-ats-success)" />
              <KPICard label="Pending" value={data?.paymentStats?.pending ?? 0} accent="var(--color-ats-warning)" />
              <KPICard label="Rejected" value={data?.paymentStats?.rejected ?? 0} accent="var(--color-ats-danger)" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-ats-border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-ats-text)' }}>Top Recruiters</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
                    {['Recruiter', 'Posts', 'Applicants'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.625rem 1rem', fontSize: '0.68rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.topRecruiters ?? []).map((r) => (
                    <tr key={r.name} style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-ats-text)', fontWeight: 600 }}>{r.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-ats-muted)' }}>{r.posts}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-ats-text)', fontWeight: 700 }}>{r.applicants}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-ats-border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-ats-text)' }}>Top Applied Jobs</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
                    {['Job Title', 'Company', 'Applications'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.625rem 1rem', fontSize: '0.68rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.topJobs ?? [])
                    .slice()
                    .sort((a, b) => b.applicants - a.applicants)
                    .slice(0, 5)
                    .map((j) => (
                      <tr key={j.id} style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-ats-text)', fontWeight: 600 }}>{j.title}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-ats-muted)' }}>{j.company}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-ats-text)', fontWeight: 700 }}>{j.applicants}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
