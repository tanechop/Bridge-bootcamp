import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
import { Country, City } from 'country-state-city';
import { INDUSTRIES, SECTORS } from '../../data/formOptions';
import { authApi, profilesApi } from '../../services/api';
import { getDashboardPathForRole } from '../../utils/dashboardForRole';
import { recruiterQuestionnaireIncomplete, type AuthMeUser } from '../../utils/postAuthRouting';

const SECTIONS = [
  { id: 'company', label: 'Company Info' },
  { id: 'contact', label: 'Contact Details' },
  { id: 'hiring', label: 'Hiring Needs' },
  { id: 'roles', label: 'Role Details' },
  { id: 'prefs', label: 'Candidate Prefs' },
];

const JOB_CATEGORIES = ['Engineering', 'Marketing', 'Finance', 'Design', 'Sales', 'Operations', 'HR', 'Legal', 'Healthcare'];
const EXP_OPTIONS = ['0–1 year', '1–3 years', '3–5 years', '5+ years'];
const EDU_OPTIONS = ['High School', "Associate's", "Bachelor's", "Master's", 'PhD'];
const SIZE_OPTIONS = ['1–10', '11–50', '51–200', '200+'];

const SectionHeader = ({ id, title, sectionRefs }: { id: string; title: string; sectionRefs: any }) => (
  <h2 id={id} ref={el => { sectionRefs.current[id] = el; }} style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-ats-border)' }}>{title}</h2>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label className="ats-label">{label}</label>
    {children}
  </div>
);

const Input = ({ k, placeholder, type = 'text', value, onChange }: { k: string; placeholder?: string; type?: string; value: any; onChange: any }) => (
  <input
    className="ats-input"
    type={type}
    placeholder={placeholder}
    value={value || ''}
    onChange={e => onChange(k, e.target.value)}
  />
);

