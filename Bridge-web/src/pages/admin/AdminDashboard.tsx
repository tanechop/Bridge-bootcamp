import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import KPICard from '../../components/KPICard';
import { adminApi } from '../../services/api';
import TopBar from '../../components/TopBar';

export default function AdminDashboard() {
  const { user } = useOutletContext<{ user: any }>();
  const [stats, setStats] = useState<{
    totalUsers: number;
    jobSeekers: number;
    recruiters: number;
    pendingPayments: number;
    pendingCVReviews: number;
    activeJobPosts: number;
  } | null>(null);
  const [monthly, setMonthly] = useState<{ month: string; seekers: number; recruiters: number }[]>([]);
  const [activity, setActivity] = useState<{ id: string; text: string; time: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, reg, act] = await Promise.all([
          adminApi.getStats(),
          adminApi.getRegistrationsByMonth(),
          adminApi.getActivity(),
        ]);
        setStats(statsData);
        setMonthly(Array.isArray(reg) ? reg : []);
        setActivity(Array.isArray(act) ? act : []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maxReg = useMemo(() => {
    if (!monthly.length) return 1;
    return Math.max(...monthly.map((m) => m.seekers + m.recruiters), 1);
  }, [monthly]);

  const pieGradient = useMemo(() => {
    const js = stats?.jobSeekers ?? 0;
    const rec = stats?.recruiters ?? 0;
    const adm = Math.max(0, (stats?.totalUsers ?? 0) - js - rec);
    const t = js + rec + adm || 1;
    const pJs = (js / t) * 100;
    const pRec = (rec / t) * 100;
    const pAdm = (adm / t) * 100;
    const a = pJs;
    const b = a + pRec;
    return `conic-gradient(var(--color-ats-accent) 0% ${a}%, var(--color-ats-purple) ${a}% ${b}%, var(--color-ats-warning) ${b}% 100%)`;
  }, [stats]);

  const pieLegend = useMemo(() => {
    const js = stats?.jobSeekers ?? 0;
    const rec = stats?.recruiters ?? 0;
    const adm = Math.max(0, (stats?.totalUsers ?? 0) - js - rec);
    const t = js + rec + adm || 1;
    return [
      { label: 'Job Seekers', pct: `${Math.round((js / t) * 100)}%`, color: 'var(--color-ats-accent)' },
      { label: 'Recruiters', pct: `${Math.round((rec / t) * 100)}%`, color: 'var(--color-ats-purple)' },
      { label: 'Other (incl. Admin)', pct: `${Math.round((adm / t) * 100)}%`, color: 'var(--color-ats-warning)' },
    ];
  }, [stats]);

  if (loading) {
    return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading dashboard...</div>;
  }

  const adminName = user?.name || 'Admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar userName={adminName} role="Admin" />
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        {error && (
        <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-ats-danger)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
        <KPICard label="Total Users" value={stats?.totalUsers || 0} />
        <KPICard label="Job Seekers" value={stats?.jobSeekers || 0} accent="var(--color-ats-accent)" />
        <KPICard label="Recruiters" value={stats?.recruiters || 0} accent="var(--color-ats-purple)" />
        <KPICard label="Pending Payments" value={stats?.pendingPayments || 0} accent="var(--color-ats-warning)" />
        <KPICard label="Pending CV Reviews" value={stats?.pendingCVReviews || 0} accent="var(--color-ats-warning)" />
        <KPICard label="Active Job Posts" value={stats?.activeJobPosts || 0} accent="var(--color-ats-success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="ats-card">
          <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-ats-text)', marginBottom: '1.5rem' }}>Registrations per Month</h2>
          {monthly.length === 0 ? (
            <p style={{ color: 'var(--color-ats-muted)', fontSize: '0.85rem' }}>No registration data yet.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 160 }}>
              {monthly.map((m) => {
                const total = m.seekers + m.recruiters;
                return (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: 130 }}>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                        <div style={{ width: '60%', height: `${(m.recruiters / maxReg) * 120}px`, backgroundColor: 'var(--color-ats-purple)', borderRadius: '2px 2px 0 0', minHeight: 4 }} />
                        <div style={{ width: '60%', height: `${(m.seekers / maxReg) * 120}px`, backgroundColor: 'var(--color-ats-accent)', borderRadius: '0 0 2px 2px', minHeight: 4 }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ats-text)', marginTop: '0.375rem' }}>{total}</div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 600 }}>{m.month}</div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.72rem', color: 'var(--color-ats-muted)' }}><span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--color-ats-accent)', display: 'inline-block' }} />Seekers</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.72rem', color: 'var(--color-ats-muted)' }}><span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--color-ats-purple)', display: 'inline-block' }} />Recruiters</div>
          </div>
        </div>
        <div className="ats-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-ats-text)', margin: 0 }}>User Breakdown</h2>
          <div style={{ width: 110, height: 110, borderRadius: '50%', background: pieGradient, boxShadow: '0 0 0 12px var(--color-ats-card)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {pieLegend.map((i) => (
              <div key={i.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-ats-muted)' }}><span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: i.color, display: 'inline-block', flexShrink: 0 }} />{i.label}</div>
                <span style={{ fontWeight: 700, color: 'var(--color-ats-text)' }}>{i.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ats-card">
        <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-ats-text)', marginBottom: '1rem' }}>Recent Activity</h2>
        {activity.length === 0 ? (
          <p style={{ color: 'var(--color-ats-muted)', fontSize: '0.85rem' }}>No recent activity.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activity.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--color-ats-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-ats-accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-ats-text)' }}>{a.text}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ats-muted)', flexShrink: 0, marginLeft: '1rem' }}>{a.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
