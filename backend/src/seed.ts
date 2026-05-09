import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Case from './models/Case.js'
import Recovery from './models/Recovery.js'
import connectDB from './config/db.js'

export async function seedAll() {
  await connectDB()

  const users = [
    { name: 'Admin One', email: 'admin@curavet.com', password: 'admin123', role: 'admin' },
    { name: 'Admin Two', email: 'admin2@curavet.com', password: 'admin123', role: 'admin' },
    { name: 'Admin Three', email: 'admin3@curavet.com', password: 'admin123', role: 'admin' },
    { name: 'Vet User', email: 'vet@curavet.com', password: 'vet123', role: 'vet' },
    { name: 'Donor User', email: 'donor@curavet.com', password: 'donor123', role: 'donor' },
  ]

  let userCount = 0;
  for (const userData of users) {
    const existing = await User.findOne({ email: userData.email })
    const passwordHash = await bcrypt.hash(userData.password, 10)
    if (!existing) {
      await User.create({ ...userData, passwordHash })
      console.log(`Created user: ${userData.email}`)
      userCount++;
    } else {
      existing.passwordHash = passwordHash
      existing.role = userData.role
      await existing.save()
      console.log(`Updated existing user: ${userData.email}`)
      userCount++;
    }
  }

  // Seed sample cases
  const vetUser = await User.findOne({ email: 'vet@curavet.com' })
  if (vetUser) {
    const sampleCases = [
      {
        title: 'Emergency Surgery for Injured Dog',
        description: 'A stray dog was hit by a car and needs immediate surgery for a broken leg. The cost is $1500.',
        category: 'Surgery',
        location: 'New York, NY',
        goalAmount: 1500,
        ownerId: vetUser._id,
        images: [],
      },
      {
        title: 'Cat with Feline Leukemia Treatment',
        description: 'This cat has been diagnosed with feline leukemia and needs ongoing treatment costing $800.',
        category: 'Medical Treatment',
        location: 'Los Angeles, CA',
        goalAmount: 800,
        ownerId: vetUser._id,
        images: [],
      },
      {
        title: 'Bird Rescue and Rehabilitation',
        description: 'A wild bird with a broken wing needs rehabilitation and care. Estimated cost: $300.',
        category: 'Rehabilitation',
        location: 'Chicago, IL',
        goalAmount: 300,
        ownerId: vetUser._id,
        images: [],
        status: 'active',
        isApproved: true,
      },
    ]

    for (const caseData of sampleCases) {
      const existing = await Case.findOne({ title: caseData.title })
      if (!existing) {
        await Case.create(caseData)
        console.log(`Created case: ${caseData.title}`)
      } else {
        console.log(`Case already exists: ${caseData.title}`)
      }
    }
    // Seed sample recoveries for the feed
    const allCases = await Case.find().limit(2);
    for (const c of allCases) {
      const existingRecovery = await Recovery.findOne({ caseId: c._id });
      if (!existingRecovery) {
        await Recovery.create({
          caseId: c._id,
          vetId: c.ownerId,
          notes: `Amazing progress! ${c.title} is recovering well and will be ready for adoption soon.`,
          status: 'completed',
          afterImageUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=800'
        });
        console.log(`Created recovery for: ${c.title}`);
      }
    }
  }

  console.log('Seeding completed')

  return userCount;
}

// Support direct execution too
if (process.argv && process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedAll().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}