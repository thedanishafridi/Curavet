import { Router } from 'express'
import { getRecoveryRequests, getRecoveriesByCase, createRecoveryRequest, updateRecoveryRequest, getPendingRecoveryRequests, approveRecoveryRequest, rejectRecoveryRequest } from '../controllers/recoveryController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', getRecoveryRequests)
router.get('/case/:caseId', getRecoveriesByCase)
router.get('/admin/pending', requireAuth, requireRole('admin'), getPendingRecoveryRequests)
router.post('/', requireAuth, createRecoveryRequest)
router.patch('/:id', requireAuth, updateRecoveryRequest)
router.post('/:id/approve', requireAuth, requireRole('admin'), approveRecoveryRequest)
router.post('/:id/reject', requireAuth, requireRole('admin'), rejectRecoveryRequest)

export default router
