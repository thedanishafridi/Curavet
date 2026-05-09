import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Case from './models/Case.js'
import connectDB from './config/db.js'

const seedProduction = async () => {
  await connectDB()

  console.log('--- CLEARING DATABASE ---')
  await User.deleteMany({})
  await Case.deleteMany({})
  console.log('✅ Database cleared')

  console.log('\n--- SEEDING CORE USERS ---')
  const salt = await bcrypt.genSalt(10)
  const users = [
    { name: 'Admin Account', email: 'admin@curavet.com', password: 'admin123', role: 'admin', verified: true },
    { name: 'Dr. Sarah Wilson', email: 'vet@curavet.com', password: 'vet123', role: 'vet', verified: true },
    { name: 'John Doe', email: 'donor@curavet.com', password: 'donor123', role: 'donor', verified: true },
  ]

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, salt)
    await User.create({ ...u, passwordHash })
    console.log(`✅ Created ${u.role}: ${u.email}`)
  }

  const vet = await User.findOne({ role: 'vet' })
  if (!vet) throw new Error('Vet user not found')

  console.log('\n--- SEEDING 50+ CASE ATOMS ---')
  const categories = ['Surgery', 'Medical Treatment', 'Rehabilitation', 'Recovery', 'Other']
  const locations = ['Lahore, PK', 'Karachi, PK', 'Islamabad, PK', 'Faisalabad, PK', 'Multan, PK']
  const animalNames = ['Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Daisy', 'Milo', 'Lucy', 'Buddy', 'Lola']
  const animalTypes = ['dog', 'cat', 'bird', 'rabbit', 'horse']

  const cases = []
  for (let i = 1; i <= 55; i++) {
    const animalName = animalNames[i % animalNames.length]
    const animalType = animalTypes[i % animalTypes.length]
    const category = categories[i % categories.length]
    const location = locations[i % locations.length]
    const fundingGoal = Math.floor(Math.random() * 50000) + 5000
    
    cases.push({
      title: `${category} for ${animalName} the ${animalType}`,
      description: `Urgent ${category.toLowerCase()} required for ${animalName}. This case is critical for the survival and well-being of the animal. Location: ${location}.`,
      category,
      location,
      goalAmount: fundingGoal,
      raisedAmount: Math.floor(Math.random() * fundingGoal * 0.4),
      ownerId: vet._id,
      status: 'open',
      images: [`https://loremflickr.com/800/600/pet,${animalType}?lock=${i}`]
    })
  }

  await Case.insertMany(cases)
  console.log(`✅ Successfully seeded ${cases.length} case atoms.`)

  console.log('\n--- PRODUCTION SEED COMPLETE ---')
  process.exit(0)
}

seedProduction().catch(err => {
  console.error('❌ SEED ERROR:', err)
  process.exit(1)
})
