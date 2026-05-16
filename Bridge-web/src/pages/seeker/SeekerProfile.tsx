import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { profilesApi } from '../../services/api';

const Field = ({ label, value, editing, editKey, onChange }: { label: string; value: string; editing: boolean; editKey?: string; onChange: (k: string, v: any) => void }) => (
  <div>
    <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
    {editing && editKey ? (
      <input className="ats-input" value={value} onChange={e => onChange(editKey, e.target.value)} />
    ) : (
      <div style={{ fontSize: '0.875rem', color: 'var(--color-ats-text)' }}>{value || '—'}</div>
    )}
  </div>
);

const SectionCard = ({ title, openSection, setOpenSection, children }: { title: string; openSection: string | null; setOpenSection: (s: string | null) => void; children: React.ReactNode }) => {
  const open = openSection === title;
  return (
    <div className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setOpenSection(open ? null : title)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ats-text)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'left' }}
      >
        {title}
        <span style={{ fontSize: '1.2rem', color: 'var(--color-ats-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
      </button>
      {open && <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--color-ats-border)' }}><div style={{ paddingTop: '1.25rem' }}>{children}</div></div>}
    </div>
  );
};

export default function SeekerProfile() {
  const { user } = useOutletContext<{ user: any }>();
  const [editing, setEditing] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('Personal Info');
  const [profile, setProfile] = useState<any>(user?.seekerProfile || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user.seekerProfile || {});
    }
  }, [user]);

  const set = (k: string, v: any) => setProfile((prev: any) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      await profilesApi.updateSeeker(profile);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading profile...</div>;

  const userName = user?.name || 'User';

  return (
    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Profile Card */}
      <div className="ats-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', position: 'sticky', top: 80 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', backgroundColor: 'var(--color-ats-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
            {userName.charAt(0)}
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-ats-text)', margin: '0 0 0.25rem' }}>{userName}</h2>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--color-ats-accent)', padding: '0.2rem 0.5rem', borderRadius: '9999px', textTransform: 'uppercase' }}>Job Seeker</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', margin: '0.5rem 0 0' }}>Member since {profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-ats-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Profile Completion</div>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `conic-gradient(var(--color-ats-accent) ${profile?.profileCompletion || 0}%, var(--color-ats-border) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--color-ats-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-ats-text)' }}>
              {profile?.profileCompletion || 0}%
            </div>
          </div>
        </div>
        <button className={editing ? 'ats-btn-ghost' : 'ats-btn-primary'} style={{ width: '100%' }} onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
        {editing && (
          <button className="ats-btn-primary" style={{ width: '100%' }} onClick={handleSave}>Save Changes</button>
        )}
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SectionCard title="Personal Info" openSection={openSection} setOpenSection={setOpenSection}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Full Name" value={userName} editing={false} editKey="name" onChange={set} />
            <Field label="Email" value={user?.email || ''} editing={false} editKey="email" onChange={set} />
            <Field label="Phone" value={user?.phone || ''} editing={false} editKey="phone" onChange={set} />
            <Field label="City" value={profile?.city || ''} editing={editing} editKey="city" onChange={set} />
          </div>
        </SectionCard>

        <SectionCard title="Education" openSection={openSection} setOpenSection={setOpenSection}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Degree" value={profile?.education?.degree || ''} editing={editing} onChange={(k, v) => set('education', { ...profile.education, degree: v })} editKey="degree" />
            <Field label="Field" value={profile?.education?.field || ''} editing={editing} onChange={(k, v) => set('education', { ...profile.education, field: v })} editKey="field" />
            <Field label="Institution" value={profile?.education?.institution || ''} editing={editing} onChange={(k, v) => set('education', { ...profile.education, institution: v })} editKey="institution" />
            <Field label="Year" value={profile?.education?.gradYear || ''} editing={editing} onChange={(k, v) => set('education', { ...profile.education, gradYear: v })} editKey="gradYear" />
          </div>
        </SectionCard>

        <SectionCard title="Experience" openSection={openSection} setOpenSection={setOpenSection}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Professional Title" value={profile?.title || ''} editing={editing} editKey="title" onChange={set} />
            <Field label="Years of Experience" value={profile?.yearsExp || ''} editing={editing} editKey="yearsExp" onChange={set} />
          </div>
        </SectionCard>

        <SectionCard title="Skills" openSection={openSection} setOpenSection={setOpenSection}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {profile?.skills?.map((s: string) => (
              <span key={s} style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--color-ats-accent)', fontSize: '0.8rem', color: 'var(--color-ats-accent)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {s}
                {editing && <button type="button" onClick={() => set('skills', profile.skills.filter((x: string) => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ats-muted)', padding: 0 }}>×</button>}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Preferences" openSection={openSection} setOpenSection={setOpenSection}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Seeking" value={profile?.preferences?.seeking || ''} editing={editing} onChange={(k, v) => set('preferences', { ...profile.preferences, seeking: v })} editKey="seeking" />
            <Field label="Preferred Sector" value={profile?.preferences?.preferredSector || ''} editing={editing} onChange={(k, v) => set('preferences', { ...profile.preferences, preferredSector: v })} editKey="sector" />
            <Field label="Preferred City" value={profile?.preferences?.preferredCity || ''} editing={editing} onChange={(k, v) => set('preferences', { ...profile.preferences, preferredCity: v })} editKey="city" />
            <Field label="Available From" value={profile?.preferences?.availableFrom || ''} editing={editing} onChange={(k, v) => set('preferences', { ...profile.preferences, availableFrom: v })} editKey="availableFrom" />
          </div>
        </SectionCard>

        <SectionCard title="Documents" openSection={openSection} setOpenSection={setOpenSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: profile?.cvUploaded ? 'var(--color-ats-success)' : 'var(--color-ats-warning)', fontWeight: 600 }}>
              {profile?.cvUploaded ? 'CV Uploaded ✅' : 'No CV on file ⚠️'}
            </span>
            <button className="ats-btn-ghost" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
              {profile?.cvUploaded ? 'Re-upload CV' : 'Upload CV'}
            </button>
            {profile?.cvUploaded && <button className="ats-btn-ghost" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>Download CV</button>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
