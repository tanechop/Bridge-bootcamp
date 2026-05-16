import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { adminApi, authApi } from '../../services/api';

type JobRow = {
  id: number;
  title: string;
  recruiter: string;
  company: string;
  posted: string;
  applicants: number;
  status: string;
};

const TABS = ['All', 'Active', 'Flagged', 'Closed'];

export default function JobPostManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [rows, setRows] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('Admin');
  const [previewPost, setPreviewPost] = useState<JobRow | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [jobs, me] = await Promise.all([adminApi.getJobs(), authApi.getMe()]);
      setRows(Array.isArray(jobs) ? (jobs as JobRow[]) : []);
      setAdminName((me as { name?: string })?.name || 'Admin');
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getStatus = (p: JobRow) => p.status;
  const filtered = rows.filter((p) => activeTab === 'All' || getStatus(p) === activeTab);

  const toggleFlag = async (r: JobRow) => {
    const next = getStatus(r) === 'Flagged' ? 'Active' : 'Flagged';
    try {
      await adminApi.patchJobModeration(r.id, next);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const removeJob = async (id: number) => {
    try {
      await adminApi.deleteJob(id);
      setConfirmRemove(null);
      setPreviewPost(null);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Remove failed');
    }
  };

  const columns = [
    { key: 'title', label: 'Job Title' },
    { key: 'recruiter', label: 'Recruiter' },
    { key: 'company', label: 'Company' },
    { key: 'posted', label: 'Posted', render: (r: JobRow) => new Date(r.posted).toLocaleDateString() },
    { key: 'applicants', label: 'Applicants' },
    { key: 'status', label: 'Status', render: (r: JobRow) => <StatusBadge status={getStatus(r)} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r: JobRow) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewPost(r);
            }}
            style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-ats-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFlag(r);
            }}
            style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-ats-warning)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {getStatus(r) === 'Flagged' ? 'Unflag' : 'Flag'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmRemove(r.id);
            }}
            style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-ats-danger)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading job posts...</div>;
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', margin: 0 }}>Job Post Management</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {TABS.map((t) => (
                <button key={t} onClick={() => setActiveTab(t)} className={`ats-tab${activeTab === t ? ' active' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
            <DataTable columns={columns} data={filtered} />
          </div>
        </div>
      </div>

      <Modal open={!!previewPost} onClose={() => setPreviewPost(null)} title="Job Post Preview">
        {previewPost && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-ats-text)', margin: 0 }}>{previewPost.title}</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--color-ats-muted)' }}>
              <span>Recruiter: {previewPost.recruiter}</span>
              <span>·</span>
              <span>Company: {previewPost.company}</span>
              <span>·</span>
              <span>Applicants: {previewPost.applicants}</span>
            </div>
            <StatusBadge status={getStatus(previewPost)} />
          </div>
        )}
      </Modal>

      <Modal open={confirmRemove !== null} onClose={() => setConfirmRemove(null)} title="Confirm Removal">
        <p style={{ color: 'var(--color-ats-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>This will remove the job from public listings. Continue?</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="ats-btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmRemove(null)}>
            Cancel
          </button>
          <button className="ats-btn-primary" style={{ flex: 1, background: 'var(--color-ats-danger)' }} onClick={() => confirmRemove != null && removeJob(confirmRemove)}>
            Remove
          </button>
        </div>
      </Modal>
    </div>
  );
}
