import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { CheckCircle2, Share2, Twitter, Facebook, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function DonationSuccess() {
  const location = useLocation();
  const { amount, petName, caseId, raisedAmount, goalAmount } = (location.state as any) ?? { 
    amount: 1000, 
    petName: 'the animal', 
    caseId: null,
    raisedAmount: 0,
    goalAmount: 10000
  };
  
  const progressPercentage = Math.min(100, Math.round(((raisedAmount || 0) / (goalAmount || 1)) * 100));

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const messages = [
    `You just helped ${petName} get one step closer to recovery!`,
    'Your kindness will be remembered.',
    'Every rupee makes a difference.',
    'Miracles happen because of people like you.',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600/10 via-white to-emerald-600/15">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200 ring-8 ring-emerald-600/10"
        >
          <CheckCircle2 size={48} className="text-white" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl font-black text-gray-900 mb-2">Miracle Sent!</h1>
          <p className="text-gray-500 text-lg mb-1 font-medium">Thank you for your life-saving gift</p>
          <p className="text-emerald-600 font-black text-3xl mb-8">PKR {amount.toLocaleString()}</p>
        </motion.div>

        {/* Dynamic Progress Bar */}
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.4 }}
           className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-emerald-900/5 p-8 mb-6 text-left"
        >
          <div className="flex items-center justify-between mb-3">
             <h3 className="font-black text-gray-900 text-lg">Impact for {petName}</h3>
             <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{progressPercentage}% Funded</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
            <motion.div 
              className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full shadow-lg" 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Raised so far</p>
              <p className="font-black text-emerald-600">PKR {raisedAmount?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Funding Goal</p>
              <p className="font-bold text-gray-900">PKR {goalAmount?.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-emerald-900/5 p-6 mb-6 text-left"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
              <Heart size={24} className="text-pink-500" fill="currentColor" />
            </div>
            <div>
              <p className="font-black text-gray-900 leading-tight">{messages[0]}</p>
              <p className="text-sm text-gray-500 font-medium mt-1">{messages[1]}</p>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 text-xs text-emerald-700 font-bold border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 size={14} />
            A confirmation receipt has been sent to your email.
          </div>
        </motion.div>

        {/* Share Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-emerald-900/5 p-8 mb-8"
        >
          <p className="font-black text-gray-800 mb-5 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
            <Share2 size={14} className="text-emerald-600" />
            Share to Inspire Others
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => toast.success('Link copied for Twitter!')}
              className="flex items-center justify-center gap-2 bg-[#1DA1F2] text-white font-black py-3.5 rounded-2xl hover:opacity-90 transition-all text-xs shadow-lg shadow-blue-200"
            >
              <Twitter size={14} />
              Twitter
            </button>
            <button
              type="button"
              onClick={() => toast.success('Link copied for Facebook!')}
              className="flex items-center justify-center gap-2 bg-[#1877F2] text-white font-black py-3.5 rounded-2xl hover:opacity-90 transition-all text-xs shadow-lg shadow-blue-200"
            >
              <Facebook size={14} />
              Facebook
            </button>
            <button
              type="button"
              onClick={() => toast.success('Link copied for WhatsApp!')}
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-black py-3.5 rounded-2xl hover:opacity-90 transition-all text-xs shadow-lg shadow-green-200"
            >
              <span className="text-sm">📱</span>
              WhatsApp
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {caseId && (
            <Link
              to={`/case/${caseId}`}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-black py-4.5 rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
            >
              View Progress <ArrowRight size={18} />
            </Link>
          )}
          <Link
            to="/browse"
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-700 font-black py-4.5 rounded-3xl hover:bg-gray-50 transition-all"
          >
            Browse More
          </Link>
        </motion.div>

        <Link to="/recovery-feed" className="inline-block mt-8 text-xs font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 border-b-2 border-emerald-100 hover:border-emerald-600 transition-all">
          Follow recovery updates →
        </Link>
      </div>
    </div>
  );
}
