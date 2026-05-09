import { Request, Response, NextFunction } from 'express'
import multer from 'multer'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size allowed is 5MB.' })
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` })
  }

  res.status(500).json({ message: 'Server error', error: err.message })
}
