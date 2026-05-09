import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export function DonationAmount() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [case_, setCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await api.get(`/cases/${id}`);
        setCase(response.data.case);
      } catch (err) {
        console.error(err);
        toast.error('Unable to load case details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCase();
  }, [id]);

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  const handleNext = () => {
    if (finalAmount && finalAmount >= 100) {
      navigate(`/donate/${id}/payment`, { state: { amount: finalAmount, caseId: id } });
    } else {
      toast.error('Minimum donation amount is PKR 100');
    }
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    if (val) setSelectedAmount(null);
  };

  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  if (loading) return (
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
          <div className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg shadow-emerald-200 ring-4 ring-emerald-600/10">1</div>
            <span className="text-sm font-black text-emerald-700">Amount</span>
          </div>
          <div className="flex-1 h-1 bg-emerald-600/20 rounded-full mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white border-2 border-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-black">2</div>
            <span className="text-sm font-bold text-gray-400">Payment</span>
          </div>
          <div className="flex-1 h-1 bg-gray-100 rounded-full mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white border-2 border-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-black">3</div>
            <span className="text-sm font-bold text-gray-400">Done</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-emerald-900/5 overflow-hidden">
          {/* Pet Preview */}
          <div className="relative h-40 overflow-hidden">
            <img src={case_.image || case_.images?.[0] || '/placeholder-pet.jpg'} alt={case_.petName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <p className="text-white font-black text-lg">Donating to {case_.petName}</p>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{case_.location || 'Verified Clinic'}</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Heart size={20} className="text-pink-500" fill="currentColor" />
              <h2 className="font-black text-gray-900 text-xl tracking-tight">Choose Amount</h2>
            </div>

            {/* Preset amounts */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PRESET_AMOUNTS.map(amount => (
                <button
                  key={amount}
                  onClick={() => handlePresetSelect(amount)}
                  className={`py-4 rounded-2xl font-black text-sm border-2 transition-all ${
                    selectedAmount === amount
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200'
                      : 'border-gray-50 text-gray-600 bg-gray-50/50 hover:border-emerald-200 hover:text-emerald-600 hover:bg-white'
                  }`}
                >
                  PKR {amount.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mb-8">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Custom Amount (PKR)
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm group-focus-within:text-emerald-600 transition-colors">PKR</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="Minimum 100"
                  min="100"
                  className={`w-full border-2 rounded-2xl pl-16 pr-4 py-4 text-base font-black text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 transition-all ${
                    customAmount ? 'border-emerald-500 bg-white' : 'border-gray-50 bg-gray-50/50'
                  }`}
                />
              </div>
            </div>

            {/* Impact message */}
            {finalAmount && finalAmount >= 100 ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                  <strong>Your PKR {finalAmount.toLocaleString()}</strong> will cover{' '}
                  <span className="text-emerald-600 font-bold">
                    {finalAmount >= 10000 ? 'a significant portion of specialized surgery' :
                    finalAmount >= 5000 ? 'medication and diagnostic tests' :
                    finalAmount >= 2500 ? 'essential recovery supplies' :
                    'basic medical supplies'}
                  </span> for {case_.petName}. Every rupee counts!
                </p>
              </div>
            ) : (
               <div className="h-[92px] mb-8" /> 
            )}

            <button
              onClick={handleNext}
              disabled={!finalAmount || finalAmount < 100}
              className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-xl shadow-emerald-200/50"
            >
              Next Step <ArrowRight size={20} />
            </button>

            <Link
              to={`/case/${id}`}
              className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 mt-6 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={14} /> Back to case details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
