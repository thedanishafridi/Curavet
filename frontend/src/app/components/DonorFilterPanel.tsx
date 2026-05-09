import { X, SlidersHorizontal, Search } from 'lucide-react';

export const ANIMAL_TYPES = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'];
export const CITIES = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];

interface DonorFilterPanelProps {
  selectedUrgency: string;
  setSelectedUrgency: (u: string) => void;
  selectedAnimals: string[];
  toggleAnimal: (t: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  hasFilters: boolean;
  clearFilters: () => void;
  search: string;
  setSearch: (s: string) => void;
}

export function DonorFilterPanel({
  selectedUrgency,
  setSelectedUrgency,
  selectedAnimals,
  toggleAnimal,
  selectedCity,
  setSelectedCity,
  hasFilters,
  clearFilters,
  search,
  setSearch
}: DonorFilterPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-emerald-600" />
          Filters
        </h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-red-500 font-medium flex items-center gap-1 hover:text-red-700">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Urgency */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Urgency</p>
        <div className="space-y-2">
          {(['All', 'critical', 'high', 'medium', 'low', 'stable'] as const).map(u => (
            <label key={u} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedUrgency === u ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                }`}
                onClick={() => setSelectedUrgency(u)}
              >
                {selectedUrgency === u && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-700 flex items-center gap-2 group-hover:text-emerald-600 transition-colors capitalize">
                {u === 'critical' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                {u === 'high' && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                {u === 'medium' && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
                {u === 'low' && <span className="w-2 h-2 rounded-full bg-green-400" />}
                {u === 'stable' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                {u}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Animal Type */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Animal Type</p>
        <div className="space-y-2">
          {ANIMAL_TYPES.map(type => (
            <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  selectedAnimals.includes(type) ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                }`}
                onClick={() => toggleAnimal(type)}
              >
                {selectedAnimals.includes(type) && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700 group-hover:text-emerald-600 transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</p>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none bg-white"
        >
          {CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
