import mongoose from 'mongoose'

const temporaryVetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    clinicName: { type: String, required: true },
    clinicAddress: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    documents: [{ type: String }],
    status: { type: String, enum: ['pending', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true },
)

const TemporaryVet = mongoose.models.TemporaryVet || mongoose.model('TemporaryVet', temporaryVetSchema)
export default TemporaryVet
