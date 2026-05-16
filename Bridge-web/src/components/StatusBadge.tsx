import React from 'react';
const STATUS_MAP: Record<string, { bg: string; color: string }> = {
  'Active':             { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  'Validated':          { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  'Uploaded':           { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  'Interested':         { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  'Granted':            { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  'Open':               { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  'Pending':            { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  'Under Review':       { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  'Awaiting Validation':{ bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  'Shortlisted':        { bg: 'rgba(139,92,246,0.15)',  color: '#8B5CF6' },
  'Rejected':           { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  'Suspended':          { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  'Denied':             { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  'Removed':            { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  'Flagged':            { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  'Closed':             { bg: 'rgba(100,116,139,0.15)', color: '#64748B' },
  'Draft':              { bg: 'rgba(100,116,139,0.15)', color: '#64748B' },
  '—':                  { bg: 'rgba(100,116,139,0.15)', color: '#64748B' },
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_MAP[status] ?? { bg: 'rgba(100,116,139,0.15)', color: '#64748B' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.625rem',
      borderRadius: '9999px',
      fontSize: '0.7rem',
      fontWeight: 700,
      backgroundColor: style.bg,
      color: style.color,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}
