import React from 'react';
import { MapPin, Clock, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  linkBase?: string;
}

export const JobCard: React.FC<JobCardProps> = ({ job, linkBase = '/seeker/jobs' }) => {
  return (
    <div className="ats-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', transition: 'border-color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-ats-accent)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-ats-border)')}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: '0.5rem', backgroundColor: 'var(--color-ats-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Briefcase size={20} style={{ color: 'var(--color-ats-accent)' }} />
        </div>
        <StatusBadge status={job.type} />
      </div>

      {/* Title & company */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-ats-text)', marginBottom: '0.25rem' }}>
          {job.title}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)' }}>{job.company}</p>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-ats-muted)' }}>
          <MapPin size={12} /> {job.location}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-ats-muted)' }}>
          <Clock size={12} />{' '}
          {typeof job.posted === 'string' && job.posted.includes('T')
            ? new Date(job.posted).toLocaleDateString()
            : job.posted}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {job.description}
      </p>

      {/* Sector tag + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-ats-accent)', backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.25rem 0.625rem', borderRadius: '9999px' }}>
          {job.sector}
        </span>
        <Link
          to={`${linkBase}/${job.id}`}
          style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-ats-accent)', textDecoration: 'none' }}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