const Select = ({ k, options, value, onChange }: { k: string; options: string[]; value: any; onChange: any }) => (
  <select
    className="ats-input"
    value={value || ''}
    onChange={e => onChange(k, e.target.value)}
    style={{ appearance: 'none', cursor: 'pointer' }}
  >
    <option value="">Select…</option>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

const Toggle = ({ k, options, value, onChange }: { k: string; options: string[]; value: any; onChange: any }) => (
  <div style={{ display: 'flex', gap: '0.75rem' }}>
    {options.map(o => (
      <button
        key={o}
        type="button"
        onClick={() => onChange(k, o)}
        style={{
          padding: '0.625rem 1.25rem',
          borderRadius: '0.5rem',
          border: `2px solid ${value === o ? 'var(--color-ats-accent)' : 'var(--color-ats-border)'}`,
          backgroundColor: value === o ? 'rgba(59,130,246,0.1)' : 'transparent',
          color: value === o ? 'var(--color-ats-accent)' : 'var(--color-ats-muted)',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer'
        }}
      >
        {o}
      </button>
    ))}
  </div>
);

export default function RecruiterQuestionnaire() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('company');

  // 1. Initialized categories array and other state properties to avoid undefined references
  const [data, setData] = useState<Record<string, any>>({
    companyName: '', industry: '', companySize: '', website: '', logo: null,
    recruiterName: '', jobTitle: '', email: '', phone: '',
    hireType: '', urgency: '', openPositions: '',
    categories: [], minExp: '', minEdu: '', countryCode: '', location: '',
  });

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const set = (k: string, v: any) => setData(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    SECTIONS.forEach(s => { const el = sectionRefs.current[s.id]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // 2. Safely un-commented your guardrail auth checks to keep non-recruiters or complete users out
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    authApi
      .getMe()
      .then((me: AuthMeUser) => {
        const role = me?.role ?? '';
        if (role !== 'Recruiter') {
          navigate(getDashboardPathForRole(role), { replace: true });
          return;
        }
        if (!recruiterQuestionnaireIncomplete(me)) {
          navigate(getDashboardPathForRole('Recruiter'), { replace: true });
        }
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate]);

  // 3. Fixed array filter/spread bug for multi-select categories
  const toggleCategory = (c: string) => {
    const currentCategories = Array.isArray(data.categories) ? data.categories : [];
    if (currentCategories.includes(c)) {
      set('categories', currentCategories.filter(x => x !== c));
    } else {
      set('categories', [...currentCategories, c]);
    }
  };

  const handleSubmit = async () => {
    try {
      // Map all data fields into the profile payload requirements
      const profileData = {
        company: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        website: data.website,
        hqLocation: data.location,
        recruiterName: data.recruiterName,
        jobTitle: data.jobTitle,
        phone: data.phone,
        hireType: data.hireType,
        urgency: data.urgency,
        openPositions: data.openPositions,
        categories: data.categories,
        minExp: data.minExp,
        minEdu: data.minEdu,
        countryCode: data.countryCode
      };

      await profilesApi.updateRecruiter(profileData);

      // 4. Intentionally re-fetching user profile data or status to guarantee backend updates are verified before redirecting
      const me = (await authApi.getMe()) as { role?: string };
      const dashboardPath = getDashboardPathForRole(me?.role || 'Recruiter');

      navigate(dashboardPath, { replace: true });
    } catch (error) {
      console.error('Failed to save recruiter profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ats-bg)', color: 'var(--color-ats-text)', minHeight: '100vh', display: 'flex' }}>
      {/* Progress sidebar */}
      <aside style={{ width: 240, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', borderRight: '1px solid var(--color-ats-border)', padding: '2rem 1.5rem', backgroundColor: 'var(--color-ats-card)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-ats-accent)' }}>Bridge</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-ats-muted)', marginTop: '0.25rem' }}>Recruiter Registration</p>
        </div>
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', backgroundColor: activeSection === s.id ? 'rgba(59,130,246,0.12)' : 'transparent', marginBottom: '0.25rem' }}
          >
            <span style={{ width: 22, height: 22, borderRadius: '50%', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: activeSection === s.id ? 'var(--color-ats-accent)' : 'var(--color-ats-surface)', color: activeSection === s.id ? '#fff' : 'var(--color-ats-muted)' }}>{i + 1}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: activeSection === s.id ? 600 : 400, color: activeSection === s.id ? 'var(--color-ats-text)' : 'var(--color-ats-muted)' }}>{s.label}</span>
          </button>
        ))}
      </aside>

      <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem', maxWidth: 780 }}>
        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="company" title="Company Information" sectionRefs={sectionRefs} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Company Name"><Input k="companyName" placeholder="Acme Corp" value={data.companyName} onChange={set} /></Field>
            <Field label="Industry"><Select k="industry" options={INDUSTRIES} value={data.industry} onChange={set} /></Field>
            <Field label="Company Size"><Select k="companySize" options={SIZE_OPTIONS} value={data.companySize} onChange={set} /></Field>
            <Field label="Website URL"><Input k="website" placeholder="https://company.com" value={data.website} onChange={set} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="ats-label">Company Logo</label>
              <div style={{ position: 'relative', border: '2px dashed var(--color-ats-border)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', marginTop: '0.375rem' }}>
                <input type="file" accept=".jpg,.jpeg,.png" onChange={e => e.target.files?.[0] && set('logo', e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <UploadCloud size={24} style={{ color: 'var(--color-ats-muted)', margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.8rem', color: data.logo ? 'var(--color-ats-accent)' : 'var(--color-ats-muted)', margin: 0 }}>{data.logo ? data.logo.name : 'Upload company logo'}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="contact" title="Contact Details" sectionRefs={sectionRefs} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Recruiter Full Name"><Input k="recruiterName" placeholder="Paul Tremblay" value={data.recruiterName} onChange={set} /></Field>
            <Field label="Job Title"><Input k="jobTitle" placeholder="HR Manager" value={data.jobTitle} onChange={set} /></Field>
            <Field label="Professional Email"><Input k="email" type="email" placeholder="paul@company.com" value={data.email} onChange={set} /></Field>
            <Field label="Phone Number"><Input k="phone" placeholder="+237 670 000 000" value={data.phone} onChange={set} /></Field>
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="hiring" title="Hiring Needs" sectionRefs={sectionRefs} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Field label="Type of Hire"><Toggle k="hireType" options={['Permanent Jobs', 'Internships', 'Both']} value={data.hireType} onChange={set} /></Field>
            <Field label="Urgency"><Toggle k="urgency" options={['Immediate', 'Within 1 month', 'Within 3 months']} value={data.urgency} onChange={set} /></Field>
            <Field label="Number of Open Positions"><Input k="openPositions" type="number" placeholder="5" value={data.openPositions} onChange={set} /></Field>
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="roles" title="Role Details" sectionRefs={sectionRefs} />
          <label className="ats-label" style={{ marginBottom: '0.75rem' }}>Job Categories Typically Hiring For</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {JOB_CATEGORIES.map(c => {
              const isSelected = Array.isArray(data.categories) && data.categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: '9999px',
                    border: `2px solid ${isSelected ? 'var(--color-ats-accent)' : 'var(--color-ats-border)'}`,
                    backgroundColor: isSelected ? 'rgba(59,130,246,0.1)' : 'transparent',
                    color: isSelected ? 'var(--color-ats-accent)' : 'var(--color-ats-muted)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="prefs" title="Candidate Preferences" sectionRefs={sectionRefs} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Minimum Experience"><Select k="minExp" options={EXP_OPTIONS} value={data.minExp} onChange={set} /></Field>
            <Field label="Minimum Education"><Select k="minEdu" options={EDU_OPTIONS} value={data.minEdu} onChange={set} /></Field>
            <Field label="Preferred Country">
              <select
                className="ats-input"
                value={data.countryCode || ''}
                onChange={e => {
                  const code = e.target.value;
                  setData(prev => ({ ...prev, countryCode: code, location: '' }));
                }}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select Country…</option>
                {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Preferred City">
              <select
                className="ats-input"
                value={data.location || ''}
                onChange={e => set('location', e.target.value)}
                disabled={!data.countryCode}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select City…</option>
                {data.countryCode && City.getCitiesOfCountry(data.countryCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <button
          className="ats-btn-primary"
          type="button"
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
          onClick={handleSubmit}
        >
          Complete Registration →
        </button>
      </div>
    </div>
  );
}