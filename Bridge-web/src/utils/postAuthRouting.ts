import { getDashboardPathForRole } from './dashboardForRole';

/** `/auth/me` shape used for onboarding checks */
export type AuthMeUser = {
  role?: string;
  seekerProfile?: {
    city?: string | null;
    title?: string | null;
    skills?: string[] | null;
  } | null;
  recruiterProfile?: {
    company?: string | null;
  } | null;
};

export function isSeekerLikeRole(role: string | undefined | null): boolean {
  const r = role ?? '';
  return r === 'Job Seeker' || r === 'Intern' || r === 'Intern Seeker';
}

/** True when seeker/intern should complete the seeker questionnaire */
export function seekerQuestionnaireIncomplete(me: AuthMeUser): boolean {
  if (!isSeekerLikeRole(me.role)) return false;
  const p = me.seekerProfile;
  if (!p) return true;
  if (!String(p.city ?? '').trim()) return true;
  if (!String(p.title ?? '').trim()) return true;
  if (!Array.isArray(p.skills) || p.skills.length === 0) return true;
  return false;
}

/** True when recruiter should complete the recruiter questionnaire */
export function recruiterQuestionnaireIncomplete(me: AuthMeUser): boolean {
  if (me.role !== 'Recruiter') return false;
  const p = me.recruiterProfile;
  if (!p) return true;
  if (!String(p.company ?? '').trim()) return true;
  return false;
}

/**
 * First destination after login or register: questionnaire if profile is incomplete,
 * otherwise role dashboard. Admins go straight to the admin dashboard.
 */
export function getPostAuthPath(me: AuthMeUser): string {
  const role = me.role ?? '';
  if (role === 'Admin') {
    return getDashboardPathForRole(role);
  }
  if (role === 'Recruiter') {
    return recruiterQuestionnaireIncomplete(me) ? '/recruiter/questionnaire' : getDashboardPathForRole(role);
  }
  if (isSeekerLikeRole(role)) {
    return seekerQuestionnaireIncomplete(me) ? '/seeker/questionnaire' : getDashboardPathForRole(role);
  }
  return getDashboardPathForRole(role);
}
