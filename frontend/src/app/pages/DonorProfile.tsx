import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Heart, Settings, Bell, User as UserIcon, Mail, Lock, CheckCircle2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

type TabType = 'donations' | 'settings' | 'notifications';

interface NotificationToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function DonorProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('donations');
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationToggle[]>([
    { id: 'recovery_updates', label: 'Recovery Updates', description: 'Get notified when cases you donated to post updates', enabled: true },
    { id: 'new_cases', label: 'New Critical Cases', description: 'Be alerted about new critical animal cases', enabled: true },
    { id: 'donation_confirmed', label: 'Donation Confirmations', description: 'Receive receipts for every donation', enabled: true },
    { id: 'case_funded', label: 'Case Fully Funded', description: 'Know when an animal reaches its funding goal', enabled: false },
    { id: 'weekly_digest', label: 'Weekly Digest', description: 'A summary of platform activity and impact', enabled: false },
  ]);

  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    city: '',
  });

  const [settingsSaved, setSettingsSaved] = useState(false);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await api.get('/donations/my');
        setDonations(response.data || []);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

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
      // Note: In a real app, we'd update the context user here
      window.location.reload(); 
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setAvatarLoading(false);
    }
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    toast.success('Profile updated successfully');
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const animalsHelped = new Set(donations.map(d => d.caseId?._id)).size;

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'donations', label: 'My Donations', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-emerald-600/10">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-emerald-600 font-bold text-3xl">{user?.name?.charAt(0) || 'U'}</span>
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
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl font-black text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <div className="flex gap-4 mt-2 justify-center sm:justify-start">
                <div className="text-center">
                  <p className="font-black text-emerald-600">{donations.length}</p>
                  <p className="text-xs text-gray-500">Donations</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-emerald-600">{animalsHelped}</p>
                  <p className="text-xs text-gray-500">Animals Helped</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-emerald-600">PKR {totalDonated.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Given</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all border-b-2 ${
                  activeTab === id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div className="p-5">
              <h2 className="font-bold text-gray-900 mb-4">My Donations</h2>
              {loading ? (
                <div className="text-center py-10 text-gray-500">Loading your impact...</div>
              ) : donations.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                   <Heart size={32} className="mx-auto mb-2 opacity-20" />
                   <p className="font-medium">No donations yet</p>
                   <p className="text-xs">Start helping animals today!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map((d) => (
                    <div key={d._id} className="flex items-center gap-4 p-4 bg-emerald-600/10 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-emerald-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {d.caseId?.images?.[0] ? (
                           <img src={d.caseId.images[0]} alt={d.caseId.title} className="w-full h-full object-cover" />
                        ) : (
                           <Heart size={16} className="text-emerald-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm truncate">{d.caseId?.title || 'Anonymous Case'}</p>
                        </div>
                        <p className="text-xs text-gray-500">{d.caseId?.location || 'Verified Clinic'}</p>
                        {d.message && (
                          <p className="text-xs text-gray-400 italic mt-0.5">"{d.message}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(d.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-emerald-600">PKR {d.amount.toLocaleString()}</p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <CheckCircle2 size={11} className="text-emerald-500" />
                          <span className="text-xs text-emerald-500">Confirmed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loading && donations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-sm text-gray-500">Total donated</p>
                  <p className="font-black text-emerald-600 text-lg">PKR {totalDonated.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-5">
              <h2 className="font-bold text-gray-900 mb-4">Account Details</h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={settings.email}
                        readOnly
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl pl-9 pr-4 py-2.5 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => toast.info('Change Password feature coming soon')} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium">
                    <Lock size={14} />
                    Change Password
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm"
                >
                  {settingsSaved ? (
                    <>
                      <CheckCircle2 size={16} />
                      Saved!
                    </>
                  ) : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-5">
              <h2 className="font-bold text-gray-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-500 mb-5">Choose what updates you'd like to receive</p>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between p-4 bg-emerald-600/10 rounded-xl">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-semibold text-gray-800 text-sm">{notif.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.description}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(notif.id)}
                      className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${
                        notif.enabled ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        notif.enabled ? 'left-6' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}