import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Heart, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

type LoginType = 'donor' | 'clinic';

export function DonorLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loginType, setLoginType] = useState<LoginType>('donor');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'clinic') {
      setLoginType('clinic');
    }
  }, [searchParams]);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login({ email: form.email, password: form.password });
      toast.success(`Welcome back, ${user.name}!`);
      
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'vet' || user.role === 'clinic') {
        navigate('/vet/dashboard');
      } else {
        navigate('/browse');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600/10 via-white to-emerald-600/15 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-emerald-200/50 flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3 border border-emerald-50">
               <img
                 src="/logo.png"
                 alt="CuraVet Logo"
                 className="w-12 h-12 object-contain"
               />
            </div>
            <div className="text-left">
               <span className="text-3xl font-black text-gray-900 tracking-tight block">CuraVet</span>
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block -mt-1">Healing with Heart</span>
            </div>
          </Link>
          <p className="text-gray-500 font-medium text-sm mt-6">
            {loginType === 'donor' ? 'Welcome back, animal lover!' : 'Welcome back, veterinary professional!'}
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 p-10 relative overflow-hidden">
          {/* Subtle background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full -mr-16 -mt-16" />

          {/* Tab Switcher */}
          <div className="bg-gray-50 rounded-2xl p-1.5 mb-8 flex border border-gray-100 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setLoginType('donor');
                setForm({ email: '', password: '' });
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                loginType === 'donor'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Donor
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('clinic');
                setForm({ email: '', password: '' });
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                loginType === 'clinic'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Clinic
            </button>
          </div>

          <div className="flex items-center gap-3 mb-8">
            {loginType === 'donor' ? (
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center shadow-inner">
                <Heart size={20} className="text-pink-500" fill="currentColor" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shadow-inner">
                <Stethoscope size={20} className="text-emerald-600" />
              </div>
            )}
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
               {loginType === 'donor' ? 'Donor Sign In' : 'Clinic Sign In'}
            </h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl px-4 py-3.5 mb-8 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={loginType === 'donor' ? 'you@example.com' : 'clinic@example.com'}
                  required
                  className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-14 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-black py-4.5 rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-base shadow-xl shadow-emerald-200/50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Don't have an account?{' '}
              {loginType === 'donor' ? (
                <Link to="/signup" className="text-emerald-600 font-black hover:text-emerald-700 border-b-2 border-emerald-100 hover:border-emerald-600 transition-all">Sign Up</Link>
              ) : (
                <Link to="/vet/signup" className="text-emerald-600 font-black hover:text-emerald-700 border-b-2 border-emerald-100 hover:border-emerald-600 transition-all">
                  Register Clinic
                </Link>
              )}
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
           <Link to="/admin/login" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
             Admin Portal <ArrowRight size={12} />
           </Link>
        </div>
      </div>
    </div>
  );
}

// Internal helper for ArrowRight since I didn't import it
function ArrowRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}