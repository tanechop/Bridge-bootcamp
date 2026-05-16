import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { MY_APPLICATIONS, SEEKER_USER } from '../../data/dummyData';

const TABS = ['All', 'Pending', 'Validated', 'CV Uploaded'];

export default function MyApplications() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedRow, setSelectedRow] = useState<typeof MY_APPLICATIONS[0] | null>(null);

  const filtered = MY_APPLICATIONS.filter(a => {
    if (activeTab === 'Pending') return a.payment === 'Pending';
    if (activeTab === 'Validated') return a.payment === 'Validated';
    if (activeTab === 'CV Uploaded') return a.cvStatus === 'Uploaded';
    return true;
  });

  const columns = [
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'company', label: 'Company' },
    { key: 'type', label: 'Type' },
    { key: 'appliedOn', label: 'Applied On' },
    { key: 'payment', label: 'Payment', render: (r: typeof MY_APPLICATIONS[0]) => <StatusBadge status={r.payment} /> },
    { key: 'cvStatus', label: 'CV Status', render: (r: typeof MY_APPLICATIONS[0]) => <StatusBadge status={r.cvStatus} /> },
    { key: 'recruiterInterest', label: 'Recruiter Interest', render: (r: typeof MY_APPLICATIONS[0]) => <StatusBadge status={r.recruiterInterest} /> },
  ];

  return (
    <div className="ats-root">
      <Sidebar role="seeker" />
      <div className="ats-main">
        <TopBar userName={SEEKER_USER.name} role="Job Seeker" />
        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: selectedRow ? '1fr 360px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main Table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', margin: 0 }}>My Applications</h1>
                <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', backgroundColor: 'var(--color-ats-accent)', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{MY_APPLICATIONS.length}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {TABS.map(t => <button key={t} onClick={() => setActiveTab(t)} className={`ats-tab${activeTab === t ? ' active' : ''}`}>{t}</button>)}
              </div>
            </div>
            <div className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
              <DataTable columns={columns} data={filtered} onRowClick={setSelectedRow} activeRowId={selectedRow?.id} />
            </div>
          </div>

          {/* Drawer */}
          {selectedRow && (
            <div className="ats-card" style={{ position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-ats-text)', margin: 0 }}>{selectedRow.jobTitle}</h3>
                <button onClick={() => setSelectedRow(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ats-muted)', fontSize: '1.25rem' }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'Company', value: selectedRow.company },
                  { label: 'Type', value: selectedRow.type },
                  { label: 'Applied On', value: selectedRow.appliedOn },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-ats-text)' }}>{value}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Payment</div>
                  <StatusBadge status={selectedRow.payment} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>CV Status</div>
                  <StatusBadge status={selectedRow.cvStatus} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Recruiter Interest</div>
                  <StatusBadge status={selectedRow.recruiterInterest} />
                </div>
                {selectedRow.cvStatus === 'Uploaded' && (
                  <button className="ats-btn-ghost" style={{ marginTop: '0.5rem', width: '100%' }}>Download CV</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}