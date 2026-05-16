import React from 'react';
import { Bell, Search } from 'lucide-react';

interface TopBarProps {
  userName: string;
  role: string;
  searchPlaceholder?: string;
  onSearch?: (v: string) => void;
  extra?: React.ReactNode;
}

export default function TopBar({ userName, role, searchPlaceholder = 'Search…', onSearch, extra }: TopBarProps) {
  return (
    <div className="ats-topbar">
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ats-muted)' }} />
        <input
          className="ats-input"
          style={{ paddingLeft: '2.2rem', paddingRight: '0.875rem' }}
          placeholder={searchPlaceholder}
          onChange={e => onSearch?.(e.target.value)}
        />
      </div>

      {extra && <div style={{ flex: 1 }}>{extra}</div>}

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ats-muted)' }}
          title="Notifications"
        >
          <Bell size={20} />
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: 'var(--color-ats-accent)',
            border: '2px solid var(--color-ats-card)'
          }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            backgroundColor: 'var(--color-ats-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: '#fff',
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-ats-text)' }}>{userName}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-ats-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
