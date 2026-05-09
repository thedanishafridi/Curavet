import { Router } from 'express'
import { registerUser, loginUser, getCurrentUser, changePassword, forgotPassword } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate, registerSchema } from '../middleware/validation.js'

const router = Router()

router.post('/register', validate(registerSchema), registerUser)
router.post('/login', loginUser)
router.get('/me', requireAuth, getCurrentUser)
router.patch('/change-password', requireAuth, changePassword)
router.post('/forgot-password', forgotPassword)

export default router
