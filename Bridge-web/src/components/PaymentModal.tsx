import React, { useState } from 'react';
import { UploadCloud, CheckCircle, X } from 'lucide-react';
import { applicationsApi } from '../services/api';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobTitle: string;
  jobId: number;
}

export default function PaymentModal({ open, onClose, onSuccess, jobTitle, jobId }: PaymentModalProps) {
  const [method, setMethod] = useState<'orange' | 'mtn' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!file || !method) return;
    setLoading(true);
    setError(null);
    try {
      const res = await applicationsApi.apply(jobId, method);
      setPaymentReference(res.paymentReference);
      setSubmitted(true);
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMethod(null);
    setFile(null);
    setSubmitted(false);
    setPaymentReference(null);
    setError(null);
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{ backgroundColor: 'var(--color-ats-card)', border: '1px solid var(--color-ats-border)', borderRadius: '1rem', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--color-ats-border)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-ats-text)', margin: '0 0 0.25rem' }}>
              Complete Payment to Apply
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', margin: 0 }}>
              Pay via Mobile Money to unlock your application for <strong style={{ color: 'var(--color-ats-text)' }}>{jobTitle}</strong>
            </p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ats-muted)', padding: '0.25rem', flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239,68,68,0.12)', color: 'var(--color-ats-danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          {!submitted ? (
            <>
              <div>
                <label className="ats-label">Select Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginTop: '0.5rem' }}>
                  {[
                    { id: 'orange' as const, name: 'Orange Money', number: '+237 655 123 456', color: '#FF6600' },
                    { id: 'mtn' as const, name: 'MTN Money', number: '+237 670 987 654', color: '#FFCB00' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      style={{
                        padding: '1.25rem', borderRadius: '0.75rem', textAlign: 'left', cursor: 'pointer',
                        backgroundColor: method === m.id ? 'rgba(59,130,246,0.1)' : 'var(--color-ats-surface)',
                        border: `2px solid ${method === m.id ? 'var(--color-ats-accent)' : 'var(--color-ats-border)'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: m.color, marginBottom: '0.75rem' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-ats-text)', marginBottom: '0.375rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', fontFamily: 'monospace' }}>{m.number}</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ats-accent)', marginTop: '0.5rem' }}>2,000 XAF</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-ats-muted)', lineHeight: 1.5 }}>
                After you submit your proof of payment, the app will register your application and show a <strong style={{ color: 'var(--color-ats-text)' }}>unique payment reference</strong>. Include that reference in your mobile-money transfer message so admins can match your payment.
              </div>

              <div>
                <label className="ats-label">Upload Payment Proof</label>
                <div style={{ position: 'relative', border: '2px dashed var(--color-ats-border)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-ats-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-ats-border)')}
                >
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                  <UploadCloud size={28} style={{ color: 'var(--color-ats-muted)', margin: '0 auto 0.75rem' }} />
                  {file ? (
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ats-accent)' }}>{file.name}</p>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ats-text)', marginBottom: '0.25rem' }}>Click or drop to upload</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-ats-muted)' }}>JPG, PNG, PDF accepted</p>
                    </>
                  )}
                </div>
              </div>

              <button
                className="ats-btn-primary"
                style={{ width: '100%', padding: '0.875rem', fontSize: '0.9rem', opacity: (!file || !method || loading) ? 0.5 : 1, cursor: (!file || !method || loading) ? 'not-allowed' : 'pointer' }}
                disabled={!file || !method || loading}
                onClick={handleSubmit}
              >
                {loading ? 'Submitting...' : 'Submit Payment Proof'}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle size={56} style={{ color: 'var(--color-ats-success)', margin: '0 auto 1.25rem' }} />
              <h3 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-ats-text)', marginBottom: '0.75rem' }}>
                Application submitted
              </h3>
              {paymentReference && (
                <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-ats-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Your payment reference</div>
                  <div style={{ backgroundColor: 'rgba(59,130,246,0.08)', border: '1px dashed var(--color-ats-accent)', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-ats-accent)', letterSpacing: '0.04em' }}>
                    {paymentReference}
                  </div>
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--color-ats-muted)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                The admin will validate your payment within 24 hours. You will see status updates under My Applications.
              </p>
              <button className="ats-btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={handleClose}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
