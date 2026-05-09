import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import api from '../../services/api'
import { CheckCircle, XCircle } from 'lucide-react'

interface Recovery {
  _id: string
  caseId: { _id: string; title: string }
  vetId: { _id: string; name: string; email: string }
  notes: string
  status: string
  createdAt: string
}

export function AdminRecoveryApprovals() {
  const [recoveries, setRecoveries] = useState<Recovery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPendingRecoveries()
  }, [])

  const fetchPendingRecoveries = async () => {
    try {
      setLoading(true)
      const response = await api.get('/recovery/admin/pending')
      setRecoveries(response.data)
    } catch (err) {
      console.error('Failed to fetch recovery requests:', err)
      setError('Unable to load recovery requests.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (recoveryId: string) => {
    setActionInProgress(recoveryId)
    try {
      await api.post(`/recovery/${recoveryId}/approve`)
      setRecoveries((prev) => prev.filter((r) => r._id !== recoveryId))
    } catch (err) {
      console.error('Failed to approve recovery:', err)
      setError('Unable to approve recovery request.')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleReject = async (recoveryId: string) => {
    if (confirm('Are you sure you want to reject this recovery request?')) {
      setActionInProgress(recoveryId)
      try {
        await api.post(`/recovery/${recoveryId}/reject`)
        setRecoveries((prev) => prev.filter((r) => r._id !== recoveryId))
      } catch (err) {
        console.error('Failed to reject recovery:', err)
        setError('Unable to reject recovery request.')
      } finally {
        setActionInProgress(null)
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Recovery Approvals</h1>
          <p className="text-gray-600 mt-2">Review and approve pending recovery requests from vets.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading recovery requests...</div>
          ) : recoveries.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No pending recovery requests.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Case</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vet</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recoveries.map((recovery) => (
                    <tr key={recovery._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => navigate(`/case/${recovery.caseId._id}`)}
                          className="text-emerald-600 font-medium hover:text-emerald-700"
                        >
                          {recovery.caseId.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{recovery.vetId.name}</div>
                        <div className="text-gray-500">{recovery.vetId.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {recovery.notes || 'No notes'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(recovery.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(recovery._id)}
                            disabled={actionInProgress === recovery._id}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200 transition disabled:opacity-50"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(recovery._id)}
                            disabled={actionInProgress === recovery._id}
                            className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                          >
                            <XCircle size={16} /> Reject
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
