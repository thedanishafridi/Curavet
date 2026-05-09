import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import api from '../../services/api'
import { toast } from 'sonner'
import { Trash2, ExternalLink } from 'lucide-react'

interface CaseItem {
  _id: string
  title: string
  category: string
  location: string
  goalAmount: number
  raisedAmount: number
  status: string
  ownerId: { _id: string; name: string; email: string; role: string }
  createdAt: string
}

export function AdminCaseManagement() {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllCases()
  }, [])

  const fetchAllCases = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cases/admin/all')
      setCases(response.data.cases || [])
    } catch (err) {
      console.error('Failed to fetch cases:', err)
      setError('Unable to load cases.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    setUpdatingId(caseId)
    try {
      await api.patch(`/cases/${caseId}/status`, { status: newStatus })
      setCases((prev) =>
        prev.map((c) => (c._id === caseId ? { ...c, status: newStatus } : c))
      )
      toast.success('Case status updated successfully')
    } catch (err) {
      console.error('Failed to update case status:', err)
      setError('Unable to update case status.')
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteCase = async (caseId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this case? This action cannot be undone.')) {
      return
    }

    try {
      setUpdatingId(caseId)
      await api.delete(`/cases/${caseId}`)
      setCases((prev) => prev.filter((c) => c._id !== caseId))
      toast.success('Case deleted successfully')
    } catch (err) {
      console.error('Failed to delete case:', err)
      toast.error('Failed to delete case')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'closed':
        return 'bg-blue-100 text-blue-700'
      case 'recovered':
        return 'bg-purple-100 text-purple-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-emerald-600 font-medium hover:text-emerald-700 mb-4"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-600 mt-2">Review and manage all cases across the platform.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No cases found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vet</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Progress</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cases.map((caseItem) => (
                    <tr key={caseItem._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/case/${caseItem._id}`)}
                          className="text-emerald-600 font-medium hover:text-emerald-700"
                        >
                          {caseItem.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{caseItem.ownerId.name}</div>
                        <div className="text-gray-500">{caseItem.ownerId.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{caseItem.location}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{
                                width: `${caseItem.goalAmount ? (caseItem.raisedAmount / caseItem.goalAmount) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(
                              caseItem.goalAmount ? (caseItem.raisedAmount / caseItem.goalAmount) * 100 : 0
                            )}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={caseItem.status}
                          onChange={(e) => handleStatusChange(caseItem._id, e.target.value)}
                          disabled={updatingId === caseItem._id}
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize cursor-pointer ${getStatusColor(
                            caseItem.status
                          )}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="closed">Closed</option>
                          <option value="recovered">Recovered</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => navigate(`/case/${caseItem._id}`)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                            title="View Details"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCase(caseItem._id)}
                            disabled={updatingId === caseItem._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                            title="Delete Case"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
