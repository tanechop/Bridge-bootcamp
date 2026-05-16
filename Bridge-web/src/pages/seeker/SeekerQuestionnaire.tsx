import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Plus, X as XIcon } from 'lucide-react';
import { Country, City } from 'country-state-city';
import { SKILLS_OPTIONS, SECTORS } from '../../data/formOptions';
import { authApi, profilesApi } from '../../services/api';
import { getDashboardPathForRole } from '../../utils/dashboardForRole';
import { seekerQuestionnaireIncomplete, type AuthMeUser } from '../../utils/postAuthRouting';

const SECTIONS = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'preference', label: 'Job Preference' },
  { id: 'documents', label: 'Documents' },
];

const DEGREE_OPTIONS = ["High School", "Vocational Certificate", "Associate's", "Bachelor's", "Master's", "PhD"];
const EXP_OPTIONS = ["0–1 year", "1–3 years", "3–5 years", "5+ years"];

const SectionHeader = ({ id, title, sectionRefs }: { id: string; title: string; sectionRefs: any }) => (
  <h2 id={id} ref={el => { sectionRefs.current[id] = el; }} style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', marginBottom: '1.5rem', paddingTop: '0.5rem', borderBottom: '1px solid var(--color-ats-border)', paddingBottom: '0.75rem' }}>{title}</h2>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label className="ats-label">{label}</label>
    {children}
  </div>
);

const Input = ({ name, type = 'text', placeholder, value, onChange }: { name: string; type?: string; placeholder?: string; value: any; onChange: any }) => (
  <input 
    className="ats-input" 
    type={type} 
    placeholder={placeholder} 
    value={value} 
    onChange={e => onChange(name, e.target.value)} 
  />
);

