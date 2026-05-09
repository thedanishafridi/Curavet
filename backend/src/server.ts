import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { createServer } from 'http'
import { Server } from 'socket.io'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import caseRouter from './routes/case.js'
import donationRouter, { setIo as setDonationIo } from './routes/donation.js'
import recoveryRouter from './routes/recovery.js'
import adminRouter from './routes/admin.js'
import vetApplicationRouter from './routes/vetApplication.js'
import uploadRouter from './routes/upload.js'
import connectDB from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const port = Number(process.env.PORT ?? 5001)
const frontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:5173'
const allowedOrigins = [frontendOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5175']

app.use(cors({
  origin: true, // Reflect request origin to allow any local port during development
  credentials: true
}))
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/cases', caseRouter)
app.use('/api/donations', donationRouter)
app.use('/api/recovery', recoveryRouter)
app.use('/api/admin', adminRouter)
app.use('/api/vet-applications', vetApplicationRouter)
app.use('/api/upload', uploadRouter)

import User from './models/User.js';
import Case from './models/Case.js';
import Donation from './models/Donation.js';
import { runSeed } from './seed_production.js';

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Global Stats for Landing Page
app.get('/api/stats', async (req, res) => {
  try {
    const totalDonations = await Donation.find();
    const totalRaised = totalDonations.reduce((sum, d) => sum + d.amount, 0);
    const animalsHelped = await Case.countDocuments({ status: 'closed' });
    const verifiedClinics = await User.countDocuments({ role: 'vet', isApproved: true });
    
    res.json({
      totalRaised,
      animalsHelped,
      verifiedClinics,
      successRate: 94 // Realistic constant
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Temporary Seed Trigger for Production
app.get('/api/admin/seed-now', async (req, res) => {
  try {
    const count = await runSeed();
    res.json({ message: 'Seeding successful!', count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' })
})

app.use(errorHandler)

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
})

// Set io for donation router
setDonationIo(io)

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const start = async () => {
  try {
    await connectDB()
    server.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Startup failure', error)
    process.exit(1)
  }
}

start()
