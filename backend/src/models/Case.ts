import mongoose from 'mongoose'

const caseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed', 'recovered'], default: 'open' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
  },
  { timestamps: true },
)

const Case = mongoose.models.Case || mongoose.model('Case', caseSchema)
export default Case
