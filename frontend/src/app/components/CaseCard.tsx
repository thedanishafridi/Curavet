import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

interface CaseCardProps {
  case_: any;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'pending': { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Pending Review' },
  'active': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
  'rejected': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Rejected' },
  'closed': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Funded' },
};

const URGENCY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low' },
  stable: { bg: 'bg-green-100', text: 'text-green-700', label: 'Stable' },
};

export function CaseCard({ case_, showActions, onApprove, onReject }: CaseCardProps) {
  const progress = (case_.goalAmount && case_.goalAmount > 0) ? Math.min(((case_.raisedAmount || 0) / case_.goalAmount) * 100, 100) : 0;
  const status = STATUS_CONFIG[case_.status] || (case_.status === 'open' ? STATUS_CONFIG['active'] : STATUS_CONFIG['pending']);
  const urgency = URGENCY_CONFIG[case_.urgency] || URGENCY_CONFIG['stable'];

  const progressBarColor =
    (case_.status === 'active' || case_.status === 'open') ? 'bg-emerald-500' :
    case_.status === 'closed' ? 'bg-blue-500' :
    case_.status === 'rejected' ? 'bg-red-400' : 'bg-yellow-400';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group h-full flex flex-col">
      {/* Pet Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={case_.images?.[0] || case_.image || '/placeholder-pet.jpg'}
          alt={case_.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlays */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${urgency.bg} ${urgency.text}`}>
            {urgency.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-base line-clamp-1">{case_.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">{case_.petType || 'Animal'} · {case_.location || 'Pakistan'}</p>
          <div className="flex items-center gap-1 mt-1 text-gray-400">
            <MapPin size={12} />
            <span className="text-xs truncate">{case_.location || 'Verified Clinic'}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4 mt-auto">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500">Raised</span>
            <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs">
            <span className="font-semibold text-emerald-600">PKR {(case_.raisedAmount || 0).toLocaleString()}</span>
            <span className="text-gray-400">of PKR {(case_.goalAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions ? (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove?.(case_._id)}
              className="flex-1 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onReject?.(case_._id)}
              className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              Reject
            </button>
          </div>
        ) : (
          <Link
            to={`/case/${case_._id}`}
            className="block w-full py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl text-center hover:bg-emerald-700 transition-colors"
          >
            {case_.status === 'closed' ? 'View Success' : 'Donate Now'}
          </Link>
        )}
      </div>
    </div>
  );
}