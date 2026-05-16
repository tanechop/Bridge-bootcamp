import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');

    // Subscribe to storage changes (for local simulations)
    const handleStorage = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-300 backdrop-blur-mdshadow-sm h-16">
      <div className="flex justify-between items-center px-6 h-full w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-manrope font-extrabold text-xl text-slate-900 tracking-tighter">
            Bridge
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-slate-900 font-semibold font-manrope text-lg tracking-tight">Home</Link>

          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button className="p-2 text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors active:scale-95">
                <Bell size={20} />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-slate-700 font-bold text-sm hover:text-surface-tint transition-colors">
                Log in
              </Link>
              <Link to="/register" className="px-5 py-2.5 hero-gradient text-white rounded-full font-bold text-sm tracking-wide shadow-md hover:brightness-110 active:scale-95 transition-all">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
