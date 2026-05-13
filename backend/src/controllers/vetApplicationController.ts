import { Request, Response } from 'express'
import VetApplication from '../models/VetApplication.js'
import User from '../models/User.js'
import { AuthRequest } from '../middleware/auth.js'
import { sendEmail } from '../services/mailer.js'

export const getPendingApplications = async (req: Request, res: Response) => {
  const applications = await VetApplication.find({ status: 'pending' })
    .populate('vetId', 'name email')
    .sort({ createdAt: -1 })
  res.json(applications)
}

export const getAllApplications = async (req: Request, res: Response) => {
  const applications = await VetApplication.find()
    .populate('vetId', 'name email')
    .sort({ createdAt: -1 })
  res.json(applications)
}

export const submitVetApplication = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { clinicName, licenseNumber } = req.body

  if (!clinicName || !licenseNumber) {
    return res.status(400).json({ message: 'Clinic name and license number are required' })
  }

  // Check if already applied
  const existing = await VetApplication.findOne({ vetId: req.user.id })
  if (existing) {
    return res.status(400).json({ message: 'You have already submitted an application' })
  }

  const application = await VetApplication.create({
    vetId: req.user.id,
    clinicName,
    licenseNumber,
  })

  res.status(201).json(application)
}

export const approveVetApplication = async (req: AuthRequest, res: Response) => {
  const application = await VetApplication.findById(req.params.id)
  if (!application) {
    return res.status(404).json({ message: 'Application not found' })
  }

  // Update application status
  application.status = 'approved'
  await application.save()

  // Update user role to vet and set isApproved to true
  const user = await User.findById(application.vetId)
  if (user) {
    user.role = 'vet'
    user.isApproved = true
    await user.save()

    await sendEmail(
      user.email,
      'CuraVet Clinic Application Approved',
      `Hello ${user.name},\n\nYour clinic application for ${application.clinicName} has been approved! You can now log in to the CuraVet platform.\n\nThank you,\nThe CuraVet Team`
    )
  }

  res.json(application)
}

export const rejectVetApplication = async (req: AuthRequest, res: Response) => {
  const application = await VetApplication.findById(req.params.id)
  if (!application) {
    return res.status(404).json({ message: 'Application not found' })
  }

  const { reason } = req.body

  application.status = 'rejected'
  application.rejectionReason = reason || 'No reason provided'
  await application.save()

  const user = await User.findById(application.vetId)
  if (user) {
    await sendEmail(
      user.email,
      'CuraVet Clinic Application Update',
      `Hello ${user.name},\n\nUnfortunately, your clinic application for ${application.clinicName} was not approved. \n\nReason: ${application.rejectionReason}\n\nIf you have any questions, please reply to this email.\n\nThank you,\nThe CuraVet Team`
    )
  }

  res.json(application)
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
