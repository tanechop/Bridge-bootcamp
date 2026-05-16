/** Home dashboard path for a backend `User.role` value. */
export function getDashboardPathForRole(role: string | undefined | null): string {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Recruiter':
      return '/recruiter/dashboard';
    case 'Job Seeker':
    case 'Intern':
    case 'Intern Seeker':
    default:
      return '/seeker/dashboard';
  }
}
