import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import api from '../../services/api';
import { ArrowLeft, Lock, CreditCard, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) {
    const month = parseInt(digits.slice(0, 2), 10);
    if (month < 1 || month > 12) return digits.slice(0, 1);
  }
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export function DonationPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const amount = (location.state as any)?.amount ?? 1000;

  const [form, setForm] = useState({
    card_number: '',
    card_name: '',
    expiry: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [case_, setCase] = useState<any>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await api.get(`/cases/${id}`);
        setCase(response.data.case);
      } catch (err) {
        console.error(err);
        toast.error('Unable to load case details');
      } finally {
        setPageLoading(false);
      }
    };
    if (id) fetchCase();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/donations', {
        caseId: id,
        amount,
        message: `Supported ${case_?.petName || 'animal'} with a donation.`,
      });

      toast.success('Donation successful!');
      navigate('/donate/success', {
        state: {
          amount,
          petName: case_?.petName,
          caseId: id,
          raisedAmount: case_?.raisedAmount + amount,
          goalAmount: case_?.goalAmount,
        },
      });
    } catch (error) {
      console.error('Error processing donation:', error);
      toast.error('Failed to process donation. Please try again.');
      setLoading(false);
    }
  };

  const cardType = form.card_number.startsWith('4') ? 'visa' :
    form.card_number.startsWith('5') ? 'mastercard' : null;

  if (pageLoading) return (
    <div className="min-h-screen bg-emerald-600/10 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!case_) return (
    <div className="min-h-screen bg-emerald-600/10 flex items-center justify-center">
       <div className="text-center">
         <p className="text-gray-500 mb-4 font-bold">Case not found</p>
         <Link to="/browse" className="text-emerald-600 font-black">← Back to cases</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-emerald-600/10">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-2 border-emerald-200">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-sm font-bold text-emerald-600/60 line-through">Amount</span>
          </div>
          <div className="flex-1 h-1 bg-emerald-500 rounded-full mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg shadow-emerald-200 ring-4 ring-emerald-600/10">2</div>
            <span className="text-sm font-black text-emerald-700">Payment</span>
          </div>
          <div className="flex-1 h-1 bg-gray-100 rounded-full mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white border-2 border-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-black">3</div>
            <span className="text-sm font-bold text-gray-400">Done</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-4 mb-6 shadow-sm shadow-emerald-900/5">
          <div className="flex items-center gap-4">
            <img src={case_.image || case_.images?.[0] || '/placeholder-pet.jpg'} alt={case_.petName} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Supporting miracle</p>
              <p className="font-black text-gray-900 truncate">{case_.petName}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{case_.location || 'Verified Clinic'}</p>
            </div>
            <div className="text-right border-l border-gray-100 pl-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
              <p className="font-black text-emerald-700 text-xl leading-tight">PKR {amount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-emerald-900/5 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-emerald-600" />
              <h2 className="font-black text-gray-900 text-xl tracking-tight">Secure Payment</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <ShieldCheck size={12} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">256-bit SSL</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Number */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Card Number
              </label>
              <div className="relative group">
                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  name="card_number"
                  value={form.card_number}
                  onChange={(e) => setForm({ ...form, card_number: formatCardNumber(e.target.value) })}
                  placeholder="0000 0000 0000 0000"
                  required
                  className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-16 py-4 text-base font-black text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all tracking-widest font-mono"
                />
                {cardType && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {cardType === 'visa' ? (
                      <span className="bg-[#1A1F71] text-white text-[10px] font-black px-2 py-1 rounded">VISA</span>
                    ) : (
                      <div className="flex">
                        <div className="w-6 h-6 bg-[#EB001B] rounded-full opacity-90" />
                        <div className="w-6 h-6 bg-[#F79E1B] rounded-full -ml-3 opacity-90" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card Name */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Name on Card
              </label>
              <input
                type="text"
                autoComplete="cc-name"
                data-lpignore="true"
                value={form.card_name}
                onChange={(e) => setForm({ ...form, card_name: e.target.value })}
                placeholder="AHMED MALIK"
                required
                className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl px-5 py-4 text-sm font-black text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all uppercase"
              />
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Expiry Date
                </label>
                <div className="relative group">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="expiry"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                    placeholder="MM/YY"
                    required
                    className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-11 pr-4 py-4 text-sm font-black text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  CVV
                </label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="password"
                    name="cvv"
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="•••"
                    required
                    maxLength={4}
                    className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-11 pr-4 py-4 text-sm font-black text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3 border border-gray-100">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                 <ShieldCheck size={16} className="text-emerald-600" />
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">Your payment is secured with bank-grade encryption. We never store your full card details or CVV on our servers.</p>
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-xl shadow-emerald-200/50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Miracle...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Donate PKR {amount.toLocaleString()}
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 mt-6 uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> Back to amount
          </button>
        </div>
      </div>
    </div>
  );
}
