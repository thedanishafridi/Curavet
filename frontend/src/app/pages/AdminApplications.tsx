import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { Search, Eye, CheckCircle2, XCircle, Clock, MapPin, Building2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

export function AdminApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/vet-applications/admin/all');
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Unable to load application queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatus = (app: any) => {
    return app.status.charAt(0).toUpperCase() + app.status.slice(1);
  };

  const filtered = (applications || []).filter(a => {
    const matchSearch =
      (a.vetId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.clinicName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.vetId?.email || '').toLowerCase().includes(search.toLowerCase());
    const appStatus = getStatus(a);
    const matchStatus = statusFilter === 'All' || appStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/vet-applications/${id}/approve`);
      toast.success('Vet credentialed successfully');
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error('Verification failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/vet-applications/${id}/reject`, { reason: 'Credentials verification failed' });
      toast.success('Application rejected');
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error('Rejection failed');
    }
  };

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
    Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  };

  const counts = {
    All: applications.length,
    Pending: (applications || []).filter(a => a.status === 'pending').length,
    Approved: (applications || []).filter(a => a.status === 'approved').length,
    Rejected: (applications || []).filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="flex min-h-screen bg-emerald-600/10">
      <AdminSidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-10 shadow-sm">
           <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Onboarding Queue</h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Vet Credentials Verification</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-inner">
               <Building2 size={16} className="text-emerald-600" />
               <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{counts.Pending} Awaiting Verification</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Summary Hub */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {Object.entries(counts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`p-6 rounded-3xl border-2 text-left transition-all group ${
                  statusFilter === status 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200 translate-y-[-4px]' 
                    : 'bg-white border-gray-50 text-gray-400 hover:border-emerald-200'
                }`}
              >
                <p className={`text-3xl font-black tracking-tight ${statusFilter === status ? 'text-white' : 'text-gray-900'}`}>{count}</p>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 ${statusFilter === status ? 'text-emerald-100' : 'text-gray-400'}`}>{status}</p>
              </button>
            ))}
          </div>

          {/* Search Hub */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-emerald-900/5 p-6 mb-8">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by practitioner name, clinic ID, or email..."
                className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* List Hub */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
                 <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                 <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">Scanning Board Database...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 size={32} className="text-gray-200" />
                 </div>
                 <p className="text-sm font-black text-gray-500 uppercase tracking-widest">No applications found in this sector</p>
              </div>
            ) : (
              filtered.map(app => {
                const appStatus = getStatus(app);
                const sc = statusConfig[appStatus] || statusConfig.Pending;
                return (
                  <div key={app._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-emerald-900/5 p-8 transition-all hover:translate-x-1">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ring-4 ring-gray-50">
                          <span className="text-emerald-700 font-black text-2xl">
                            {(app.vetId?.name || app.name || 'V').charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <p className="font-black text-gray-900 text-xl leading-tight">{app.vetId?.name || app.name}</p>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sc.bg} ${sc.text} shadow-sm`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {appStatus}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 font-bold mb-4">{app.vetId?.email || app.email}</p>
                          <div className="flex flex-wrap gap-6 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            <span className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md"><MapPin size={12} className="text-emerald-600" /> {app.clinicName}</span>
                            <span className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md">ID: {app.licenseNumber || app.license_no}</span>
                            <span className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md"><Clock size={12} className="text-emerald-600" /> {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                          {app.rejectionReason && (
                            <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                              <XCircle size={16} className="text-red-500" />
                              <p className="text-[11px] text-red-600 font-bold uppercase tracking-tight">Rejection Reason: {app.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end lg:self-center">
                        <Link
                          to={`/admin/vet/${app._id}`}
                          className="flex items-center gap-2 px-5 py-3 border-2 border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
                        >
                          <Eye size={16} /> Audit
                        </Link>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(app._id)}
                              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                            >
                              <CheckCircle2 size={16} /> Certify
                            </button>
                            <button
                              onClick={() => handleReject(app._id)}
                              className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-100 border border-red-100 transition-all"
                            >
                              <XCircle size={16} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
