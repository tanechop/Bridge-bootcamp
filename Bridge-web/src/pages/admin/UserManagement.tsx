import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { adminApi, authApi } from '../../services/api';

type Row = {
  id: number;
  name: string;
  role: string;
  email: string;
  registered: string;
  status: string;
};

const TABS = ['All Users', 'Job Seekers', 'Intern Seekers', 'Recruiters', 'Suspended'];

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('All Users');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('Admin');
  const [selected, setSelected] = useState<Row | null>(null);
  const [statuses, setStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const [users, me] = await Promise.all([adminApi.getUsers(), authApi.getMe()]);
        const list = (users as { id: number; name: string; email: string; role: string; status: string; createdAt: string }[]).map((u) => ({
          id: u.id,
          name: u.name,
          role: u.role,
          email: u.email,
          registered: new Date(u.createdAt).toLocaleDateString(),
          status: u.status,
        }));
        setRows(list);
        setAdminName((me as { name?: string })?.name || 'Admin');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = rows.filter((u) => {
    const st = statuses[u.id] ?? u.status;
    const matchTab =
      activeTab === 'All Users'
        ? true
        : activeTab === 'Suspended'
          ? st === 'Suspended'
          : activeTab === 'Intern Seekers'
            ? u.role === 'Intern Seeker'
            : u.role === activeTab.replace(' Seekers', ' Seeker').replace('Recruiters', 'Recruiter');
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleSuspend = async (id: number, current: string) => {
    const next = current === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await adminApi.patchUserStatus(id, next);
      setStatuses((prev) => ({ ...prev, [id]: next }));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'email', label: 'Email' },
    { key: 'registered', label: 'Registered' },
    {
      key: 'status',
      label: 'Status',
      render: (r: Row) => <StatusBadge status={statuses[r.id] ?? r.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r: Row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelected(r);
            }}
            style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-ats-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSuspend(r.id, statuses[r.id] ?? r.status);
            }}
            style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-ats-warning)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {(statuses[r.id] ?? r.status) === 'Suspended' ? 'Restore' : 'Suspend'}
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading users...</div>;
  }

  return (
    <div className="ats-root">
      <Sidebar role="admin" />
      <div className="ats-main">
        <TopBar userName={adminName} role="Admin" onSearch={setSearch} searchPlaceholder="Search by name or email…" />
        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            {error && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-ats-danger)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', margin: 0 }}>User Management</h1>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {TABS.map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)} className={`ats-tab${activeTab === t ? ' active' : ''}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
              <DataTable columns={columns} data={filtered} onRowClick={setSelected} activeRowId={selected?.id} />
            </div>
          </div>
          {selected && (
            <div className="ats-card" style={{ position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-ats-text)', margin: 0 }}>User Details</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ats-muted)', fontSize: '1.25rem' }}>
                  ×
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'Full Name', v: selected.name },
                  { label: 'Role', v: selected.role },
                  { label: 'Email', v: selected.email },
                  { label: 'Registered', v: selected.registered },
                ].map(({ label, v }) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-ats-text)' }}>{v}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Status</div>
                  <StatusBadge status={statuses[selected.id] ?? selected.status} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
