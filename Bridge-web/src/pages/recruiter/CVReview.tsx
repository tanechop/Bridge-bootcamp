import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import { applicationsApi, authApi } from '../../services/api';

type QueueItem = {
  id: number;
  name: string;
  jobTitle: string;
  cvStatus: string;
  interest: string;
};

export default function CVReview() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [userName, setUserName] = useState('Recruiter');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [apps, me] = await Promise.all([applicationsApi.getAll(), authApi.getMe()]);
      setUserName((me as { name?: string })?.name || 'Recruiter');
      const list = (apps as any[])
        .filter((a) => a.paymentStatus === 'Validated' && (a.cvStatus === 'Pending' || a.cvStatus === 'Uploaded'))
        .map((a) => ({
          id: a.id,
          name: a.user?.name ?? 'Unknown',
          jobTitle: a.job?.title ?? '—',
          cvStatus: a.cvStatus,
          interest: a.recruiterInterest ?? 'None',
        }));
      setQueue(list);
      setSelected((prev) => {
        if (prev && list.some((x) => x.id === prev.id)) return prev;
        return list[0] ?? null;
      });
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (id: number) => {
    const interest = statuses[id] ?? queue.find((q) => q.id === id)?.interest ?? 'None';
    try {
      await applicationsApi.update(id, { recruiterInterest: interest });
      setSaved((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [id]: false })), 2000);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Save failed');
    }
  };

  if (loading) {
    return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading CV queue...</div>;
  }

  return (
    <div className="ats-root">
      <Sidebar role="recruiter" />
      <div className="ats-main">
        <TopBar userName={userName} role="Recruiter" />
        <div style={{ display: 'flex', height: 'calc(100vh - 57px)', overflow: 'hidden' }}>
          <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--color-ats-border)', overflowY: 'auto', padding: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-ats-text)', margin: '0 0 1rem' }}>CV Queue</h2>
            {error && <div style={{ fontSize: '0.75rem', color: 'var(--color-ats-danger)', marginBottom: '0.75rem' }}>{error}</div>}
            {queue.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)' }}>No applications ready for CV review.</div>}
            {queue.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: selected?.id === a.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                  textAlign: 'left',
                  marginBottom: '0.375rem',
                  transition: 'background-color 0.15s',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-ats-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {a.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-ats-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-ats-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.jobTitle}</div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <StatusBadge status={a.cvStatus} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!selected ? (
              <div style={{ color: 'var(--color-ats-muted)', padding: '2rem' }}>Select an applicant from the queue.</div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-ats-text)', margin: '0 0 0.25rem' }}>{selected.name}</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', margin: 0 }}>Applied for: {selected.jobTitle}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <select
                      value={statuses[selected.id] ?? selected.interest}
                      onChange={(e) => setStatuses((prev) => ({ ...prev, [selected.id]: e.target.value }))}
                      className="ats-input"
                      style={{ width: 'auto', cursor: 'pointer' }}
                    >
                      <option value="None">Set Status</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Interested">Interested</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <button className="ats-btn-primary" style={{ padding: '0.625rem 1rem', fontSize: '0.8rem' }} onClick={() => save(selected.id)}>
                      {saved[selected.id] ? '✅ Saved' : 'Save Status'}
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, backgroundColor: 'var(--color-ats-surface)', border: '1px solid var(--color-ats-border)', borderRadius: '0.75rem', minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '4rem' }}>📄</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-ats-text)' }}>{selected.name} — CV</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)' }}>PDF viewer placeholder (upload pipeline not configured)</div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="ats-btn-ghost" style={{ flex: 1 }} disabled title="Contact details revealed after admin approval">
                    Contact Applicant 🔒
                  </button>
                  <button className="ats-btn-primary" style={{ flex: 1 }} disabled>
                    Download CV
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
