import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import api from '../../services/api';
import { Upload, X, CheckCircle2, ArrowLeft, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface UploadFile {
  file: File;
  preview: string;
}

export function RecoveryUpload() {
  const navigate = useNavigate();
  const photoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    case_id: '',
    update_text: '',
  });
  const [photo, setPhoto] = useState<UploadFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCases, setFetchingCases] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [activeCases, setActiveCases] = useState<any[]>([]);

  useEffect(() => {
    const fetchMyCases = async () => {
      try {
        const response = await api.get('/cases');
        // Filter cases for the current vet
        // Note: In production, there would be a dedicated endpoint for this
        setActiveCases(response.data.cases || []);
      } catch (err) {
        console.error('Failed to fetch cases:', err);
      } finally {
        setFetchingCases(false);
      }
    };
    fetchMyCases();
  }, []);

  const handleImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto({ file, preview: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      
      // 1. Upload image if selected
      if (photo?.file) {
        const formData = new FormData();
        formData.append('images', photo.file);
        
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data.urls && uploadRes.data.urls.length > 0) {
          imageUrl = uploadRes.data.urls[0];
        }
      }

      // 2. Post the recovery update with the image URL
      await api.post('/recovery', {
        caseId: form.case_id,
        notes: form.update_text,
        afterImageUrl: imageUrl,
      });

      setSubmitted(true);
      toast.success('Recovery update posted for review!');
      setTimeout(() => navigate('/vet/dashboard'), 2000);
    } catch (err) {
      console.error('Failed to post recovery update:', err);
      toast.error('Failed to post update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCase = activeCases.find(c => c._id === form.case_id);

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-emerald-600/10">
        <AdminSidebar role="vet" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-xl max-w-sm w-full mx-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Update Posted!</h2>
            <p className="text-gray-500 font-medium">Donors will be notified once admins approve the miracle. Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-black text-gray-900">Post Recovery Update</h1>
            <p className="text-sm text-gray-500">Share patient progress with your donors</p>
          </div>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Case Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📋</span>
                 </div>
                 Select Case
              </h2>
              {fetchingCases ? (
                <div className="text-sm text-gray-500 text-center py-4">Loading your cases...</div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Which patient are we updating?
                  </label>
                  <select
                    value={form.case_id}
                    onChange={(e) => setForm({ ...form, case_id: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select a case...</option>
                    {activeCases.map(c => (
                      <option key={c._id} value={c._id}>{c.title} ({c.petName})</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCase && (
                <div className="mt-4 flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <img src={selectedCase.image || '/placeholder-pet.jpg'} alt={selectedCase.petName} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-sm truncate">{selectedCase.title}</p>
                    <p className="text-xs text-gray-500 font-medium">PKR {(selectedCase.raisedAmount || 0).toLocaleString()} raised</p>
                  </div>
                </div>
              )}
            </div>

            {/* Update Text */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📝</span>
                 </div>
                 Update Message
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's the latest news?
                </label>
                <textarea
                  value={form.update_text}
                  onChange={(e) => setForm({ ...form, update_text: e.target.value })}
                  placeholder="Share the patient's progress... e.g., 'Max is recovering well after surgery. His stitches are healing and he's eating normally again. We expect full recovery in 7 days!'"
                  rows={6}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none"
                />
                <div className="flex justify-between mt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Be specific and encouraging</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{form.update_text.length} characters</p>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                 <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📸</span>
                 </div>
                 Recovery Photo
              </h2>
              <p className="text-xs text-gray-400 mb-4">Upload a progress photo to show donors the impact of their support.</p>

              <div>
                {photo ? (
                  <div className="relative rounded-2xl overflow-hidden h-64 max-w-sm mx-auto border-4 border-emerald-100 group">
                    <img src={photo.preview} alt="Progress" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all transform hover:scale-110"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">AFTER ✨</div>
                  </div>
                ) : (
                  <div
                    className="h-64 max-w-sm mx-auto border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
                    onClick={() => photoRef.current?.click()}
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <Camera size={32} className="text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-600 font-bold">Upload Progress Photo</p>
                    <p className="text-xs text-gray-400 mt-1">Donors love seeing the results!</p>
                    <input
                      ref={photoRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.case_id}
              className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-base shadow-xl shadow-emerald-200/50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting Update...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Post Recovery Update
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
