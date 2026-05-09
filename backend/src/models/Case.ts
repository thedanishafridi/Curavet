import mongoose from 'mongoose'

const caseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, default: 'Medical' },
    location: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'active', 'rejected', 'closed', 'recovered'], default: 'pending' },
    isApproved: { type: Boolean, default: false },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
    // New fields from frontend form
    petName: { type: String },
    petBreed: { type: String },
    petAge: { type: Number },
    petType: { type: String },
    urgency: { type: String },
    medicalHistory: { type: String },
    diagnosis: { type: String },
    treatmentPlan: { type: String },
  },
  { timestamps: true },
)

const Case = mongoose.models.Case || mongoose.model('Case', caseSchema)
export default Case
