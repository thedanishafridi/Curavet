import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { CaseCard } from '../components/CaseCard';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Heart, ShieldCheck, TrendingUp, Clock, ArrowRight, Star, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  const [featuredCases, setFeaturedCases] = useState<any[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await api.get('/cases');
        // Show only active cases on landing
        const active = (response.data.cases || []).filter((c: any) => c.status === 'active');
        setFeaturedCases(active.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch cases:', err);
      }
    };
    fetchCases();
  }, []);

  const stats = [
    { label: 'Animals Helped', value: '2,841', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
    { label: 'Verified Clinics', value: '143', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'PKR Raised', value: '48.5L+', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Success Rate', value: '94%', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const howItWorks = [
    { step: '01', title: 'Browse Cases', desc: 'Discover animals in need at verified clinics across Pakistan.' },
    { step: '02', title: 'Choose & Donate', desc: 'Select an amount and pay securely via mock gateway.' },
    { step: '03', title: 'Track Recovery', desc: 'Receive updates as vets share recovery milestones.' },
  ];

  return (
    <div className="min-h-screen bg-emerald-600/10">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1621371236495-1520d8dc72a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
            alt="Vet clinic"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-800/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-emerald-300 text-sm font-medium">Pakistan's First Vet Crowdfunding Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              Every Animal
              <br />
              <span className="text-emerald-400">Deserves</span> a
              <br />
              Fighting Chance
            </h1>
            <p className="text-lg text-emerald-100 mb-8 leading-relaxed">
              CuraVet connects generous donors with animals in critical need at verified veterinary clinics. Your donation funds life-saving treatments — and you watch them recover.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/browse"
                className="inline-flex items-center justify-center gap-2 bg-emerald-400 text-emerald-900 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-900/30 text-base"
              >
                Browse Cases <ArrowRight size={18} />
              </Link>
              <Link
                to="/vet/signup"
                className="inline-flex items-center justify-center gap-2 border-2 border-emerald-400/50 text-emerald-100 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-800 transition-all text-base"
              >
                Register Clinic
              </Link>
            </div>
          </div>
        </div>

        {/* Floating stat card */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 -mb-10">
            {stats.map((stat, i) => (
              <div key={i} className="text-center py-2">
                <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-emerald-200 mt-0.5 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar (Redundant in reference, but following parity) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.bg} rounded-3xl p-6 text-center shadow-sm border border-white/50 transition-all hover:-translate-y-1`}>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} border-2 border-white flex items-center justify-center mx-auto mb-3 shadow-inner`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Urgent Appeals</h2>
            <p className="text-gray-500 mt-2 font-medium">Animals urgently needing your support right now</p>
          </div>
          <Link to="/browse" className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm hover:bg-emerald-50 transition-all text-sm group">
            View All Cases <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCases.length > 0 ? (
            featuredCases.map(c => (
              <CaseCard key={c._id} case_={c} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100">
               <Heart size={40} className="mx-auto mb-4 text-emerald-100" />
               <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active cases at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white/50 py-24 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">How CuraVet Works</h2>
            <p className="text-gray-500 mt-3 font-medium">Saving lives in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorks.map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 transform transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-emerald-900/5">
                  <span className="text-emerald-700 font-black text-3xl">{step.step}</span>
                </div>
                <h3 className="font-black text-gray-900 text-xl mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-emerald-600 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Are you a veterinarian?</h2>
          <p className="text-emerald-100 text-lg md:text-xl mb-10 font-medium">Join CuraVet's network of verified clinics and access crowdfunding for your patients in need.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/vet/signup" className="bg-white text-emerald-700 font-black px-10 py-4 rounded-2xl hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20">
              Register Your Clinic
            </Link>
            <Link to="/vet/login" className="border-2 border-white/40 text-white font-black px-10 py-4 rounded-2xl hover:bg-emerald-500 transition-all">
              Clinic Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="CuraVet Logo"
                className="w-12 h-12 object-contain brightness-0 invert"
              />
              <div>
                <span className="font-black text-white text-2xl tracking-tight">CuraVet</span>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Healing with Heart</p>
              </div>
            </div>
            <div className="flex gap-10">
               <div>
                  <p className="text-white font-black text-sm uppercase tracking-widest mb-4">Explore</p>
                  <ul className="space-y-2 text-sm font-medium">
                    <li><Link to="/browse" className="hover:text-emerald-400 transition-colors">Browse Cases</Link></li>
                    <li><Link to="/recovery-feed" className="hover:text-emerald-400 transition-colors">Recovery Stories</Link></li>
                  </ul>
               </div>
               <div>
                  <p className="text-white font-black text-sm uppercase tracking-widest mb-4">Join Us</p>
                  <ul className="space-y-2 text-sm font-medium">
                    <li><Link to="/signup" className="hover:text-emerald-400 transition-colors">Become a Donor</Link></li>
                    <li><Link to="/vet/signup" className="hover:text-emerald-400 transition-colors">For Veterinarians</Link></li>
                  </ul>
               </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <p>© 2026 CuraVet — Empowering animal health across Pakistan.</p>
            <div className="flex gap-6">
               <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}