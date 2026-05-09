import { Request, Response } from 'express'
import Recovery from '../models/Recovery.js'
import Case from '../models/Case.js'
import { AuthRequest } from '../middleware/auth.js'

export const getRecoveryRequests = async (req: Request, res: Response) => {
  const requests = await Recovery.find().sort({ createdAt: -1 }).populate('caseId').populate('vetId', 'name email')
  res.json(requests)
}

export const getRecoveriesByCase = async (req: Request, res: Response) => {
  const { caseId } = req.params
  const requests = await Recovery.find({ caseId })
    .sort({ createdAt: -1 })
    .populate('vetId', 'name email')
  res.json(requests)
}

export const createRecoveryRequest = async (req: AuthRequest, res: Response) => {
  const { caseId, notes, beforeImageUrl, afterImageUrl } = req.body
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const existingCase = await Case.findById(caseId)
  if (!existingCase) {
    return res.status(404).json({ message: 'Case not found' })
  }
  const recovery = await Recovery.create({
    caseId,
    vetId: req.user.id,
    notes,
    beforeImageUrl,
    afterImageUrl,
    status: 'requested'
  })
  res.status(201).json(recovery)
}

export const updateRecoveryRequest = async (req: AuthRequest, res: Response) => {
  const recovery = await Recovery.findById(req.params.id)
  if (!recovery) {
    return res.status(404).json({ message: 'Recovery request not found' })
  }
  if (recovery.vetId.toString() !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  recovery.status = req.body.status ?? recovery.status
  recovery.notes = req.body.notes ?? recovery.notes
  await recovery.save()
  res.json(recovery)
}

export const getPendingRecoveryRequests = async (req: Request, res: Response) => {
  const requests = await Recovery.find({ status: 'requested' })
    .sort({ createdAt: -1 })
    .populate('caseId')
    .populate('vetId', 'name email')
  res.json(requests)
}

export const approveRecoveryRequest = async (req: AuthRequest, res: Response) => {
  const recovery = await Recovery.findById(req.params.id)
  if (!recovery) {
    return res.status(404).json({ message: 'Recovery request not found' })
  }
  recovery.status = 'in_progress'
  await recovery.save()
  res.json(recovery)
}

export const rejectRecoveryRequest = async (req: AuthRequest, res: Response) => {
  const recovery = await Recovery.findById(req.params.id)
  if (!recovery) {
    return res.status(404).json({ message: 'Recovery request not found' })
  }
  await Recovery.deleteOne({ _id: req.params.id })
  res.json({ message: 'Recovery request rejected' })
}
