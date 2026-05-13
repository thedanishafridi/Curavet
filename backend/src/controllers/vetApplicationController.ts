import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import VetApplication from '../models/VetApplication.js'
import TemporaryVet from '../models/TemporaryVet.js'
import User from '../models/User.js'
import { AuthRequest } from '../middleware/auth.js'
import { sendEmail } from '../services/mailer.js'

export const getPendingApplications = async (req: Request, res: Response) => {
  const applications = await TemporaryVet.find({ status: 'pending' }).sort({ createdAt: -1 })
  res.json(applications)
}

export const getAllApplications = async (req: Request, res: Response) => {
  const tempApps = await TemporaryVet.find().sort({ createdAt: -1 })
  const permApps = await VetApplication.find().populate('vetId', 'name email').sort({ createdAt: -1 })
  
  const formattedPermApps = permApps.map((app: any) => ({
    ...app.toObject(),
    name: app.vetId?.name,
    email: app.vetId?.email
  }))

  res.json([...tempApps, ...formattedPermApps])
}

export const submitVetApplication = async (req: Request, res: Response) => {
  const { name, email, password, clinicName, clinicAddress, licenseNumber, phoneNumber, documents } = req.body

  if (!name || !email || !password || !clinicName || !licenseNumber) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(409).json({ message: 'Validation failed', errors: { email: 'Email already registered' } })
  }

  const existingTemp = await TemporaryVet.findOne({ email })
  if (existingTemp) {
    return res.status(400).json({ message: 'Validation failed', errors: { email: 'Application already in progress for this email' } })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const application = await TemporaryVet.create({
    name,
    email,
    passwordHash,
    clinicName,
    clinicAddress,
    licenseNumber,
    phoneNumber,
    documents
  })

  res.status(201).json(application)
}

export const approveVetApplication = async (req: AuthRequest, res: Response) => {
  const application = await TemporaryVet.findById(req.params.id)
  if (!application) {
    return res.status(404).json({ message: 'Application not found' })
  }

  const user = await User.create({
    name: application.name,
    email: application.email,
    passwordHash: application.passwordHash,
    role: 'vet',
    isApproved: true
  })

  const newApp = await VetApplication.create({
    vetId: user._id,
    clinicName: application.clinicName,
    licenseNumber: application.licenseNumber,
    status: 'approved'
  })

  await sendEmail(
    user.email,
    'CuraVet Clinic Application Approved',
    `Hello ${user.name},\n\nYour clinic application for ${application.clinicName} has been approved! You can now log in to the CuraVet platform.\n\nThank you,\nThe CuraVet Team`
  )

  await TemporaryVet.findByIdAndDelete(application._id)

  res.json(newApp)
}

export const rejectVetApplication = async (req: AuthRequest, res: Response) => {
  const application = await TemporaryVet.findById(req.params.id)
  if (!application) {
    return res.status(404).json({ message: 'Application not found' })
  }

  const { reason } = req.body

  await sendEmail(
    application.email,
    'CuraVet Clinic Application Update',
    `Hello ${application.name},\n\nUnfortunately, your clinic application for ${application.clinicName} was not approved. \n\nReason: ${reason || 'No reason provided'}\n\nIf you have any questions, please reply to this email.\n\nThank you,\nThe CuraVet Team`
  )

  await TemporaryVet.findByIdAndDelete(application._id)

  res.json({ message: 'Application rejected and removed' })
}

export const getMyApplication = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const application = await VetApplication.findOne({ vetId: req.user.id })
  if (!application) {
    return res.status(404).json({ message: 'No application found' })
  }

  res.json(application)
}
