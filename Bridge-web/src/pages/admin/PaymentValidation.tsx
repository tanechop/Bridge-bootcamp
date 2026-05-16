import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import { adminApi, authApi } from '../../services/api';

type PaymentRow = {
  id: number;
  applicant: string;
  job: string;
  company: string;
  method: string;
  amount: string;
  ref: string;
  submittedAt: string;
  status: string;
};

const TABS = ['Pending', 'Validated', 'Rejected'] as const;

export default function PaymentValidation() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Pending');
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('Admin');
  const [rejectInputs, setRejectInputs] = useState<Record<number, string>>({});
  const [rejectOpen, setRejectOpen] = useState<Record<number, boolean>>({});

  const load = useCallback(async () => {
    try {
      const [list, me] = await Promise.all([adminApi.getPayments(), authApi.getMe()]);
      setPayments(Array.isArray(list) ? (list as PaymentRow[]) : []);
      setAdminName((me as { name?: string })?.name || 'Admin');
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = TABS.reduce(
    (acc, t) => {
      acc[t] = payments.filter((p) => p.status === t).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const filtered = payments.filter((p) => p.status === activeTab);

  const setStatus = async (id: number, status: string) => {
    try {
      await adminApi.patchPaymentStatus(id, status);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

  if (loading) {
    return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading payments...</div>;
  }

  return (
    <div className="ats-root">
      <Sidebar role="admin" />
      <div className="ats-main">
        <TopBar userName={adminName} role="Admin" />
        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-ats-danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', margin: 0 }}>Payment Validation</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {TABS.map((t) => (
                <button key={t} onClick={() => setActiveTab(t)} className={`ats-tab${activeTab === t ? ' active' : ''}`}>
                  {t} ({counts[t]})
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-ats-muted)' }}>No payments in this category.</div>}
            {filtered.map((p) => (
              <div key={p.id} className="ats-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--color-ats-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {p.applicant.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-ats-text)' }}>{p.applicant}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)' }}>
                        {p.job} — {p.company}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-ats-border)' }}>
                  {[
                    { label: 'Method', v: p.method },
                    { label: 'Amount', v: p.amount },
                    { label: 'Reference', v: p.ref },
                    { label: 'Submitted', v: new Date(p.submittedAt).toLocaleString() },
                  ].map(({ label, v }) => (
                    <div key={label}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--color-ats-text)',
                          fontFamily: label === 'Reference' ? 'monospace' : 'inherit',
                          fontWeight: label === 'Amount' ? 700 : 400,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: 'var(--color-ats-surface)',
                      border: '1px solid var(--color-ats-border)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '1.5rem',
                    }}
                    title="Proof stored client-side only in this demo"
                  >
                    🖼️
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)' }}>Proof files are not stored on the server in this build.</span>
                </div>

                {p.status === 'Pending' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="ats-btn-primary" style={{ background: 'linear-gradient(135deg, #059669, #10B981)', flex: 1, padding: '0.625rem' }} onClick={() => setStatus(p.id, 'Validated')}>
                        ✅ Validate
                      </button>
                      <button
                        style={{
                          flex: 1,
                          padding: '0.625rem',
                          backgroundColor: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: 'var(--color-ats-danger)',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => setRejectOpen((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                      >
                        ❌ Reject
                      </button>
                    </div>
                    {rejectOpen[p.id] && (
                      <div style={{ display: 'flex', gap: '0.625rem' }}>
                        <input
                          className="ats-input"
                          style={{ flex: 1 }}
                          placeholder="Reason for rejection…"
                          value={rejectInputs[p.id] ?? ''}
                          onChange={(e) => setRejectInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        />
                        <button className="ats-btn-primary" style={{ background: 'var(--color-ats-danger)', padding: '0 1rem' }} onClick={() => setStatus(p.id, 'Rejected')}>
                          Confirm
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
