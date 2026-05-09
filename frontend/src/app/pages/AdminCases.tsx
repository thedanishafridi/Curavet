import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { Search, CheckCircle2, XCircle, Eye, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  'pending': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending Review' },
  'active': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active Fundraiser' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  'closed': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Success Story' },
};

const URGENCY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-red-500', text: 'text-white', label: 'Critical' },
  high: { bg: 'bg-orange-500', text: 'text-white', label: 'High' },
  medium: { bg: 'bg-amber-500', text: 'text-white', label: 'Medium' },
  low: { bg: 'bg-emerald-500', text: 'text-white', label: 'Low' },
  stable: { bg: 'bg-blue-500', text: 'text-white', label: 'Stable' },
};

export function AdminCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const { data } = await api.get('/cases');
      setCases(data.cases || []);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
      toast.error('Unable to load cases database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = (cases || []).filter(c => {
    const matchSearch =
      (c.petName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/cases/${id}`, { status });
      toast.success(`Case marked as ${status}`);
      fetchCases();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update case status');
    }
  };

  const filterOptions = [
    { value: 'All', label: 'Total Library' },
    { value: 'pending', label: 'Awaiting Review' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Funded' },
    { value: 'rejected', label: 'Archived' },
  ];

  return (
    <div className="flex min-h-screen bg-emerald-600/10">
      <AdminSidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Appeals Database</h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Review and manage life-saving cases</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-inner">
               <AlertCircle size={16} className="text-emerald-600" />
               <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{cases.length} Total Registered</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Controls */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-emerald-900/5 p-6 mb-8 flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by miracle name, location, or case ID..."
                className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all whitespace-nowrap ${
                    statusFilter === option.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200'
                      : 'bg-white text-gray-400 border-gray-50 hover:border-emerald-200 hover:text-emerald-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-emerald-900/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest px-8 py-5">Patient Identity</th>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest px-8 py-5">Medical Urgency</th>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest px-8 py-5">Funding Progress</th>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest px-8 py-5">Life Cycle</th>
                    <th className="text-right text-[10px] font-black text-gray-400 uppercase tracking-widest px-8 py-5">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                       <td colSpan={5} className="py-20 text-center">
                          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">Accessing records...</p>
                       </td>
                    </tr>
                  ) : filteredCases.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="py-20 text-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                             <Search size={32} className="text-gray-200" />
                          </div>
                          <p className="text-sm font-black text-gray-500 uppercase tracking-widest">No matching records found</p>
                       </td>
                    </tr>
                  ) : (
                    filteredCases.map((c) => {
                      const statusStyle = STATUS_BADGE[c.status] || STATUS_BADGE.pending;
                      const urgencyStyle = URGENCY_BADGE[c.urgency] || URGENCY_BADGE.medium;
                      const progress = Math.min((c.raisedAmount / c.goalAmount) * 100, 100);
                      
                      return (
                        <tr key={c._id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <img
                                src={c.image || c.images?.[0] || '/placeholder-pet.jpg'}
                                alt={c.petName}
                                className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 shadow-sm ring-2 ring-gray-50"
                              />
                              <div className="min-w-0">
                                <p className="font-black text-gray-900 text-base leading-tight group-hover:text-emerald-600 transition-colors">{c.petName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate">{c.location || 'Verified Clinic'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${urgencyStyle.bg} ${urgencyStyle.text}`}>
                              {urgencyStyle.label}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="w-48">
                              <div className="flex justify-between items-end mb-1.5">
                                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">PKR {c.raisedAmount?.toLocaleString()}</span>
                                 <span className="text-[10px] font-black text-gray-400">{Math.round(progress)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusStyle.bg} ${statusStyle.text} border-transparent`}>
                              {statusStyle.label}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/case/${c._id}`}
                                className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all text-gray-400 shadow-sm"
                                title="Visual Audit"
                              >
                                <Eye size={16} />
                              </Link>
                              {c.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(c._id, 'active')}
                                    className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                    title="Authorize Fundraiser"
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(c._id, 'rejected')}
                                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                                    title="Reject Appeals"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              {c.status === 'active' && (
                                <button
                                  onClick={() => handleStatusUpdate(c._id, 'closed')}
                                  className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                  title="Mark as Successful"
                                >
                                  <TrendingUp size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
