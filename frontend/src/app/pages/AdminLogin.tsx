import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, Mail, AlertTriangle } from 'lucide-react';

export function AdminLogin() {
  const { user, login, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Security: If already logged in as a non-admin, kick them out
  useEffect(() => {
    if (isLoggedIn && user && user.role !== 'admin') {
      logout();
      setError('Access Denied: You were logged in with a non-admin account.');
    }
  }, [isLoggedIn, user, logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login({ email: form.email, password: form.password });
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // If not an admin, log them out immediately and show error
        logout();
        setError('Access Denied: You do not have administrator privileges.');
      }
    } catch (err: any) {
      console.error('[ADMIN_LOGIN_ERROR]', err);
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950/95 flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/20 via-emerald-950/95 to-emerald-950" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/logo.png"
              alt="CuraVet Logo"
              className="w-16 h-16 object-contain"
            />
            <span className="text-2xl font-black text-white">CuraVet</span>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          {/* Admin Warning Badge */}
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-6">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-bold text-sm">ADMIN PORTAL</p>
              <p className="text-amber-400/70 text-xs">Restricted access. Authorized personnel only.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Admin Sign In</h1>
              <p className="text-gray-500 text-sm">Access the admin control panel</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Admin Email <span className="text-gray-500 text-xs">(email)</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@curavel.pk"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password <span className="text-gray-500 text-xs">(password)</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Login to Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-600 text-xs">Not an admin?</p>
            <Link to="/login" className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
              Go to Donor Login →
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Demo: admin@curavet.com / admin123
        </p>
      </div>
    </div>
  );
}
