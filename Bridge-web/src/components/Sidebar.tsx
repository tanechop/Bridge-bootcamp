import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type Role = 'seeker' | 'recruiter' | 'admin';

interface SidebarProps {
  role: Role;
}

const NAV = {
  seeker: [
    { label: 'Dashboard', to: '/seeker/dashboard' },
    { label: 'Browse Jobs', to: '/seeker/jobs' },
    { label: 'My Applications', to: '/seeker/applications' },
    { label: 'My Profile', to: '/seeker/profile' },
  ],
  recruiter: [
    { label: 'Dashboard', to: '/recruiter/dashboard' },
    { label: 'Post a Job', to: '/recruiter/post-job' },
    { label: 'My Job Posts', to: '/recruiter/my-posts' },
    { label: 'CV Review', to: '/recruiter/cv-review' },
    { label: 'Profile', to: '/recruiter/profile' },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Users', to: '/admin/users' },
    { label: 'Payment Validation', to: '/admin/payments' },
    { label: 'Job Posts', to: '/admin/job-posts' },
    { label: 'CV Access Control', to: '/admin/cv-access' },
    { label: 'Reports', to: '/admin/reports' },
    { label: 'System Settings', to: '/admin/settings' },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  seeker: 'Job Seeker',
  recruiter: 'Recruiter',
  admin: 'Admin',
};

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="ats-sidebar">
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--color-ats-border)' }}>
        <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-ats-accent)' }}>
          Bridge
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-ats-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
          {ROLE_LABELS[role]} Portal
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV[role].map(item => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'block',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                color: active ? '#fff' : 'var(--color-ats-muted)',
                backgroundColor: active ? 'var(--color-ats-accent)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-ats-surface)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-ats-text)'; }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--color-ats-muted)'; } }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--color-ats-border)' }}>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          style={{ 
            width: '100%',
            textAlign: 'left',
            background: 'none',
            border: 'none',
            display: 'block', 
            padding: '0.625rem 0.875rem', 
            borderRadius: '0.5rem', 
            fontSize: '0.875rem', 
            color: 'var(--color-ats-danger)', 
            textDecoration: 'none', 
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
