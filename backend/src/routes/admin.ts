import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { getAdminOverview, getPendingRecoveries, getAllCases, getAllUsers } from '../controllers/adminController.js'

const router = Router()

router.get('/overview', requireAuth, requireRole('admin'), getAdminOverview)
router.get('/recoveries/pending', requireAuth, requireRole('admin'), getPendingRecoveries)
router.get('/cases/all', requireAuth, requireRole('admin'), getAllCases)
router.get('/users/all', requireAuth, requireRole('admin'), getAllUsers)

export default router
