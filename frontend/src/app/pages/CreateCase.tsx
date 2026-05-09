import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { Upload, X, CheckCircle2, AlertTriangle, ArrowLeft, Camera } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

interface CaseForm {
  title: string;
  petName: string;
  petBreed: string;
  petAge: number;
  petType: string;
  urgency: 'critical' | 'high' | 'medium' | 'low' | 'stable';
  medicalHistory: string;
  description: string;
  diagnosis: string;
  treatmentPlan: string;
  goalAmount: number;
  location: string;
}

export function CreateCase() {
  const navigate = useNavigate();
  const imageRef = useRef<HTMLInputElement>(null);
  const [petImage, setPetImage] = useState<File | null>(null);
  const [petImagePreview, setPetImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CaseForm>({
    title: '',
    petName: '',
    petBreed: '',
    petAge: 0,
    petType: 'Dog',
    urgency: 'stable',
    medicalHistory: '',
    description: '',
    diagnosis: '',
    treatmentPlan: '',
    goalAmount: 50000,
    location: '',
  });

  const handleImageChange = (file: File) => {
    setPetImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPetImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      
      // 1. Upload image if selected
      if (petImage) {
        const formData = new FormData();
        formData.append('images', petImage);
        
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data.urls && uploadRes.data.urls.length > 0) {
          imageUrl = uploadRes.data.urls[0];
        }
      }

      // 2. Create the case with the image URL
      await api.post('/cases', {
        ...form,
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      });
      
      toast.success('Case submitted for review!');
      navigate('/vet/dashboard');
    } catch (err: any) {
      console.error('[CREATE_CASE_ERROR]', err);
      const msg = err.response?.data?.message || 'Failed to create case';
      const details = err.response?.data?.errors;
      
      let errorText = msg;
      if (Array.isArray(details)) {
        // Handle Zod validation errors [{ path: ['field'], message: '...' }]
        const fieldErrors = details.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        errorText = `${msg}: ${fieldErrors.join(', ')}`;
      } else if (details && typeof details === 'object') {
        // Handle object-based errors
        errorText = `${msg}: ${Object.values(details).join(', ')}`;
      }
      
      setError(errorText);
      toast.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  const formatGoal = (val: number) => {
    if (val >= 100000) return `PKR ${(val / 100000).toFixed(1)}L`;
    return `PKR ${(val / 1000).toFixed(0)}k`;
  };

  const ANIMAL_TYPES = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'];
  const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];

  return (
    <div className="flex min-h-screen bg-emerald-600/10">
      <AdminSidebar role="vet" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">Create New Case</h1>
            <p className="text-sm text-gray-500">Fill in patient details to start fundraising</p>
          </div>
        </div>

        <div className="p-6 max-w-3xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pet Photo Upload */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Camera size={20} className="text-emerald-600" />
                 Pet Photo
              </h2>
              <div
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
                onClick={() => imageRef.current?.click()}
              >
                {petImagePreview ? (
                  <div className="relative inline-block">
                    <img src={petImagePreview} alt="Pet" className="w-56 h-56 object-cover rounded-2xl mx-auto shadow-md" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPetImage(null); setPetImagePreview(null); }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload size={40} className="mx-auto mb-3 text-emerald-200 group-hover:text-emerald-500 transition-colors" />
                    <p className="text-sm font-bold text-gray-700">Drag & Drop or <span className="text-emerald-600 underline">Browse</span></p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Clear, high-quality photos help raise more funds</p>
                  </div>
                )}
                <input
                  ref={imageRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">ℹ️</span>
                 </div>
                 Basic Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Case Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Emergency Surgery for Buddy"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Pet Name
                    </label>
                    <input
                      type="text"
                      value={form.petName}
                      onChange={(e) => setForm({ ...form, petName: e.target.value })}
                      placeholder="Buddy"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Breed
                    </label>
                    <input
                      type="text"
                      value={form.petBreed}
                      onChange={(e) => setForm({ ...form, petBreed: e.target.value })}
                      placeholder="Golden Retriever"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={form.petAge || ''}
                      onChange={(e) => setForm({ ...form, petAge: parseFloat(e.target.value) || 0 })}
                      placeholder="3"
                      required
                      min="0"
                      step="0.5"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Pet Type</label>
                    <select
                      value={form.petType}
                      onChange={(e) => setForm({ ...form, petType: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all bg-white appearance-none cursor-pointer"
                    >
                      {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">City</label>
                    <select
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Select City</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Urgency
                    </label>
                    <select
                      value={form.urgency}
                      onChange={(e) => setForm({ ...form, urgency: e.target.value as any })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all bg-white appearance-none cursor-pointer"
                    >
                      <option value="stable">Stable</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Details */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🔬</span>
                 </div>
                 Medical Details
              </h2>
              <div className="space-y-5">
                {[
                  { field: 'description', label: 'Case Summary', placeholder: 'Briefly describe the animal and its current situation...' },
                  { field: 'medicalHistory', label: 'Medical History', placeholder: 'Previous health conditions, vaccinations, medications...' },
                  { field: 'diagnosis', label: 'Clinical Diagnosis', placeholder: 'What did the examination reveal?' },
                  { field: 'treatmentPlan', label: 'Proposed Treatment', placeholder: 'Proposed surgery, medications, follow-up care...' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      {label}
                    </label>
                    <textarea
                      value={form[field as keyof CaseForm] as string}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      placeholder={placeholder}
                      rows={3}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Funding Goal */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">💰</span>
                 </div>
                 Funding Goal
              </h2>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Amount</span>
                <span className="text-2xl font-black text-emerald-600">{formatGoal(form.goalAmount)}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={form.goalAmount}
                onChange={(e) => setForm({ ...form, goalAmount: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-emerald-600 cursor-pointer mb-6"
              />
              <div className="flex flex-wrap gap-2 mb-6">
                {[10000, 25000, 50000, 75000, 100000, 150000].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setForm({ ...form, goalAmount: amount })}
                    className={`text-xs px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                      form.goalAmount === amount
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'border-gray-100 text-gray-500 hover:border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    {formatGoal(amount)}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Or enter custom amount (PKR)
                </label>
                <input
                  type="number"
                  value={form.goalAmount || ''}
                  onChange={(e) => setForm({ ...form, goalAmount: parseInt(e.target.value) || 0 })}
                  placeholder="Enter custom amount"
                  min="5000"
                  max="500000"
                  step="1000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-xl shadow-emerald-200/50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Case...
                </>
              ) : '🚀 Submit Case for Review'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
