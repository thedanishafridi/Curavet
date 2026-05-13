import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import {
  Clock, FolderOpen, Users, TrendingUp, ArrowRight, Eye,
  CheckCircle, XCircle, ChevronRight, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { toast } from 'sonner';

const monthlyData = [
  { id: 1, month: 'Jan', raised: 45000 },
  { id: 2, month: 'Feb', raised: 72000 },
  { id: 3, month: 'Mar', raised: 58000 },
  { id: 4, month: 'Apr', raised: 95000 },
  { id: 5, month: 'May', raised: 120000 },
  { id: 6, month: 'Jun', raised: 87000 },
];

export function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>({
    totalUsers: 0,
    totalVets: 0,
    pendingVets: 0,
    totalCases: 0,
    totalFunds: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appsRes, casesRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/vet-applications/admin/all'),
        api.get('/cases')
      ]);
      setAdminStats(statsRes.data || {});
      setApplications(appsRes.data || []);
      setCases(casesRes.data.cases || []);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingApps = (applications || []).filter(a => a.status === 'pending');

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/vet-applications/${id}/approve`);
      toast.success('Vet application approved');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/vet-applications/${id}/reject`, { reason: 'Application does not meet criteria' });
      toast.success('Vet application rejected');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject application');
    }
  };

  const stats = [
    { label: 'Pending Vets', value: pendingApps.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', change: '+2 today' },
    { label: 'Active Cases', value: adminStats?.openCases || 0, icon: FolderOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', change: '+1 today' },
    { label: 'Total Users', value: (adminStats?.totalUsers || 0).toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', change: '+47 this week' },
    { label: 'PKR Revenue', value: `${((adminStats?.totalFunds || 0) / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', change: '+12% this month' },
  ];

  return (
    <div className="flex min-h-screen bg-emerald-600/10">
      <AdminSidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Admin Console</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Control Center — Live Operations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">System Online</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
               <Users size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className={`${stat.bg} border-2 ${stat.border} rounded-3xl p-6 shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm`}>
                     <stat.icon size={24} className={stat.color} />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.change}</span>
                </div>
                <p className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Chart + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-emerald-900/5 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-xl font-black text-gray-900">Donation Growth</h2>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time fundraising performance</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl">
                   <Activity size={20} className="text-gray-400" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                    tickFormatter={(v) => `${v/1000}k`} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: 900, color: '#10b981' }}
                    labelStyle={{ fontWeight: 900, color: '#1e293b', marginBottom: '4px' }}
                    formatter={(v: number) => [`PKR ${v.toLocaleString()}`, 'Raised']} 
                  />
                  <Bar dataKey="raised" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-emerald-900/5 p-8 flex flex-col">
              <h2 className="text-xl font-black text-gray-900 mb-6">Quick Hub</h2>
              <div className="space-y-3 mb-8">
                <Link to="/admin/cases" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-emerald-600 hover:text-white transition-all group">
                  <span className="text-sm font-bold">Manage All Cases</span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-white transition-all" />
                </Link>
                <Link to="/admin/applications" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-emerald-600 hover:text-white transition-all group">
                  <span className="text-sm font-bold">Vet Applications</span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-white transition-all" />
                </Link>
                <button onClick={() => toast.info('Exporting report...')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-emerald-600 hover:text-white transition-all group">
                  <span className="text-sm font-bold">Export PDF Report</span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-white transition-all" />
                </button>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Live Pipeline</p>
                <div className="space-y-4">
                   {[
                    { label: 'Active Appeals', count: (cases || []).filter(c => c.status === 'active').length, color: 'bg-emerald-500' },
                    { label: 'Awaiting Review', count: (cases || []).filter(c => c.status === 'pending').length, color: 'bg-yellow-400' },
                    { label: 'Success Stories', count: (cases || []).filter(c => c.status === 'closed').length, color: 'bg-blue-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color} ring-4 ring-gray-50`} />
                      <span className="text-xs font-bold text-gray-600 flex-1">{item.label}</span>
                      <span className="text-sm font-black text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pending Vet Applications */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-emerald-900/5 overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-gray-50">
              <div>
                <h2 className="text-xl font-black text-gray-900">Vet Boarding Queue</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{pendingApps.length} applications pending verification</p>
              </div>
              <Link to="/admin/applications" className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors flex items-center gap-2">
                Manage All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingApps.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Queue Clear — No pending apps</p>
                </div>
              ) : (
                pendingApps.slice(0, 5).map((app) => (
                  <div key={app._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 transition-colors hover:bg-gray-50/50">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                        <span className="text-emerald-700 font-black text-xl">{(app.vetId?.name || app.name || 'V').charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-lg leading-tight">{app.vetId?.name || app.name}</p>
                        <p className="text-sm text-gray-500 font-medium truncate">{app.clinicName} · {app.licenseNumber || app.license_no}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <Clock size={12} className="text-gray-400" />
                           <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(app._id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(app._id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-red-100 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
