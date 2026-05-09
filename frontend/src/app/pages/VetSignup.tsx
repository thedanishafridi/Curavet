import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Phone, MapPin, FileText, Upload, CheckCircle2, X, Lock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import api from '../../services/api';

interface FileUploadBoxProps {
  label: string;
  fieldName: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  description?: string;
}

function FileUploadBox({ label, fieldName, file, onFileChange, description }: FileUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  return (
    <div className="group">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
        {label}
      </label>
      {file ? (
        <div className="flex items-center gap-4 p-4 border-2 border-emerald-400 bg-emerald-50 rounded-2xl shadow-sm animate-in zoom-in duration-300">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
             <CheckCircle2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="p-2 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            <X size={18} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragging ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10' : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-100 transition-colors">
             <Upload size={24} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <p className="text-sm font-bold text-gray-700">Drag & Drop or <span className="text-emerald-600 underline">Browse</span></p>
          {description && <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">{description}</p>}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </div>
      )}
    </div>
  );
}

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];

export function VetSignup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clinicName: '',
    vetName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    licenseNumber: '',
  });
  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
  const [regCert, setRegCert] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Register the user
      const registerRes = await api.post('/auth/register', {
        name: form.vetName,
        email: form.email,
        password: form.password,
        role: 'vet'
      });

      // Save token for document uploads
      if (registerRes.data.token) {
        localStorage.setItem('curavet_token', registerRes.data.token);
      }

      // 2. Upload documents if selected
      let licenseUrl = '';
      let regCertUrl = '';

      if (licenseDoc) {
        const formData = new FormData();
        formData.append('images', licenseDoc);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.urls?.length) licenseUrl = res.data.urls[0];
      }

      if (regCert) {
        const formData = new FormData();
        formData.append('images', regCert);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.urls?.length) regCertUrl = res.data.urls[0];
      }

      // 3. Submit application details
      await api.post('/vet-applications', {
        clinicName: form.clinicName,
        clinicAddress: form.city,
        licenseNumber: form.licenseNumber,
        phoneNumber: form.phone,
        documents: [licenseUrl, regCertUrl].filter(Boolean)
      });
      
      setSubmitted(true);
      toast.success('Clinic application submitted!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit application.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600/10 via-white to-emerald-600/15">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="text-center max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 p-12">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 size={48} className="text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Application Sent!</h2>
            <p className="text-gray-500 font-medium leading-relaxed mb-10">Your clinic registration is under review. Our medical board will verify your credentials and notify you via email within 2-3 business days.</p>
            <Link to="/" className="inline-block w-full bg-emerald-600 text-white font-black px-10 py-4.5 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200/50">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600/10 via-white to-emerald-600/15">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block group mb-6">
             <div className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-emerald-200/50 flex items-center justify-center mx-auto transform transition-transform group-hover:scale-110 group-hover:rotate-3 border border-emerald-50">
                <img
                  src="/logo.png"
                  alt="CuraVet Logo"
                  className="w-14 h-14 object-contain"
                />
             </div>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Register Your Clinic</h1>
          <p className="text-gray-500 font-medium text-sm mt-3">Join CuraVet's verified network and save lives across Pakistan</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 rounded-full -mr-32 -mt-32" />

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl px-4 py-3.5 mb-8 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section: Clinic Info */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shadow-inner">
                    <Building2 size={20} className="text-emerald-600" />
                 </div>
                 <h2 className="text-lg font-black text-gray-900 tracking-tight">Clinic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Official Clinic Name
                  </label>
                  <div className="relative group">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      value={form.clinicName}
                      onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                      placeholder="PawCare Veterinary Hospital"
                      required
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    City
                  </label>
                  <div className="relative group">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <select
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select city</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    License Number
                  </label>
                  <div className="relative group">
                    <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      value={form.licenseNumber}
                      onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                      placeholder="PVMC-YYYY-XXXX"
                      required
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Vet Info */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shadow-inner">
                    <User size={20} className="text-emerald-600" />
                 </div>
                 <h2 className="text-lg font-black text-gray-900 tracking-tight">Primary Veterinarian</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      value={form.vetName}
                      onChange={(e) => setForm({ ...form, vetName: e.target.value })}
                      placeholder="Dr. Ahmed Malik"
                      required
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Work Email
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="vet@clinic.pk"
                      required
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Account Password
                  </label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+92-300-XXXXXXX"
                      required
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Documents */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shadow-inner">
                    <FileText size={20} className="text-emerald-600" />
                 </div>
                 <h2 className="text-lg font-black text-gray-900 tracking-tight">Credentials</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <FileUploadBox
                  label="Medical License"
                  fieldName="license_doc"
                  file={licenseDoc}
                  onFileChange={setLicenseDoc}
                  description="Valid PVMC License"
                />
                <FileUploadBox
                  label="Registration"
                  fieldName="registration_cert"
                  file={regCert}
                  onFileChange={setRegCert}
                  description="Clinic Certificate"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-xl shadow-emerald-200/50"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting Application...
                  </>
                ) : '🚀 Submit Clinic Registration'}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-6 font-black uppercase tracking-widest">
                Already registered?{' '}
                <Link to="/login?type=clinic" className="text-emerald-600 hover:text-emerald-700 transition-colors">Sign in here</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}