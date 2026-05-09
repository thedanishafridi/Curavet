import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Clock, Heart, Share2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

function timeAgo(timestamp: string) {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function BeforeAfterComparison({ beforeUrl, afterUrl, petName }: { beforeUrl: string; afterUrl: string; petName: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-inner bg-gray-100">
      <div className="grid grid-cols-2 gap-0.5 bg-gray-900/5">
        <div className="relative">
          <img src={beforeUrl || '/placeholder-pet.jpg'} alt={`${petName} before`} className="w-full h-48 sm:h-64 object-cover" />
          <div className="absolute top-3 left-3">
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
              BEFORE
            </span>
          </div>
        </div>
        <div className="relative">
          <img src={afterUrl || '/placeholder-pet.jpg'} alt={`${petName} after`} className="w-full h-48 sm:h-64 object-cover" />
          <div className="absolute top-3 right-3">
            <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
              AFTER ✨
            </span>
          </div>
        </div>
      </div>
      {/* Center divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-white/40 flex items-center justify-center">
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-xl z-10 border border-gray-100">
          <span className="text-[10px] font-black text-gray-800">VS</span>
        </div>
      </div>
    </div>
  );
}

export function RecoveryFeed() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await api.get('/recovery');
        // Filter for completed/approved updates only
        const filtered = (response.data || []).filter((u: any) => u.status === 'in_progress' || u.status === 'completed');
        setUpdates(filtered);
      } catch (error) {
        console.error('Error fetching recovery updates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-600/10">
      <Navbar />

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
             <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
             <p className="text-gray-500 font-medium">Fetching miracles...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
             <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-emerald-200" />
             </div>
             <h3 className="text-xl font-black text-gray-800">No updates yet</h3>
             <p className="text-gray-500 mt-2">Recovery updates will appear here once approved by admins.</p>
          </div>
        ) : (
          updates.map((update) => (
            <div key={update._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              {/* Vet Header */}
              <div className="flex items-center gap-3 p-5">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0 flex items-center justify-center">
                   <span className="text-emerald-700 font-black text-lg">{(update.vetId?.name || 'V').charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-[15px]">{update.vetId?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{update.caseId?.location || 'Verified Clinic'}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                  <Clock size={12} />
                  {timeAgo(update.createdAt)}
                </div>
              </div>

              {/* Update Badge */}
              <div className="px-5 pb-3">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                  <span className="text-xs">🌟</span>
                  <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Recovery Update: {update.caseId?.petName || 'Patient'}</span>
                </div>
              </div>

              {/* Update Text */}
              <div className="px-5 pb-4">
                <p className="text-gray-700 text-sm leading-relaxed font-medium">{update.notes}</p>
              </div>

              {/* Before / After Photos */}
              {(update.beforeImageUrl || update.afterImageUrl) && (
                <div className="px-5 pb-5">
                  <BeforeAfterComparison
                    beforeUrl={update.beforeImageUrl || update.caseId?.images?.[0] || update.caseId?.image}
                    afterUrl={update.afterImageUrl}
                    petName={update.caseId?.petName || 'Patient'}
                  />
                  <p className="text-[10px] font-bold text-gray-400 text-center mt-3 uppercase tracking-widest">
                    Recovery journey — {update.caseId?.petName || 'Patient'}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 px-5 pb-5 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => toast.success('Miracle celebrated!')}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-red-50 transition-all text-sm text-gray-500 hover:text-red-500 font-bold"
                >
                  <Heart size={18} />
                  <span>Celebrated</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Comments coming in v2')}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-emerald-50 transition-all text-sm text-gray-500 hover:text-emerald-600 font-bold"
                >
                  <MessageCircle size={18} />
                  <span>Message Vet</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-gray-100 transition-all text-sm text-gray-500 ml-auto font-bold"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Footer info */}
        {!loading && updates.length > 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">You've reached the end of the miracles</p>
          </div>
        )}
      </div>
    </div>
  );
}
