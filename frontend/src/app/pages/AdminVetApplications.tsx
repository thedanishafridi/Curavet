import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { RejectionModal } from '../components/RejectionModal';
import { Search, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import api from '../../services/api';

export function AdminVetApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/vet-applications/admin/all');
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatus = (app: any) => {
    if (app.status === 'approved') return 'Approved';
    if (app.status === 'rejected') return 'Rejected';
    return 'Pending';
  };

  const filtered = (applications || []).filter(a => {
    const matchSearch =
      (a.vetId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.vetId?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.clinicName || '').toLowerCase().includes(search.toLowerCase());
    const appStatus = getStatus(a);
    const matchStatus = statusFilter === 'All' || appStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/vet-applications/${id}/approve`);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectOpen = (id: string) => {
    setSelectedApp(id);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (selectedApp) {
      try {
        await api.post(`/vet-applications/${selectedApp}/reject`, { reason });
        fetchApplications();
      } catch (err) {
        console.error(err);
      }
    }
    setRejectModalOpen(false);
    setSelectedApp(null);
  };

  const selectedAppData = applications.find(a => a._id === selectedApp);

  const statusConfig: any = {
    Pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' },
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
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
          <h1 className="text-xl font-black text-gray-900">Vet Applications</h1>
          <p className="text-sm text-gray-500">Review and manage clinic registration requests</p>
        </div>

        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Object.entries(counts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  statusFilter === status ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <p className={`text-2xl font-black ${statusFilter === status ? 'text-white' : 'text-gray-800'}`}>{count}</p>
                <p className={`text-xs font-medium mt-0.5 ${statusFilter === status ? 'text-emerald-100' : 'text-gray-500'}`}>{status}</p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by clinic, vet, or email..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Application Cards */}
          <div className="space-y-3">
            {(filtered || []).map(app => {
              const appStatus = getStatus(app);
              const sc = statusConfig[appStatus];
              return (
                <div key={app._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-700 font-black text-lg">
                          {(app?.vetId?.name || 'V').charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">{app?.vetId?.name}</p>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {appStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{app?.vetId?.email} · {app.clinicName}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><MapPin size={10} />{app.city}</span>
                          <span>License: {app.licenseNumber}</span>
                          <span className="flex items-center gap-1"><Clock size={10} />{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                        {app.status === 'rejected' && app.rejectionReason && (
                          <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-2">
                            <p className="text-xs text-red-600"><strong>Rejection:</strong> {app.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-16 sm:ml-0">
                      {appStatus === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(app._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectOpen(app._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <img
                  src="/logo.png"
                  alt="CuraVet Logo"
                  className="w-24 h-24 object-contain mx-auto mb-4 opacity-50"
                />
                <p className="font-medium">No applications found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <RejectionModal
        isOpen={rejectModalOpen}
        entityName={selectedAppData?.vetId?.name ?? ''}
        entityType="Vet Application"
        onClose={() => { setRejectModalOpen(false); setSelectedApp(null); }}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
