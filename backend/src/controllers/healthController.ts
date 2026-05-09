import { Request, Response } from 'express'

export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'CuraVet Backend', environment: process.env.NODE_ENV ?? 'development' })
}
