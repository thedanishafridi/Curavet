import mongoose from 'mongoose'

const vetApplicationSchema = new mongoose.Schema(
  {
    vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    clinicName: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true },
)

const VetApplication = mongoose.models.VetApplication || mongoose.model('VetApplication', vetApplicationSchema)
export default VetApplication
