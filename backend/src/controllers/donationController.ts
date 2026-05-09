import { Request, Response } from 'express'
import Donation from '../models/Donation.js'
import Case from '../models/Case.js'
import { AuthRequest } from '../middleware/auth.js'

export const getDonations = async (req: Request, res: Response) => {
  const donations = await Donation.find().sort({ createdAt: -1 })
  res.json(donations)
}

export const getMyDonations = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const donations = await Donation.find({ donorId: req.user.id })
    .populate('caseId', 'title category location images goalAmount raisedAmount status')
    .sort({ createdAt: -1 })
  res.json(donations)
}

export const getDonationsByCase = async (req: Request, res: Response) => {
  const { caseId } = req.params
  const donations = await Donation.find({ caseId })
    .populate('donorId', 'name')
    .sort({ createdAt: -1 })
  res.json(donations)
}

export const createDonation = async (req: AuthRequest, res: Response) => {
  const { caseId, amount, message } = req.body
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const existingCase = await Case.findById(caseId)
  if (!existingCase) {
    return res.status(404).json({ message: 'Case not found' })
  }
  const donation = await Donation.create({ caseId, donorId: req.user.id, amount, message })
  existingCase.raisedAmount += Number(amount)
  // Auto-close case when fully funded
  if (existingCase.raisedAmount >= existingCase.goalAmount) {
    existingCase.status = 'closed'
  }
  await existingCase.save()
  res.status(201).json(donation)
}

export const getVetDonations = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  // Find all cases owned by this vet
  const myCases = await Case.find({ ownerId: req.user.id }).select('_id')
  const caseIds = myCases.map(c => c._id)
  
  // Find all donations for these cases
  const donations = await Donation.find({ caseId: { $in: caseIds } })
    .populate('caseId', 'title')
    .populate('donorId', 'name email')
    .sort({ createdAt: -1 })
    
  res.json(donations)
}
