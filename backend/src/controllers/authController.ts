import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import VetApplication from '../models/VetApplication.js'
import { sendEmail } from '../services/mailer.js'

const jwtSecret = process.env.JWT_SECRET ?? 'curavet_local_secret'

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role, ...extra } = req.body
  const errors: Record<string, string> = {}
  
  if (!name) errors.full_name = 'Name is required'
  if (!email) errors.email = 'Email is required'
  if (!password) errors.password = 'Password is required'
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors })
  }

  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(409).json({ message: 'Validation failed', errors: { email: 'Email already registered' } })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash, role: role ?? 'donor', ...extra })
  const token = jwt.sign({ id: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: '7d' })
  
  const userObj = user.toObject()
  delete userObj.passwordHash

  res.status(201).json({ 
    token, 
    user: { 
      ...userObj,
      id: user._id.toString(),
      isApproved: userObj.isApproved || false
    } 
  })
}

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body
  console.log(`[AUTH] Login attempt: ${email}`)
  
  if (!email || !password) {
    console.warn(`[AUTH] Missing email or password`)
    return res.status(400).json({ message: 'Email and password are required' })
  }
  
  const user = await User.findOne({ email })
  if (!user) {
    console.warn(`[AUTH] User not found: ${email}`)
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    console.warn(`[AUTH] Invalid password for: ${email}`)
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  if (user.role === 'vet' && !user.isApproved) {
    const application = await VetApplication.findOne({ vetId: user._id }).sort({ createdAt: -1 });
    if (application?.status === 'rejected') {
        return res.status(403).json({ message: `Your application was rejected: ${application.rejectionReason}` });
    }
    return res.status(403).json({ message: 'Your account is pending admin approval.' });
  }

  console.log(`[AUTH] Login successful: ${email} (${user.role})`)
  const token = jwt.sign({ id: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: '7d' })
  
  const userObj = user.toObject()
  delete userObj.passwordHash

  res.json({ 
    token, 
    user: { 
      ...userObj,
      id: user._id.toString(),
      isApproved: userObj.isApproved || false
    } 
  })
}

export const getCurrentUser = async (req: Request, res: Response) => {
  const authReq = req as unknown as { user?: { id: string } }
  if (!authReq.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const user = await User.findById(authReq.user.id).select('-passwordHash')
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  res.json(user)
}

export const changePassword = async (req: Request, res: Response) => {
  const authReq = req as unknown as { user?: { id: string } }
  if (!authReq.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' })
  }
  const user = await User.findById(authReq.user.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ message: 'Current password is incorrect' })
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10)
  await user.save()
  res.json({ message: 'Password changed successfully' })
}


export const updateProfile = async (req: Request, res: Response) => {
  const authReq = req as unknown as { user?: { id: string } }
  if (!authReq.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  const { name, avatarUrl } = req.body
  const user = await User.findById(authReq.user.id)
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  if (name) user.name = name
  if (avatarUrl) user.avatarUrl = avatarUrl
  
  await user.save()
  
  const userObj = user.toObject()
  delete userObj.passwordHash
  
  res.json(userObj)
}

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  // Return success even if not found for security
  if (!user) {
    return res.json({ message: 'If an account exists with that email, a reset link has been sent' })
  }
  
  await sendEmail(
    email, 
    'Password Reset Request', 
    `Hello ${user.name}, we received a request to reset your password. Please use the app to set a new one.`
  )
  
  res.json({ message: 'If an account exists with that email, a reset link has been sent' })
}
