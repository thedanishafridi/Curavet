import mongoose from 'mongoose'

const donationSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    message: { type: String, default: '' },
  },
  { timestamps: true },
)

const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema)
export default Donation
