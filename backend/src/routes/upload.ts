import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { requireAuth } from '../middleware/auth.js'

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

let storage;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('[UPLOAD] Using Cloudinary Storage')
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'curavet',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    } as any,
  })
} else {
  console.log('[UPLOAD] Using Local Disk Storage')
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'uploads'))
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = path.extname(file.originalname)
      cb(null, `${uniqueSuffix}${ext}`)
    },
  })
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

const router = Router()

router.post('/', requireAuth, upload.array('images', 5), (req: Request, res: Response) => {
  const files = req.files as any[]
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' })
  }

  // Cloudinary uses 'path' or 'secure_url', Multer local uses 'filename'
  const urls = files.map(f => f.path || f.secure_url || `${req.protocol}://${req.get('host')}/uploads/${f.filename}`)
  
  res.status(201).json({ urls })
})

export default router
