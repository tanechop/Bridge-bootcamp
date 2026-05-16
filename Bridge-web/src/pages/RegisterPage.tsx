import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, ShieldCheck,
  GraduationCap, Briefcase, Building2
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from '../services/api';
import { getPostAuthPath, type AuthMeUser } from '../utils/postAuthRouting';

type UserType = "Intern" | "Job Seeker" | "Company";

const InputField = ({ label, name, type = "text", placeholder, icon: Icon, value, onChange, error }: any) => (
  <div className="space-y-1.5">
    <label className="text-[11px] uppercase tracking-wider text-outline font-bold flex justify-between">
      {label}
      {error && <span className="text-red-500 normal-case tracking-normal">{error}</span>}
    </label>
    <div className="relative group">
      <input
        className={`w-full px-4 py-3 bg-surface-container-low rounded-lg border ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/5' : 'border-outline-variant/20 focus:border-surface-tint focus:ring-surface-tint/5'} focus:outline-none focus:ring-4 transition-all text-sm placeholder:text-outline-variant text-on-surface`}
        name={name}
        id={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-surface-tint" size={18} />}
    </div>
  </div>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>("Job Seeker");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = userType === "Company" ? "Company name is required" : "Full name is required";
    if (!formData.email.includes('@')) newErrors.email = "Invalid email address";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleGoogleCustomSuccess = async (tokenResponse: any) => {
    setIsLoading(true);
    try {
      const response: any = await authApi.googleLogin({ 
        accessToken: tokenResponse.access_token,
        role: userType === 'Company' ? 'Recruiter' : 'Seeker'
      } as any);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', response.user.role || (userType === 'Company' ? 'Recruiter' : 'Seeker'));

      const me = await authApi.getMe();
      navigate(getPostAuthPath(me as AuthMeUser), { replace: true });
    } catch (err: any) {
      console.error("Google Login Failed:", err);
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleCustomSuccess,
    onError: () => setErrors({ submit: "Google Login failed" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      console.log("Form Success - Redirecting to:", userType === 'Company' ? '/recruiter/questionnaire' : '/seeker/questionnaire');

      // Simulate authentication
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', userType);

      // Simulate network delay
      setTimeout(() => {
        if (userType === 'Company') {
          navigate('/recruiter/questionnaire');
        } else {
          navigate('/seeker/questionnaire');
        }
      }, 800);
    } else {
      console.warn("Form Validation Failed:", errors);
      alert("Please fill in all required fields and check for errors.");
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 bg-surface pb-12">
      <div className="w-full max-w-6xl grid md:grid-cols-12 items-start gap-12 py-12">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-5 hidden md:block sticky top-32"
        >
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] uppercase tracking-widest rounded-full font-bold">
              Join Bridge
            </span>
            <h1 className="text-5xl font-extrabold text-on-background leading-tight">
              Your career, <br /><span className="text-surface-tint">elevated.</span>
            </h1>
            <p className="text-secondary text-lg leading-relaxed">
              Connect with top opportunities tailored to your professional stage. Whether you're starting out, scaling up, or seeking talent, we've got you covered.
            </p>
            <div className="pt-8 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-surface-tint">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Verified Profiles</h3>
                  <p className="text-secondary text-sm">Every user and company is vetted for authenticity.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-7 w-full mx-auto"
        >
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-xl editorial-shadow border border-outline-variant/10">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl font-bold text-on-surface mb-2">Create Account</h2>
              <p className="text-secondary text-sm">Select your role to get started.</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>

              {/* Role Selector */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Intern', icon: GraduationCap },
                  { id: 'Job Seeker', icon: Briefcase },
                  { id: 'Company', icon: Building2 }
                ].map((role) => {
                  const isSelected = userType === role.id;
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setUserType(role.id as UserType);
                        setErrors({});
                      }}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                        ? 'border-surface-tint bg-surface-tint/5 text-surface-tint'
                        : 'border-outline-variant/20 hover:border-outline-variant/50 text-secondary bg-surface-container-low'
                        }`}
                    >
                      <Icon size={24} className="mb-2" />
                      <span className="text-xs font-bold">{role.id}</span>
                      {isSelected && (
                        <motion.div
                          layoutId="role-indicator"
                          className="absolute inset-0 border-2 border-surface-tint rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Form Fields Area */}
              <div className="space-y-6">

                {/* Common Fields */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-on-surface border-b border-outline-variant/20 pb-2">Account Details</h3>
                  <div className="space-y-4">
                    <InputField
                      label={userType === "Company" ? "Company Name" : "Full Name"}
                      name="name"
                      placeholder={userType === "Company" ? "Acme Corp" : "Alexander Hamilton"}
                      icon={userType === "Company" ? Building2 : User}
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                    />
                    <InputField label="Email Address" name="email" type="email" placeholder="alex@example.com" icon={Mail} value={formData.email} onChange={handleChange} error={errors.email} />
                  </div>
                </div>

              </div>

              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 hero-gradient text-white rounded-xl font-bold text-sm tracking-wide shadow-lg text-center active:scale-[0.98] transition-all hover:brightness-110 flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    `Create ${userType} Account`
                  )}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface-container-lowest px-2 text-outline font-bold">Or continue with</span>
                  </div>
                </div>


                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="w-full py-3.5 bg-surface-container-low border border-outline-variant/20 rounded-xl font-bold text-sm text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center space-x-3 active:scale-[0.98]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.85 2.21c1.67-1.55 2.63-3.83 2.63-6.54z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.85-2.21c-.79.53-1.8.84-3.11.84-2.39 0-4.41-1.61-5.13-3.79l-2.94 2.29C2.43 15.48 5.48 18 9 18z" fill="#34A853" />
                    <path d="M3.87 10.66c-.19-.56-.3-1.15-.3-1.66s.11-1.15.3-1.66l-2.94-2.29C.46 6.04 0 7.47 0 9s.46 2.96 1.13 3.96l2.74-2.3z" fill="#FBBC05" />
                    <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.47.8 11.43 0 9 0 5.48 0 2.43 2.52 1.13 5.96l2.94 2.29C4.79 5.2 6.81 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-secondary text-xs">
                  Already have an account?
                  <Link to="/login" className="text-surface-tint font-bold hover:underline underline-offset-4 ml-1">Log In</Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}