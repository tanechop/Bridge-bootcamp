import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { authApi, profilesApi } from '../../services/api';

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
      <button onClick={() => setOpenSection(open ? null : title)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ats-text)', fontWeight: 600, fontSize: '0.9rem' }}>
        {title}
        <span style={{ fontSize: '1.2rem', color: 'var(--color-ats-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
      </button>
      {open && <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--color-ats-border)' }}><div style={{ paddingTop: '1.25rem' }}>{children}</div></div>}
    </div>
  );
};

export default function RecruiterProfile() {
  const [editing, setEditing] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('Company Info');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const me = await authApi.getMe();
        setUser(me);
        setProfile(me.recruiterProfile || {});
      } catch (error) {
        console.error("Error fetching recruiter profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const set = (k: string, v: any) => setProfile((prev: any) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      await profilesApi.updateRecruiter(profile);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <div className="ats-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading profile...</div>;

  const companyName = profile?.company || 'Company';
  const userName = user?.name || 'User';

  return (
    <div className="ats-root">
      <Sidebar role="recruiter" />
      <div className="ats-main">
        <TopBar userName={userName} role="Recruiter" />
        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Profile card */}
          <div className="ats-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', position: 'sticky', top: 80 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--color-ats-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>
              {companyName.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-ats-text)', margin: '0 0 0.25rem' }}>{companyName}</h2>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--color-ats-accent)', padding: '0.2rem 0.5rem', borderRadius: '9999px', textTransform: 'uppercase' }}>Recruiter</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', margin: '0.5rem 0 0' }}>{profile?.industry || 'Unknown Industry'} · {profile?.companySize || 'N/A'} staff</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', margin: '0.25rem 0 0' }}>Member since {profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'N/A'}</p>
            </div>
            <button className={editing ? 'ats-btn-ghost' : 'ats-btn-primary'} style={{ width: '100%' }} onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
            {editing && <button className="ats-btn-primary" style={{ width: '100%' }} onClick={handleSave}>Save Changes</button>}
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <SectionCard title="Company Info" openSection={openSection} setOpenSection={setOpenSection}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Company Name" value={profile?.company || ''} editing={editing} editKey="company" onChange={set} />
                <Field label="Industry" value={profile?.industry || ''} editing={editing} editKey="industry" onChange={set} />
                <Field label="Company Size" value={profile?.companySize || ''} editing={editing} editKey="companySize" onChange={set} />
                <Field label="Website" value={profile?.website || ''} editing={editing} editKey="website" onChange={set} />
                <Field label="Headquarters" value={profile?.hqLocation || ''} editing={editing} editKey="hqLocation" onChange={set} />
              </div>
            </SectionCard>

            <SectionCard title="Contact Details" openSection={openSection} setOpenSection={setOpenSection}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Recruiter Name" value={userName} editing={false} editKey="name" onChange={set} />
                <Field label="Email" value={user?.email || ''} editing={false} editKey="email" onChange={set} />
                <Field label="Phone" value={user?.phone || ''} editing={false} editKey="phone" onChange={set} />
              </div>
            </SectionCard>

            <SectionCard title="Account Settings" openSection={openSection} setOpenSection={setOpenSection}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-ats-muted)' }}>Change your account password below.</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div><label className="ats-label">Current Password</label><input className="ats-input" type="password" placeholder="••••••••" /></div>
                  <div><label className="ats-label">New Password</label><input className="ats-input" type="password" placeholder="••••••••" /></div>
                </div>
                <button className="ats-btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem' }}>Update Password</button>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
