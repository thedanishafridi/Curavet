import mongoose from 'mongoose'

const recoverySchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
    beforeImageUrl: { type: String, default: '' },
    afterImageUrl: { type: String, default: '' },
    status: { type: String, enum: ['requested', 'in_progress', 'completed'], default: 'requested' },
  },
  { timestamps: true },
)

const Recovery = mongoose.models.Recovery || mongoose.model('Recovery', recoverySchema)
export default Recovery
