import { Request, Response } from 'express'
import User from '../models/User.js'
import Case from '../models/Case.js'
import Recovery from '../models/Recovery.js'
import VetApplication from '../models/VetApplication.js'
import Donation from '../models/Donation.js'

export const getAdminOverview = async (req: Request, res: Response) => {
  const totalUsers = await User.countDocuments()
  const totalVets = await User.countDocuments({ role: 'vet' })
  const totalDonors = await User.countDocuments({ role: 'donor' })
  const totalAdmins = await User.countDocuments({ role: 'admin' })
  const totalCases = await Case.countDocuments()
  const openCases = await Case.countDocuments({ status: { $in: ['open', 'active'] } })
  const recoveredCases = await Case.countDocuments({ status: 'recovered' })
  const totalRecoveries = await Recovery.countDocuments()
  const pendingRecoveries = await Recovery.countDocuments({ status: 'requested' })
  const pendingVetApplications = await VetApplication.countDocuments({ status: 'pending' })

  const donations = await Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
  const totalFunds = donations.length > 0 ? donations[0].total : 0

  res.json({
    totalUsers,
    totalVets,
    totalDonors,
    totalAdmins,
    totalCases,
    openCases,
    recoveredCases,
    totalRecoveries,
    pendingRecoveries,
    pendingVetApplications,
    totalFunds,
  })
}

export const getPendingRecoveries = async (req: Request, res: Response) => {
  const recoveries = await Recovery.find({ status: 'requested' })
    .sort({ createdAt: -1 })
    .populate('caseId')
    .populate('vetId', 'name email')
    .limit(20)
  res.json(recoveries)
}

export const getAllCases = async (req: Request, res: Response) => {
  const cases = await Case.find()
    .populate('ownerId', 'name email role')
    .sort({ createdAt: -1 })
  res.json(cases)
}

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 })
  res.json(users)
}
