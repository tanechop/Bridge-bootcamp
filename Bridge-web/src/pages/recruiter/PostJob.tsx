import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Country, City } from 'country-state-city';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { SECTORS, SKILLS_OPTIONS } from '../../data/formOptions';
import { jobsApi } from '../../services/api';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];
const EDU_OPTIONS = ['High School', "Associate's", "Bachelor's", "Master's", 'PhD'];
const EXP_OPTIONS = ['0–1 year', '1–3 years', '3–5 years', '5+ years'];
const CURRENCIES = ['XAF', 'USD', 'EUR'];

const Field = ({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div style={{ gridColumn: full ? '1 / -1' : 'span 1' }}>
    <label className="ats-label">{label}</label>
    {children}
  </div>
);

export default function PostJob() {
  const navigate = useNavigate();
  const { user } = useOutletContext<{ user: any }>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '', type: 'Full-time', sector: '', location: '', countryCode: '', remote: false,
    openings: '', deadline: '', salaryMin: '', salaryMax: '', currency: 'XAF', salaryUndisclosed: false,
    description: '', requirements: '', responsibilities: '',
    skills: [] as string[], minEducation: '', minExperience: '',
  });

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  
  const addSkill = (s: string) => { 
    const trimmed = s.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      set('skills', [...form.skills, trimmed]);
    }
    setSkillInput(''); 
  };

  const handlePublish = async () => {
    try {
      const jobData = {
        title: form.title,
        company: user?.recruiterProfile?.company || 'Unknown Company',
        location: form.location + (form.remote ? ' (Remote)' : ''),
        type: form.type,
        sector: form.sector,
        salary: form.salaryUndisclosed ? 'Undisclosed' : `${form.salaryMin}-${form.salaryMax} ${form.currency}`,
        description: form.description,
        requirements: form.requirements.split('\n').filter(l => l.trim()),
        responsibilities: form.responsibilities.split('\n').filter(l => l.trim()),
        skills: form.skills,
        minEducation: form.minEducation,
        minExperience: form.minExperience,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      };

      await jobsApi.create(jobData);
      setToast('Job published successfully!');
      setTimeout(() => { navigate('/recruiter/dashboard'); }, 2000);
    } catch (error) {
      console.error('Failed to publish job:', error);
      alert('Failed to publish job. Please check all fields.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ats-text)', marginBottom: '2rem' }}>Post a New Job</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Field label="Job Title" full><input className="ats-input" placeholder="Software Engineer" value={form.title} onChange={e => set('title', e.target.value)} /></Field>

        <Field label="Job Type">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
            {JOB_TYPES.map(t => (
              <button key={t} type="button" onClick={() => set('type', t)} style={{ padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: `2px solid ${form.type === t ? 'var(--color-ats-accent)' : 'var(--color-ats-border)'}`, backgroundColor: form.type === t ? 'rgba(59,130,246,0.1)' : 'transparent', color: form.type === t ? 'var(--color-ats-accent)' : 'var(--color-ats-muted)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
        </Field>

        <Field label="Department / Sector">
          <select className="ats-input" value={form.sector} onChange={e => set('sector', e.target.value)} style={{ appearance: 'none', cursor: 'pointer' }}>
            <option value="">Select sector…</option>
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Country">
          <select 
            className="ats-input" 
            value={form.countryCode} 
            onChange={e => setForm(prev => ({ ...prev, countryCode: e.target.value, location: '' }))}
            style={{ cursor: 'pointer' }}
          >
            <option value="">Select Country…</option>
            {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
          </select>
        </Field>

        <Field label="City">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <select 
              className="ats-input" 
              value={form.location} 
              onChange={e => set('location', e.target.value)} 
              disabled={!form.countryCode}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select City…</option>
              {form.countryCode && City.getCitiesOfCountry(form.countryCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-ats-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.remote} onChange={e => set('remote', e.target.checked)} /> Remote option available
            </label>
          </div>
        </Field>

        <Field label="Number of Openings"><input className="ats-input" type="number" min="1" value={form.openings} onChange={e => set('openings', e.target.value)} /></Field>
        <Field label="Application Deadline"><input className="ats-input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></Field>

        <Field label="Salary Range" full>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="ats-input" style={{ width: 140 }} placeholder="Min" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} disabled={form.salaryUndisclosed} />
            <span style={{ color: 'var(--color-ats-muted)' }}>–</span>
            <input className="ats-input" style={{ width: 140 }} placeholder="Max" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} disabled={form.salaryUndisclosed} />
            <select className="ats-input" style={{ width: 90, appearance: 'none' }} value={form.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-ats-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={form.salaryUndisclosed} onChange={e => set('salaryUndisclosed', e.target.checked)} /> Undisclosed
            </label>
          </div>
        </Field>

        <Field label="Job Description" full><textarea className="ats-input" rows={6} placeholder="Describe the role in detail…" style={{ resize: 'vertical', minHeight: 120 }} value={form.description} onChange={e => set('description', e.target.value)} /></Field>
        <Field label="Requirements" full><textarea className="ats-input" rows={4} placeholder="• 3+ years experience&#10;• Proficiency in…" style={{ resize: 'vertical' }} value={form.requirements} onChange={e => set('requirements', e.target.value)} /></Field>
        <Field label="Responsibilities" full><textarea className="ats-input" rows={4} placeholder="• Design and maintain APIs…" style={{ resize: 'vertical' }} value={form.responsibilities} onChange={e => set('responsibilities', e.target.value)} /></Field>

        <Field label="Required Skills" full>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input className="ats-input" placeholder="Add skill…" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} style={{ flex: 1 }} />
            <button className="ats-btn-ghost" onClick={() => addSkill(skillInput)} style={{ padding: '0.625rem 0.875rem', whiteSpace: 'nowrap' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SKILLS_OPTIONS.map(s => <button key={s} type="button" onClick={() => addSkill(s)} style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', border: `1px solid ${form.skills.includes(s) ? 'var(--color-ats-accent)' : 'var(--color-ats-border)'}`, backgroundColor: form.skills.includes(s) ? 'rgba(59,130,246,0.1)' : 'transparent', color: form.skills.includes(s) ? 'var(--color-ats-accent)' : 'var(--color-ats-muted)', cursor: 'pointer' }}>{s}</button>)}
          </div>
          {form.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              {form.skills.map(s => <span key={s} style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', backgroundColor: 'var(--color-ats-accent)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>{s} <button type="button" onClick={() => set('skills', form.skills.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>×</button></span>)}
            </div>
          )}
        </Field>

        <Field label="Minimum Education">
          <select className="ats-input" value={form.minEducation} onChange={e => set('minEducation', e.target.value)} style={{ appearance: 'none', cursor: 'pointer' }}>
            <option value="">Select…</option>
            {EDU_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Minimum Experience">
          <select className="ats-input" value={form.minExperience} onChange={e => set('minExperience', e.target.value)} style={{ appearance: 'none', cursor: 'pointer' }}>
            <option value="">Select…</option>
            {EXP_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button className="ats-btn-ghost" onClick={() => setPreviewOpen(true)} style={{ flex: 1, padding: '0.875rem' }}>Preview Post</button>
        <button className="ats-btn-primary" onClick={handlePublish} style={{ flex: 2, padding: '0.875rem', fontSize: '0.95rem' }}>Publish Job Post</button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: 'var(--color-ats-success)', color: '#fff', fontWeight: 600, fontSize: '0.875rem', padding: '0.875rem 1.5rem', borderRadius: '0.75rem', zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          ✅ {toast}
        </div>
      )}

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Job Post Preview" width="680px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-ats-text)', margin: 0 }}>{form.title || 'Untitled Position'}</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <StatusBadge status={form.type || 'Full-time'} />
            {form.sector && <span style={{ fontSize: '0.75rem', color: 'var(--color-ats-accent)', backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontWeight: 600 }}>{form.sector}</span>}
            {form.location && <span style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)' }}>📍 {form.location}</span>}
          </div>
          {!form.salaryUndisclosed && (form.salaryMin || form.salaryMax) && (
            <div style={{ fontSize: '0.875rem', color: 'var(--color-ats-text)' }}>💰 {form.salaryMin}–{form.salaryMax} {form.currency}/month</div>
          )}
          {form.description && <p style={{ fontSize: '0.875rem', color: 'var(--color-ats-muted)', lineHeight: 1.7 }}>{form.description}</p>}
          <button className="ats-btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => setPreviewOpen(false)}>Close Preview</button>
        </div>
      </Modal>
    </div>
  );
}
