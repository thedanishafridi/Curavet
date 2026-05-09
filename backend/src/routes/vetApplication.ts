import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  getPendingApplications,
  getAllApplications,
  submitVetApplication,
  approveVetApplication,
  rejectVetApplication,
  getMyApplication,
} from '../controllers/vetApplicationController.js'

const router = Router()

router.get('/admin/pending', requireAuth, requireRole('admin'), getPendingApplications)
router.get('/admin/all', requireAuth, requireRole('admin'), getAllApplications)
router.get('/my', requireAuth, getMyApplication)
router.post('/', requireAuth, submitVetApplication)
router.post('/:id/approve', requireAuth, requireRole('admin'), approveVetApplication)
router.post('/:id/reject', requireAuth, requireRole('admin'), rejectVetApplication)

export default router
