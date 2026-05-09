import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import api from '../../services/api'

interface VetApplication {
  _id: string
  clinicName: string
  licenseNumber: string
  status: string
}

export function VetApplicationForm() {
  const navigate = useNavigate()
  const [clinicName, setClinicName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingApplication, setExistingApplication] = useState<VetApplication | null>(null)

  useEffect(() => {
    checkExistingApplication()
  }, [])

  const checkExistingApplication = async () => {
    try {
      const response = await api.get('/vet-applications/my')
      setExistingApplication(response.data)
    } catch (err) {
      // No existing application, which is fine
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!clinicName.trim() || !licenseNumber.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setIsSaving(true)
    try {
      await api.post('/vet-applications', {
        clinicName,
        licenseNumber,
      })
      navigate('/vet/dashboard')
    } catch (err: any) {
      console.error('Failed to submit application:', err)
      setError(err.response?.data?.message || 'Unable to submit application.')
    } finally {
      setIsSaving(false)
    }
  }

  if (existingApplication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Vet Application</h1>
            <div className={`rounded-2xl border p-4 mb-6 ${
              existingApplication.status === 'approved'
                ? 'border-emerald-200 bg-emerald-50'
                : existingApplication.status === 'rejected'
                  ? 'border-red-200 bg-red-50'
                  : 'border-yellow-200 bg-yellow-50'
            }`}>
              <p className={`font-medium capitalize ${
                existingApplication.status === 'approved'
                  ? 'text-emerald-700'
                  : existingApplication.status === 'rejected'
                    ? 'text-red-700'
                    : 'text-yellow-700'
              }`}>
                Status: {existingApplication.status}
              </p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                <p className="text-gray-900 font-medium">{existingApplication.clinicName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <p className="text-gray-900 font-medium">{existingApplication.licenseNumber}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/vet/dashboard')}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Vet Application</h1>
          <p className="text-gray-600 mb-6">Submit your clinic information for approval to create cases.</p>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
              <input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Your clinic or hospital name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
              <input
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Your veterinary license number"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/vet/dashboard')}
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
