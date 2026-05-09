import { Router, Request, Response } from 'express'
import { getDonations, getMyDonations, getDonationsByCase, createDonation, getVetDonations } from '../controllers/donationController.js'
import { requireAuth } from '../middleware/auth.js'
import { Server } from 'socket.io'
import { validate, donationSchema } from '../middleware/validation.js'

const router = Router()

// Note: io will be set from server.ts
let io: Server

export const setIo = (socketIo: Server) => {
  io = socketIo
}

// GET /api/donations — list all donations
router.get('/', getDonations)

// GET /api/donations/my — logged-in user's donation history
router.get('/my', requireAuth, getMyDonations)

// GET /api/donations/vet — donations for cases owned by the current vet
router.get('/vet', requireAuth, getVetDonations)

// GET /api/donations/case/:caseId — donations for a specific case
router.get('/case/:caseId', getDonationsByCase)

// POST /api/donations — create a donation
router.post('/', requireAuth, validate(donationSchema), async (req: Request, res: Response) => {
  try {
    const result = await createDonation(req as any, res)
    if (res.statusCode === 201 && io) {
      // Emit to all clients
      io.emit('donation_received', {
        caseId: req.body.caseId,
        amount: req.body.amount,
        message: 'New donation received!'
      })
    }
  } catch (error) {
    // Error already handled in controller
  }
})

export default router
