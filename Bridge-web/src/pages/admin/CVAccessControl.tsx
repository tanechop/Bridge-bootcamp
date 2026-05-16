import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import { adminApi, authApi } from '../../services/api';

type RequestRow = {
  id: number;
  recruiter: string;
  company: string;
  candidate: string;
  job: string;
  dateInterest: string;
  status: string;
};

type LogEntry = { id: number; action: string; recruiter: string; candidate: string; date: string };

export default function CVAccessControl() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [reqs, me] = await Promise.all([adminApi.getCvAccessRequests(), authApi.getMe()]);
      setRequests(Array.isArray(reqs) ? (reqs as RequestRow[]) : []);
      setAdminName((me as { name?: string })?.name || 'Admin');
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handle = async (id: number, action: 'Granted' | 'Denied') => {
    const req = requests.find((r) => r.id === id);
    try {
      await adminApi.patchCvAccessDecision(id, action);
      if (req) {
        setLog((prev) => [
          {
            id: Date.now(),
            action,
            recruiter: req.recruiter,
            candidate: req.candidate,
            date: new Date().toLocaleString(),
          },
          ...prev,
        ]);
      }
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const pending = requests.filter((r) => r.status === 'Pending');

  if (loading) {
    return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>;
  }

  return (
    <div className="ats-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar userName={adminName} role="Admin" />
      <div className="ats-main" style={{ overflowY: 'auto' }}>
        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-ats-text)', marginBottom: '1.25rem' }}>Access Requests</h1>
            {error && (
              <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-ats-danger)' }}>{error}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {pending.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-ats-muted)' }}>No pending requests.</div>}
              {pending.map((r) => (
                <div key={r.id} className="ats-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-ats-text)', fontSize: '0.9rem' }}>{r.recruiter}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)' }}>{r.company}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)' }}>
                    Requesting access to <strong style={{ color: 'var(--color-ats-text)' }}>{r.candidate}</strong>&apos;s contact details for <strong style={{ color: 'var(--color-ats-text)' }}>{r.job}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-ats-muted)' }}>Interest marked: {new Date(r.dateInterest).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    <button className="ats-btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #059669, #10B981)' }} onClick={() => handle(r.id, 'Granted')}>
                      Grant Access
                    </button>
                    <button
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: 'var(--color-ats-danger)',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => handle(r.id, 'Denied')}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-ats-text)', marginBottom: '1.25rem' }}>Access Log</h1>
            <div className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
                    {['Recruiter', 'Candidate', 'Action', 'Date'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ats-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {log.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '1.5rem', color: 'var(--color-ats-muted)', textAlign: 'center' }}>
                        No actions in this session yet.
                      </td>
                    </tr>
                  )}
                  {log.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-ats-text)' }}>{l.recruiter}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-ats-text)' }}>{l.candidate}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <StatusBadge status={l.action} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-ats-muted)' }}>{l.date}</td>
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
