import { Router } from 'express'
import { getCases, getCaseById, getMyCases, createCase, updateCase, deleteCase, getAdminCases, updateCaseStatus } from '../controllers/caseController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate, caseSchema } from '../middleware/validation.js'

const router = Router()

router.get('/', getCases)
router.get('/my', requireAuth, getMyCases)
router.get('/admin/all', requireAuth, requireRole('admin'), getAdminCases)
router.get('/:id', getCaseById)
router.post('/', requireAuth, validate(caseSchema), createCase)
router.patch('/:id', requireAuth, validate(caseSchema.partial()), updateCase)
router.delete('/:id', requireAuth, deleteCase)
router.patch('/:id/status', requireAuth, requireRole('admin'), updateCaseStatus)

export default router
