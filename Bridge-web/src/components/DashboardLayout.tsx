import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { authApi } from '../services/api';

interface DashboardLayoutProps {
  role: 'seeker' | 'recruiter' | 'admin';
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    authApi.getMe().then(setUser).catch(() => {});
  }, []);

  const userName = user?.name || 'User';
  const roleLabel = role === 'seeker' ? 'Job Seeker' : role === 'recruiter' ? 'Recruiter' : 'Admin';

  return (
    <div className="ats-root">
      <Sidebar role={role} />
      <div className="ats-main">
        <Outlet context={{ user, setUser }} />
      </div>
    </div>
  );
}
