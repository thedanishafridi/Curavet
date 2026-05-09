import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { CaseCard } from '../components/CaseCard';
import { X, SlidersHorizontal, Search, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { DonorFilterPanel } from '../components/DonorFilterPanel';
import { toast } from 'sonner';

export function DonorFeed() {
  const [search, setSearch] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string | 'All'>('All');
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await api.get('/cases');
        setCases(data.cases || []);
      } catch (err) {
        console.error('Failed to fetch cases', err);
        toast.error('Unable to load healing opportunities');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  const toggleAnimal = (type: string) => {
    setSelectedAnimals(prev =>
      prev.includes(type) ? prev.filter(a => a !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedUrgency('All');
    setSelectedAnimals([]);
    setSelectedCity('All');
    toast.info('Filters cleared');
  };

  const filteredCases = (cases || []).filter(c => {
    if (c.status !== 'active' && c.status !== 'open') return false;
    const matchSearch =
      (c.petName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(search.toLowerCase());
    const matchUrgency = selectedUrgency === 'All' || c.urgency === selectedUrgency;
    const matchAnimal = selectedAnimals.length === 0 || selectedAnimals.includes(c.petType);
    return matchSearch && matchUrgency && matchAnimal;
  });

  const hasFilters = selectedUrgency !== 'All' || selectedAnimals.length > 0 || search !== '';

  return (
    <div className="min-h-screen bg-emerald-600/10">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-gray-100 p-8 sticky top-24">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-emerald-600" />
                    <h2 className="font-black text-gray-900 text-lg uppercase tracking-tight">Discovery</h2>
                  </div>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors">
                      Reset
                    </button>
                  )}
               </div>

               {/* Search in sidebar for premium feel */}
               <div className="mb-8">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Quick Search</label>
                  <div className="relative group">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Pet name, city..."
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                  </div>
               </div>

               <DonorFilterPanel
                selectedUrgency={selectedUrgency}
                setSelectedUrgency={setSelectedUrgency}
                selectedAnimals={selectedAnimals}
                toggleAnimal={toggleAnimal}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                hasFilters={hasFilters}
                clearFilters={clearFilters}
                search={search}
                setSearch={setSearch}
              />
            </div>
          </div>

          {/* Cases Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                   <Sparkles size={18} />
                </div>
                <div>
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Appeals</p>
                   <p className="text-lg font-black text-gray-900 tracking-tight">{filteredCases.length} Miracles Waiting</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className="bg-white rounded-[2rem] border border-gray-100 h-96 animate-pulse p-6">
                      <div className="w-full h-48 bg-gray-100 rounded-2xl mb-4" />
                      <div className="w-3/4 h-6 bg-gray-100 rounded-full mb-3" />
                      <div className="w-1/2 h-4 bg-gray-100 rounded-full mb-8" />
                      <div className="w-full h-2 bg-gray-100 rounded-full" />
                   </div>
                 ))}
              </div>
            ) : filteredCases.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {(filteredCases || []).map(c => (
                  <CaseCard key={c._id} case_={c} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-emerald-900/5">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <img
                    src="/logo.png"
                    alt="CuraVet Logo"
                    className="w-16 h-16 object-contain grayscale opacity-30"
                  />
                </div>
                <h3 className="font-black text-gray-900 text-2xl tracking-tight">No cases found</h3>
                <p className="text-gray-400 font-medium text-sm mt-2 max-w-xs mx-auto">We couldn't find any miracles matching your specific filters. Try expanding your search!</p>
                <button onClick={clearFilters} className="mt-8 bg-emerald-600 text-white font-black px-8 py-3.5 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200">
                  Show All Cases
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}