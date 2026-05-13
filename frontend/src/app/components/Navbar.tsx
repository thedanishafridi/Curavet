import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Bell, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export function Navbar() {
  const { isLoggedIn, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeDonations, setActiveDonations] = useState(0);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (role === 'donor') {
      api.get('/donations/my')
        .then((res: any) => setActiveDonations(res.data?.length || 0))
        .catch((err: any) => console.error('Failed to fetch donations for badge', err));
    }
  }, [role]);

  useEffect(() => {
    const handleScrollClose = () => {
      if (mobileOpen) setMobileOpen(false);
      if (dropdownOpen) setDropdownOpen(false);
    };

    if (mobileOpen || dropdownOpen) {
      window.addEventListener('scroll', handleScrollClose, { passive: true });
      return () => window.removeEventListener('scroll', handleScrollClose);
    }
  }, [mobileOpen, dropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setShowNavbar(true);
      }
      else if (currentScrollY > lastScrollY && currentScrollY > 80 && !mobileOpen) {
        setShowNavbar(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, mobileOpen]);

  const getDashboardPath = () => {
    if (!role) return '/browse';
    if (role === 'donor') return '/profile';
    if (role === 'vet' || role === 'clinic') return '/vet/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/browse';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-transform duration-300 ${
      showNavbar ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.png"
              alt="CuraVet Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl font-black text-emerald-600 tracking-tight">CuraVet</span>
          </Link>

          {/* Desktop Nav Tabs - Centered */}
          <div className="hidden md:flex items-center h-full absolute left-1/2 -translate-x-1/2">
            <Link
              to="/browse"
              className={`h-full flex items-center px-6 text-[15px] font-semibold transition-colors relative ${
                isActive('/browse')
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Browse Cases
              {isActive('/browse') && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
              )}
            </Link>
            <Link
              to="/recovery-feed"
              className={`h-full flex items-center px-6 text-[15px] font-semibold transition-colors relative ${
                isActive('/recovery-feed')
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Recovery Feed
              {isActive('/recovery-feed') && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
              )}
            </Link>
          </div>

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors relative"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                    <span className="text-emerald-700 font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{(user?.name || 'User').split(' ')[0]}</span>
                  {role === 'donor' && activeDonations > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                  )}
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to={getDashboardPath()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserIcon size={14} /> My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Tabs - Always visible on browse/recovery pages */}
      {(isActive('/browse') || isActive('/recovery-feed')) && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex">
            <Link
              to="/browse"
              className={`flex-1 text-center py-4 text-[15px] font-semibold transition-colors relative ${
                isActive('/browse')
                  ? 'text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              Browse Cases
              {isActive('/browse') && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
              )}
            </Link>
            <Link
              to="/recovery-feed"
              className={`flex-1 text-center py-4 text-[15px] font-semibold transition-colors relative ${
                isActive('/recovery-feed')
                  ? 'text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              Recovery Feed
              {isActive('/recovery-feed') && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
              )}
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4">
          <div className="flex flex-col gap-2">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="text-sm text-red-600 font-medium py-2">Sign Out</button>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 font-medium py-2" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/signup" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-full text-center font-medium" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}