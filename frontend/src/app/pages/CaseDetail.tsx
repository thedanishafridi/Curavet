import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import api from '../../services/api';
import {
  ArrowLeft, MapPin, Calendar, ShieldCheck, Eye, EyeOff,
  Heart, Share2, ChevronLeft, ChevronRight, AlertTriangle,
  ClipboardList, Activity, Pill, History
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'active': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-700' },
  'closed': { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEvidence, setShowEvidence] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [case_, setCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await api.get(`/cases/${id}`);
        setCase(response.data.case);
      } catch (err) {
        console.error('Failed to fetch case:', err);
        toast.error('Unable to load case details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCase();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-600/10">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading case details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!case_) {
    return (
      <div className="min-h-screen bg-emerald-600/10">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Case not found</p>
            <Link to="/browse" className="text-emerald-600 font-semibold">← Browse Cases</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = case_.images?.length > 0 ? case_.images : [case_.image || '/placeholder-pet.jpg'];
  const progress = Math.min(((case_.raisedAmount || 0) / (case_.goalAmount || 1)) * 100, 100);
  const statusStyle = STATUS_CONFIG[case_.status] || STATUS_CONFIG['pending'];
  const remaining = Math.max((case_.goalAmount || 0) - (case_.raisedAmount || 0), 0);

  return (
    <div className="min-h-screen bg-emerald-600/10">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link to="/browse" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative h-72 sm:h-96 bg-gray-100">
                <img
                  src={images[activeImg]}
                  alt={case_.title}
                  className="w-full h-full object-cover"
                />
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(prev => (prev - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImg(prev => (prev + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text} capitalize`}>
                    {case_.status}
                  </span>
                </div>
                {case_.urgency === 'critical' && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      <AlertTriangle size={12} /> Critical
                    </span>
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-emerald-500' : 'border-gray-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Case Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h1 className="text-2xl font-black text-gray-900 mb-2">{case_.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                   <Heart size={14} className="text-pink-500" />
                  {case_.petName} · {case_.petBreed || case_.breed || 'Unknown Breed'} · {case_.petAge || case_.age || 'Unknown'} years
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {case_.location || 'Pakistan'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Posted {new Date(case_.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Medical Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              {[
                { label: '🩺 Symptoms', icon: Activity, content: case_.description },
                { label: '🔬 Diagnosis', icon: ClipboardList, content: case_.diagnosis || 'Awaiting professional diagnosis' },
                { label: '💊 Treatment Plan', icon: Pill, content: case_.treatmentPlan || case_.treatment || 'Pending vet review' },
                { label: '📋 Medical History', icon: History, content: case_.medicalHistory || 'No previous history recorded' },
              ].map((section, i) => (
                <div key={i} className={i > 0 ? 'pt-5 border-t border-gray-100' : ''}>
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                     <section.icon size={16} className="text-emerald-600" />
                     {section.label}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>

            {/* Medical Evidence */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Medical Evidence</h3>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">Verified by CuraVet</span>
                </div>
              </div>
              <div
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${!showEvidence ? 'blur-sm hover:blur-none' : ''}`}
                onClick={() => setShowEvidence(!showEvidence)}
              >
                <img
                  src={case_.images?.[1] || case_.image || "https://images.unsplash.com/photo-1770836037275-38b44e4b101f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"}
                  alt="Medical evidence"
                  className="w-full h-48 object-cover"
                />
                {!showEvidence && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                    <Eye size={28} className="text-white mb-2" />
                    <p className="text-white font-semibold text-sm">Click to view medical evidence</p>
                    <p className="text-white/70 text-xs mt-0.5">Content is blurred to protect sensitive data</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="mt-3 text-xs text-gray-500 flex items-center gap-1.5 hover:text-gray-700 transition-colors"
              >
                {showEvidence ? <EyeOff size={12} /> : <Eye size={12} />}
                {showEvidence ? 'Hide evidence' : 'Show medical evidence'}
              </button>
            </div>
          </div>

          {/* Donation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Support {case_.petName}</h2>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-black text-emerald-600 text-xl">PKR {(case_.raisedAmount || 0).toLocaleString()}</span>
                  <span className="text-gray-400 text-xs self-end">raised</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{Math.round(progress)}% of PKR {(case_.goalAmount || 0).toLocaleString()}</span>
                  <span>PKR {remaining.toLocaleString()} left</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-emerald-600/10 rounded-xl p-3 text-center">
                  <p className="font-black text-gray-800">42</p>
                  <p className="text-xs text-gray-500">Donors</p>
                </div>
                <div className="bg-emerald-600/10 rounded-xl p-3 text-center">
                  <p className="font-black text-gray-800">{case_.urgency === 'critical' ? '3' : '14'}</p>
                  <p className="text-xs text-gray-500">Days left</p>
                </div>
              </div>

              {/* Clinic */}
              <div className="bg-emerald-50 rounded-xl p-3 mb-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-800 truncate">{case_.vetId?.name || 'Verified Vet'}</p>
                    <p className="text-xs text-emerald-600 truncate">{case_.location || 'Verified Clinic'}</p>
                  </div>
                </div>
              </div>

              {case_.status === 'active' ? (
                <>
                  <Link
                    to={`/donate/${case_._id}`}
                    className="block w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl text-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 text-base mb-3"
                  >
                    Donate Now
                  </Link>
                  <button onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }} className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-emerald-600/10 transition-colors text-sm">
                    <Share2 size={16} />
                    Share Case
                  </button>
                </>
              ) : (
                <div className="text-center py-3 bg-emerald-600/10 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium">
                    {case_.status === 'closed' ? '✅ This case is fully funded!' : 'Donations not available for this case'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}