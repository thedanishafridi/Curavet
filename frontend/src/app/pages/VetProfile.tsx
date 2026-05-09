import { useRef, useState } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import {
  Building2, MapPin, Phone, Mail, FileText, ShieldCheck, Upload,
  CheckCircle2, Clock, X, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export function VetProfile() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [newDoc, setNewDoc] = useState<File | null>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const avatarUrl = data.urls[0];
      await api.patch('/auth/profile', { avatarUrl });
      toast.success('Profile picture updated!');
      window.location.reload(); 
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setAvatarLoading(false);
    }
  };

  const vetInfo = {
    clinic_name: user?.clinicName || 'Not Specified',
    vet_name: user?.name || 'Doctor',
    email: user?.email || '',
    phone: user?.phone || 'Not Specified',
    city: user?.clinicAddress || 'Not Specified',
    license_no: user?.licenseNumber || 'Not Specified',
    verification_status: (user?.vetApplicationStatus || 'Pending') as 'Approved' | 'Pending' | 'Rejected',
    member_since: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    cases_created: 0,
    total_raised: 0,
  };

  const handleDocUpload = (file: File) => {
    setNewDoc(file);
  };

  const handleSubmitDocs = () => {
    setSubmitted(true);
    toast.success('Documents submitted for review');
    setTimeout(() => {
      setSubmitted(false);
      setNewDoc(null);
    }, 2500);
  };

  const statusConfig = {
    Approved: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: ShieldCheck,
      label: 'Verified & Approved Clinic',
      desc: 'Your clinic is verified and active on CuraVet.',
    },
    Pending: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: Clock,
      label: '⏳ Verification Pending',
      desc: 'Your documents are under review. This usually takes 2-3 business days.',
    },
    Rejected: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: AlertTriangle,
      label: 'Verification Rejected',
      desc: 'Your application was rejected. Please resubmit documents.',
    },
  }[vetInfo.verification_status] || {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    icon: Clock,
    label: 'Status Unknown',
    desc: 'Contact support if this persists.',
  };

  const infoFields = [
    { icon: Building2, label: 'Clinic Name', value: vetInfo.clinic_name, field: 'clinicName' },
    { icon: Mail, label: 'Email', value: vetInfo.email, field: 'email' },
    { icon: Phone, label: 'Phone', value: vetInfo.phone, field: 'phone' },
    { icon: MapPin, label: 'Clinic Location', value: vetInfo.city, field: 'clinicAddress' },
    { icon: FileText, label: 'License Number', value: vetInfo.license_no, field: 'licenseNumber' },
    { icon: Clock, label: 'Member Since', value: vetInfo.member_since, field: 'createdAt' },
  ];

  return (
    <div className="flex min-h-screen bg-emerald-600/10">
      <AdminSidebar role="vet" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
          <h1 className="text-xl font-black text-gray-900">Vet Profile</h1>
          <p className="text-sm text-gray-500">Your clinic information and verification status</p>
        </div>

        <div className="p-6 max-w-3xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden border-2 border-white">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-700 font-black text-2xl">{vetInfo.vet_name.charAt(0)}</span>
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Camera size={12} />
                </button>
                <input 
                  ref={avatarRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-gray-900 truncate">{vetInfo.vet_name}</h2>
                <p className="text-gray-500 font-medium truncate">{vetInfo.clinic_name}</p>
                <div className="flex items-center gap-2 mt-1">
                   <Clock size={12} className="text-gray-400" />
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Member since {vetInfo.member_since}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact</p>
                <p className="font-black text-emerald-600 text-2xl">PKR 0</p>
                <p className="text-xs font-bold text-gray-400">0 Patients Helped</p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className={`rounded-3xl border-2 p-6 transition-all ${statusConfig.bg} ${statusConfig.border} shadow-sm`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-white shadow-sm`}>
                <statusConfig.icon size={28} className={statusConfig.text} />
              </div>
              <div>
                <p className={`text-lg font-black ${statusConfig.text}`}>{statusConfig.label}</p>
                <p className={`text-sm font-medium ${statusConfig.text} opacity-80 mt-0.5`}>{statusConfig.desc}</p>
              </div>
            </div>
          </div>

          {/* Clinic Info — Non-editable */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-gray-900 text-lg">Clinic Information</h2>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Locked</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoFields.map((field, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-emerald-600/5 rounded-2xl border border-emerald-600/5 transition-all hover:border-emerald-600/20">
                  <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <field.icon size={16} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{field.label}</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                 <ShieldCheck size={14} className="text-emerald-600" />
                 To update clinic details, please contact CuraVet support at <span className="font-bold text-emerald-600">support@curavel.pk</span>
               </p>
            </div>
          </div>

          {/* Submit New Documents */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-900 text-lg mb-1">Update Credentials</h2>
            <p className="text-sm text-gray-500 font-medium mb-6">Upload updated license or clinic documents for re-verification.</p>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <p className="text-xl font-black text-gray-900">Documents Submitted!</p>
                <p className="text-sm text-gray-500 font-medium mt-1">Our team will review them within 24-48 hours.</p>
              </div>
            ) : (
              <>
                {newDoc ? (
                  <div className="flex items-center gap-4 p-4 border-2 border-emerald-400 bg-emerald-50 rounded-2xl mb-6 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                       <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{newDoc.name}</p>
                      <p className="text-xs text-gray-500">{(newDoc.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => setNewDoc(null)}
                      className="p-2 hover:bg-emerald-100 rounded-xl transition-colors"
                    >
                      <X size={18} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all mb-6 group"
                    onClick={() => docRef.current?.click()}
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                       <Upload size={28} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                      Drag & Drop or <span className="text-emerald-600 underline">Browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide">PDF, JPG, PNG — Max 10MB</p>
                    <input
                      ref={docRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0])}
                    />
                  </div>
                )}

                <button
                  onClick={handleSubmitDocs}
                  disabled={!newDoc}
                  className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base shadow-xl shadow-emerald-200/50"
                >
                  <Upload size={20} />
                  Submit for Review
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}