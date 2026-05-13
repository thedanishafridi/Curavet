import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function DonorSignup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (!termsAccepted) newErrors.terms = 'You must accept the Terms & Conditions';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await register({ 
        name: form.full_name, 
        email: form.email, 
        password: form.password, 
        role: 'donor' 
      });
      toast.success('Account created successfully!');
      navigate('/browse');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create account.';
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      } else {
        setErrors({ api: msg });
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!form.password) return null;
    if (form.password.length < 6) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' };
    if (form.password.length < 8) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-2/4' };
    if (form.password.length < 12) return { label: 'Good', color: 'bg-emerald-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-600', width: 'w-full' };
  };

  const strength = passwordStrength();

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
          <p className="text-gray-500 font-medium text-sm mt-6">Join thousands of animal lovers saving lives</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full -mr-16 -mt-16" />

          <div className="bg-gray-50 rounded-2xl p-1.5 mb-8 flex border border-gray-100 shadow-inner">
            <button
              type="button"
              className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-200"
            >
              Donor
            </button>
            <Link
              to="/vet/signup"
              className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-gray-400 hover:text-gray-600 text-center"
            >
              Clinic
            </Link>
          </div>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Create Account</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">Start your donor journey</p>

          {errors.api && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl px-4 py-3.5 mb-8 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {errors.api}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* full_name */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  name="full_name"
                  autoComplete="name"
                  data-lpignore="true"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Ahmed Malik"
                  className={`w-full border-2 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 transition-all ${errors.full_name ? 'border-red-300 bg-red-50/20' : 'border-gray-50 bg-gray-50/50 focus:bg-white focus:border-emerald-500'}`}
                />
              </div>
              {errors.full_name && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">{errors.full_name}</p>}
            </div>

            {/* email */}
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
                  placeholder="you@example.com"
                  className={`w-full border-2 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 transition-all ${errors.email ? 'border-red-300 bg-red-50/20' : 'border-gray-50 bg-gray-50/50 focus:bg-white focus:border-emerald-500'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">{errors.email}</p>}
            </div>

            {/* password */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Create Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full border-2 rounded-2xl pl-12 pr-14 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 transition-all ${errors.password ? 'border-red-300 bg-red-50/20' : 'border-gray-50 bg-gray-50/50 focus:bg-white focus:border-emerald-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {strength && (
                <div className="mt-3 px-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className={`h-full rounded-full ${strength.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: strength.width === 'w-1/4' ? '25%' : strength.width === 'w-2/4' ? '50%' : strength.width === 'w-3/4' ? '75%' : '100%' }}
                    />
                  </div>
                  <p className={`text-[10px] mt-1.5 font-black uppercase tracking-widest ${strength.label === 'Weak' ? 'text-red-500' : strength.label === 'Fair' ? 'text-yellow-600' : 'text-emerald-600'}`}>
                    Strength: {strength.label}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">{errors.password}</p>}
            </div>

            {/* confirm_password */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full border-2 rounded-2xl pl-12 pr-14 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 transition-all ${errors.confirm_password ? 'border-red-300 bg-red-50/20' : 'border-gray-50 bg-gray-50/50 focus:bg-white focus:border-emerald-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {form.confirm_password && form.password === form.confirm_password && (
                  <CheckCircle2 size={16} className="absolute right-12 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-300" />
                )}
              </div>
              {errors.confirm_password && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">{errors.confirm_password}</p>}
            </div>

            {/* Terms & Conditions */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all shadow-sm ${
                    termsAccepted ? 'bg-emerald-600 border-emerald-600' : 'border-gray-200 bg-white group-hover:border-emerald-300'
                  }`}
                  onClick={() => setTermsAccepted(!termsAccepted)}
                >
                  {termsAccepted && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <span className="text-[11px] text-gray-500 font-bold leading-relaxed">
                  I agree to the{' '}
                  <button type="button" onClick={() => toast.info('Terms coming soon')} className="text-emerald-600 hover:underline">Terms & Conditions</button>
                  {' '}and{' '}
                  <button type="button" onClick={() => toast.info('Privacy Policy coming soon')} className="text-emerald-600 hover:underline">Privacy Policy</button>.
                </span>
              </label>
              {errors.terms && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-10">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-black py-4.5 rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-base shadow-xl shadow-emerald-200/50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : 'Start Saving Lives'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-black hover:text-emerald-700 border-b-2 border-emerald-100 hover:border-emerald-600 transition-all">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}