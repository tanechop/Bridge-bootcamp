import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

interface AccordionSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function SystemSettings() {
  const [open, setOpen] = useState<string | null>('payment');
  const [toasts, setToasts] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    orangeNumber: '+237 655 123 456', mtnNumber: '+237 670 987 654', fee: '2000',
    cvApproval: true,
    seekerReg: true, recruiterReg: true, internReg: true,
    notifyPayment: true, notifyCV: true, notifyReg: true,
  });

  const set = (k: string, v: any) => setSettings(prev => ({ ...prev, [k]: v }));
  const save = (section: string) => {
    const ts = `${section} saved!`;
    setToasts(prev => [...prev, ts]);
    setTimeout(() => setToasts(prev => prev.filter(t => t !== ts)), 2500);
  };

  const Toggle = ({ k, label }: { k: string; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--color-ats-border)' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--color-ats-text)' }}>{label}</span>
      <button
        onClick={() => set(k, !(settings as any)[k])}
        style={{ width: 44, height: 24, borderRadius: '9999px', border: 'none', cursor: 'pointer', backgroundColor: (settings as any)[k] ? 'var(--color-ats-accent)' : 'var(--color-ats-border)', position: 'relative', transition: 'background-color 0.2s' }}
      >
        <span style={{ position: 'absolute', top: 3, left: (settings as any)[k] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', display: 'block' }} />
      </button>
    </div>
  );

  const sections: AccordionSection[] = [
    {
      id: 'payment', title: 'Payment Settings',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label className="ats-label">Orange Money Number</label><input className="ats-input" value={settings.orangeNumber} onChange={e => set('orangeNumber', e.target.value)} /></div>
          <div><label className="ats-label">MTN Money Number</label><input className="ats-input" value={settings.mtnNumber} onChange={e => set('mtnNumber', e.target.value)} /></div>
          <div><label className="ats-label">Application Fee (XAF)</label><input className="ats-input" type="number" value={settings.fee} onChange={e => set('fee', e.target.value)} /></div>
        </div>
      ),
    },
    {
      id: 'access', title: 'Access Control',
      content: <Toggle k="cvApproval" label="Require admin approval for CV visibility" />,
    },
    {
      id: 'registration', title: 'Registration Control',
      content: (
        <div>
          <Toggle k="seekerReg" label="Allow new Job Seeker registrations" />
          <Toggle k="recruiterReg" label="Allow new Recruiter registrations" />
          <Toggle k="internReg" label="Allow new Intern registrations" />
        </div>
      ),
    },
    {
      id: 'notifications', title: 'Email Notifications',
      content: (
        <div>
          <Toggle k="notifyPayment" label="Payment received" />
          <Toggle k="notifyCV" label="CV uploaded" />
          <Toggle k="notifyReg" label="New registration" />
        </div>
      ),
    },
    {
      id: 'account', title: 'Admin Account',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div><label className="ats-label">Current Password</label><input className="ats-input" type="password" placeholder="••••••••" /></div>
            <div><label className="ats-label">New Password</label><input className="ats-input" type="password" placeholder="••••••••" /></div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="ats-root">
      <Sidebar role="admin" />
      <div className="ats-main">
        <TopBar userName="Admin" role="Admin" />
        <div style={{ padding: '2rem', maxWidth: 760 }}>
          <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ats-text)', marginBottom: '1.5rem' }}>System Settings</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {sections.map(s => {
              const isOpen = open === s.id;
              return (
                <div key={s.id} className="ats-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : s.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ats-text)', fontWeight: 600, fontSize: '0.9rem' }}
                  >
                    {s.title}
                    <span style={{ color: 'var(--color-ats-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '1.2rem' }}>⌄</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--color-ats-border)' }}>
                      <div style={{ paddingTop: '1.25rem', marginBottom: '1.25rem' }}>{s.content}</div>
                      <button className="ats-btn-primary" style={{ padding: '0.625rem 1.5rem' }} onClick={() => save(s.title)}>Save Changes</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 999 }}>
        {toasts.map(t => (
          <div key={t} style={{ backgroundColor: 'var(--color-ats-success)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>✅ {t}</div>
        ))}
      </div>
    </div>
  );
}
