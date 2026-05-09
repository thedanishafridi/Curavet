import { Request, Response } from 'express'
import Case from '../models/Case.js'
import { AuthRequest } from '../middleware/auth.js'

export const getCases = async (req: Request, res: Response) => {
  const cases = await Case.find().sort({ createdAt: -1 })
  res.json(cases)
}

export const getCaseById = async (req: Request, res: Response) => {
  const existing = await Case.findById(req.params.id).populate('ownerId', 'name email role clinicName clinicAddress');
  if (!existing) {
    return res.status(404).json({ message: 'Case not found' })
  }
  res.json({ case: existing })
}

export const getMyCases = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const cases = await Case.find({ ownerId: req.user.id }).sort({ createdAt: -1 })
  res.json(cases)
}

export const createCase = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { 
    title, description, category, location, goalAmount, images,
    petName, petBreed, petAge, petType, urgency, medicalHistory, diagnosis, treatmentPlan 
  } = req.body

  const newCase = await Case.create({
    title,
    description,
    category: category || petType || 'Medical',
    location,
    goalAmount,
    ownerId: req.user.id,
    images: images || [],
    petName,
    petBreed,
    petAge,
    petType,
    urgency,
    medicalHistory,
    diagnosis,
    treatmentPlan
  })
  res.status(201).json(newCase)
}

export const updateCase = async (req: AuthRequest, res: Response) => {
  const existing = await Case.findById(req.params.id)
  if (!existing) {
    return res.status(404).json({ message: 'Case not found' })
  }
  if (existing.ownerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  const updates = req.body
  Object.assign(existing, updates)
  await existing.save()
  res.json(existing)
}

export const getAdminCases = async (req: Request, res: Response) => {
  const cases = await Case.find()
    .populate('ownerId', 'name email role')
    .sort({ createdAt: -1 })
  res.json(cases)
}

export const updateCaseStatus = async (req: AuthRequest, res: Response) => {
  const existing = await Case.findById(req.params.id)
  if (!existing) {
    return res.status(404).json({ message: 'Case not found' })
  }
  const { status } = req.body
  if (!['open', 'closed', 'recovered'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }
  existing.status = status
  await existing.save()
  res.json(existing)
}

export const deleteCase = async (req: AuthRequest, res: Response) => {
  const existing = await Case.findById(req.params.id)
  if (!existing) {
    return res.status(404).json({ message: 'Case not found' })
  }
  if (existing.ownerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  await Case.deleteOne({ _id: req.params.id })
  res.json({ message: 'Case deleted successfully' })
}