const Select = ({ name, options, placeholder, value, onChange }: { name: string; options: string[]; placeholder?: string; value: any; onChange: any }) => (
  <select className="ats-input" value={value} onChange={e => onChange(name, e.target.value)} style={{ cursor: 'pointer', appearance: 'none' }}>
    <option value="">{placeholder ?? 'Select…'}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

export default function SeekerQuestionnaire() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('personal');
  const [skillInput, setSkillInput] = useState('');
  const [data, setData] = useState({
    fullName: '', dob: '', gender: '', nationality: '', nationalityCode: '', city: '', phone: '',
    degree: '', field: '', institution: '', gradYear: '',
    yearsExp: '', lastJobTitle: '', industry: '',
    skills: [] as string[],
    seeking: 'Both', preferredSector: '', preferredCity: '', availableFrom: '',
    cv: null as File | null, photo: null as File | null,
  });

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    SECTIONS.forEach(s => { const el = sectionRefs.current[s.id]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     navigate('/login', { replace: true });
  //     return;
  //   }
  //   authApi
  //     .getMe()
  //     .then((me: AuthMeUser) => {
  //       const role = me?.role ?? '';
  //       if (role === 'Recruiter' || role === 'Admin') {
  //         navigate(getDashboardPathForRole(role), { replace: true });
  //         return;
  //       }
  //       if (!seekerQuestionnaireIncomplete(me)) {
  //         navigate(getDashboardPathForRole(role), { replace: true });
  //       }
  //     })
  //     .catch(() => navigate('/login', { replace: true }));
  // }, [navigate]);

  const set = (k: string, v: any) => setData(prev => ({ ...prev, [k]: v }));
  
  const addSkill = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      set('skills', [...data.skills, trimmed]);
    }
    setSkillInput('');
  };

  const handleSubmit = async () => {
    try {
      // Map frontend data to backend schema
      const profileData = {
        title: data.lastJobTitle,
        city: data.city,
        yearsExp: data.yearsExp,
        skills: data.skills,
        education: {
          degree: data.degree,
          field: data.field,
          institution: data.institution,
          gradYear: data.gradYear
        },
        preferences: {
          seeking: data.seeking,
          preferredSector: data.preferredSector,
          preferredCity: data.preferredCity,
          availableFrom: data.availableFrom
        }
      };

      await profilesApi.updateSeeker(profileData);
      const me = (await authApi.getMe()) as { role?: string };
      navigate(getDashboardPathForRole(me?.role), { replace: true });
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ats-bg)', color: 'var(--color-ats-text)', minHeight: '100vh', display: 'flex' }}>
      {/* Sticky progress sidebar */}
      <aside style={{ width: 240, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', borderRight: '1px solid var(--color-ats-border)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', backgroundColor: 'var(--color-ats-card)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-ats-accent)' }}>Bridge</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-ats-muted)', marginTop: '0.25rem' }}>Complete your profile</p>
        </div>
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', textAlign: 'left', backgroundColor: activeSection === s.id ? 'rgba(59,130,246,0.12)' : 'transparent', transition: 'background-color 0.15s' }}
          >
            <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, backgroundColor: activeSection === s.id ? 'var(--color-ats-accent)' : 'var(--color-ats-surface)', color: activeSection === s.id ? '#fff' : 'var(--color-ats-muted)', border: `1px solid ${activeSection === s.id ? 'var(--color-ats-accent)' : 'var(--color-ats-border)'}` }}>
              {i + 1}
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: activeSection === s.id ? 600 : 400, color: activeSection === s.id ? 'var(--color-ats-text)' : 'var(--color-ats-muted)' }}>{s.label}</span>
          </button>
        ))}
      </aside>

      {/* Form Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem', maxWidth: 780 }}>
        {/* Personal Info */}
        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="personal" title="Personal Information" sectionRefs={sectionRefs} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Full Name"><Input name="fullName" placeholder="Jean Dupont" value={data.fullName} onChange={set} /></Field>
            <Field label="Date of Birth"><Input name="dob" type="date" value={data.dob} onChange={set} /></Field>
            <Field label="Gender">
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['Male', 'Female', 'Other'].map(g => (
                  <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-ats-text)' }}>
                    <input type="radio" name="gender" value={g} checked={data.gender === g} onChange={() => set('gender', g)} />
                    {g}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Nationality">
              <select 
                className="ats-input" 
                value={data.nationalityCode} 
                onChange={e => {
                  const code = e.target.value;
                  const name = Country.getCountryByCode(code)?.name || '';
                  setData(prev => ({ ...prev, nationalityCode: code, nationality: name, city: '' }));
                }}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select Country…</option>
                {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="City">
              <select 
                className="ats-input" 
                value={data.city} 
                onChange={e => set('city', e.target.value)} 
                disabled={!data.nationalityCode}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select City…</option>
                {data.nationalityCode && City.getCitiesOfCountry(data.nationalityCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Phone Number"><Input name="phone" placeholder="+237 655 000 000" value={data.phone} onChange={set} /></Field>
          </div>
        </div>

        {/* Education */}
        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="education" title="Education" sectionRefs={sectionRefs} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Highest Degree"><Select name="degree" options={DEGREE_OPTIONS} value={data.degree} onChange={set} /></Field>
            <Field label="Field of Study"><Input name="field" placeholder="Computer Science" value={data.field} onChange={set} /></Field>
            <Field label="Institution Name"><Input name="institution" placeholder="University of Abidjan" value={data.institution} onChange={set} /></Field>
            <Field label="Graduation Year"><Input name="gradYear" type="number" placeholder="2022" value={data.gradYear} onChange={set} /></Field>
          </div>
        </div>

        {/* Experience */}
        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="experience" title="Work Experience" sectionRefs={sectionRefs} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Years of Experience"><Select name="yearsExp" options={EXP_OPTIONS} value={data.yearsExp} onChange={set} /></Field>
            <Field label="Current / Last Job Title"><Input name="lastJobTitle" placeholder="Software Engineer" value={data.lastJobTitle} onChange={set} /></Field>
            <Field label="Industry"><Select name="industry" options={SECTORS} value={data.industry} onChange={set} /></Field>
          </div>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="skills" title="Skills" sectionRefs={sectionRefs} />
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input 
              className="ats-input" 
              placeholder="Type or select a skill…" 
              value={skillInput} 
              onChange={e => setSkillInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} 
              style={{ flex: 1 }} 
            />
            <button className="ats-btn-ghost" onClick={() => addSkill(skillInput)} style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={16} /> Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {SKILLS_OPTIONS.map(s => (
              <button key={s} type="button" onClick={() => addSkill(s)} style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', border: `1px solid ${data.skills.includes(s) ? 'var(--color-ats-accent)' : 'var(--color-ats-border)'}`, backgroundColor: data.skills.includes(s) ? 'rgba(59,130,246,0.12)' : 'transparent', color: data.skills.includes(s) ? 'var(--color-ats-accent)' : 'var(--color-ats-muted)', cursor: 'pointer' }}>
                {s}
              </button>
            ))}
          </div>
          {data.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.skills.map(s => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.625rem', borderRadius: '9999px', backgroundColor: 'var(--color-ats-accent)', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                  {s} <button type="button" onClick={() => set('skills', data.skills.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0, display: 'flex' }}><XIcon size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Job Preference */}
        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="preference" title="Job Preference" sectionRefs={sectionRefs} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Field label="Seeking">
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['Job', 'Internship', 'Both'].map(t => (
                  <button key={t} type="button" onClick={() => set('seeking', t)} style={{ padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: `2px solid ${data.seeking === t ? 'var(--color-ats-accent)' : 'var(--color-ats-border)'}`, backgroundColor: data.seeking === t ? 'rgba(59,130,246,0.1)' : 'transparent', color: data.seeking === t ? 'var(--color-ats-accent)' : 'var(--color-ats-muted)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <Field label="Preferred Sector"><Select name="preferredSector" options={SECTORS} value={data.preferredSector} onChange={set} /></Field>
              <Field label="Preferred City">
                <select 
                  className="ats-input" 
                  value={data.preferredCity} 
                  onChange={e => set('preferredCity', e.target.value)} 
                  disabled={!data.nationalityCode}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select City…</option>
                  {data.nationalityCode && City.getCitiesOfCountry(data.nationalityCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Available From"><Input name="availableFrom" type="date" value={data.availableFrom} onChange={set} /></Field>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div style={{ marginBottom: '3rem' }}>
          <SectionHeader id="documents" title="Documents" sectionRefs={sectionRefs} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* CV Upload */}
            <div>
              <label className="ats-label">CV / Resume (PDF)</label>
              <div style={{ position: 'relative', border: '2px dashed var(--color-ats-border)', borderRadius: '0.75rem', padding: '1.75rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s', marginTop: '0.375rem' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-ats-accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-ats-border)')}
              >
                <input type="file" accept=".pdf" onChange={e => e.target.files?.[0] && set('cv', e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <UploadCloud size={24} style={{ color: 'var(--color-ats-muted)', margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: data.cv ? 'var(--color-ats-accent)' : 'var(--color-ats-text)', margin: 0 }}>{data.cv ? data.cv.name : 'Upload PDF'}</p>
              </div>
            </div>
            {/* Photo Upload */}
            <div>
              <label className="ats-label">Profile Photo (JPG/PNG)</label>
              <div style={{ position: 'relative', border: '2px dashed var(--color-ats-border)', borderRadius: '0.75rem', padding: '1.75rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s', marginTop: '0.375rem', overflow: 'hidden' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-ats-accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-ats-border)')}
              >
                <input type="file" accept=".jpg,.jpeg,.png" onChange={e => e.target.files?.[0] && set('photo', e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                {data.photo ? (
                  <img src={URL.createObjectURL(data.photo)} alt="preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto' }} />
                ) : (
                  <>
                    <UploadCloud size={24} style={{ color: 'var(--color-ats-muted)', margin: '0 auto 0.75rem' }} />
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-ats-text)', margin: 0 }}>Upload Photo</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button className="ats-btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700 }} onClick={handleSubmit}>
          Submit &amp; Go to Dashboard →
        </button>
      </div>
    </div>
  );
}
