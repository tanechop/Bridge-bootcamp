import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, ChevronRight,
  User, Briefcase, Building2,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from '../services/api';
import { getDashboardPathForRole } from '../utils/dashboardForRole';

type RoleType = 'Admin' | 'Seeker' | 'Recruiter';

// ── Input Field ───────────────────────────────────────────────────────────────
const InputField = ({
  label,
  name,
  type = 'text',
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: React.ElementType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-[11px] uppercase tracking-wider text-outline font-bold flex justify-between">
      {label}
      {error && (
        <span className="text-red-500 normal-case tracking-normal">{error}</span>
      )}
    </label>
    <div className="relative group">
      <input
        className={`w-full px-4 py-3 bg-surface-container-low rounded-lg border ${error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/5'
            : 'border-outline-variant/20 focus:border-surface-tint focus:ring-surface-tint/5'
          } focus:outline-none focus:ring-4 transition-all text-sm placeholder:text-outline-variant text-on-surface`}
        name={name}
        id={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={type === 'password' ? 'current-password' : 'email'}
      />
      {Icon && (
        <Icon
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-surface-tint transition-colors"
          size={18}
        />
      )}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState<RoleType>('Seeker');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email address';
    if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  // ── Persist auth data helper ────────────────────────────────────────────────
  const persistAuth = (response: any) => {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', response.user.role);
  };

  // ── Email / Password Login ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response: any = await authApi.login(formData);
      persistAuth(response);

      // ✅ Go directly to the role dashboard — no questionnaire check on login
      navigate(getDashboardPathForRole(response.user.role), { replace: true });
    } catch (err: any) {
      console.error('Login Failed:', err);
      setErrors({ submit: err.message ?? 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google Login ────────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse: any) => {
    setIsLoading(true);
    try {
      const response: any = await authApi.googleLogin({
        accessToken: tokenResponse.access_token,
      });
      persistAuth(response);

      // ✅ Go directly to the role dashboard — no questionnaire check on login
      navigate(getDashboardPathForRole(response.user.role), { replace: true });
    } catch (err: any) {
      console.error('Google Login Failed:', err);
      setErrors({ submit: err.message ?? 'Google login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setErrors({ submit: 'Google Login failed. Please try again.' }),
  });

  // ── Roles config ────────────────────────────────────────────────────────────
  const ROLES: { id: RoleType; icon: React.ElementType; label: string }[] = [
    { id: 'Seeker', icon: Briefcase, label: 'Job Seeker' },
    { id: 'Recruiter', icon: Building2, label: 'Recruiter' },
    { id: 'Admin', icon: User, label: 'Admin' },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 bg-surface">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl editorial-shadow border border-outline-variant/10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-secondary text-sm">
              Select your role and sign in to your dashboard
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit} noValidate>

            {/* Role selector */}
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map(r => {
                const Icon = r.icon;
                const selected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${selected
                        ? 'border-surface-tint bg-surface-tint/5 text-surface-tint'
                        : 'border-outline-variant/20 hover:border-outline-variant/50 text-secondary bg-surface-container-low'
                      }`}
                  >
                    <Icon size={24} className="mb-2" />
                    <span className="text-xs font-bold">{r.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Fields */}
            <div className="space-y-5">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="alex@example.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              {/* Submit error */}
              {errors.submit && (
                <p className="text-red-500 text-xs text-center bg-red-500/5 border border-red-500/20 rounded-lg py-2 px-3">
                  {errors.submit}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-bold text-surface-tint hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 hero-gradient text-white rounded-full font-bold text-sm tracking-wide shadow-lg flex justify-center items-center gap-2 group transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110'
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing In…
                  </>
                ) : (
                  <>
                    Sign In as {role}
                    <ChevronRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/20" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-surface-container-lowest px-4 text-outline">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google login */}
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              disabled={isLoading}
              className="w-full py-3 bg-surface-container-low border border-outline-variant/20 rounded-full font-bold text-sm text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center space-x-3 active:scale-[0.98] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {/* Google G icon */}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.85 2.21c1.67-1.55 2.63-3.83 2.63-6.54z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.85-2.21c-.79.53-1.8.84-3.11.84-2.39 0-4.41-1.61-5.13-3.79l-2.94 2.29C2.43 15.48 5.48 18 9 18z" fill="#34A853" />
                <path d="M3.87 10.66c-.19-.56-.3-1.15-.3-1.66s.11-1.15.3-1.66l-2.94-2.29C.46 6.04 0 7.47 0 9s.46 2.96 1.13 3.96l2.74-2.3z" fill="#FBBC05" />
                <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.47.8 11.43 0 9 0 5.48 0 2.43 2.52 1.13 5.96l2.94 2.29C4.79 5.2 6.81 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Sign up link */}
            <div className="text-center pt-2">
              <p className="text-secondary text-xs">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-surface-tint font-bold hover:underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}