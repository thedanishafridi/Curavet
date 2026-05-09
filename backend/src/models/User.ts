import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['donor', 'vet', 'admin'], default: 'donor' },
    phone: { type: String },
    clinicName: { type: String },
    clinicAddress: { type: String },
    licenseNumber: { type: String },
    avatarUrl: { type: String },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User
