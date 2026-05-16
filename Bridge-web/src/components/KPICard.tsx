import React from 'react';
interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function KPICard({ label, value, sub, accent }: KPICardProps) {
  return (
    <div className="ats-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ats-muted)' }}>
        {label}
      </span>
      <span style={{ fontSize: '2rem', fontWeight: 800, color: accent ?? 'var(--color-ats-text)', lineHeight: 1, fontFamily: 'var(--font-manrope)' }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: '0.75rem', color: 'var(--color-ats-muted)' }}>{sub}</span>}
    </div>
  );
}
