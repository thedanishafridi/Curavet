
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Case from './models/Case.js';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined');
  process.exit(1);
}

const animalData = [
  { type: 'dog', breed: 'German Shepherd', titles: ['Leg Surgery', 'Parvo Recovery', 'Hit and Run Recovery'] },
  { type: 'cat', breed: 'Persian', titles: ['Kidney Treatment', 'Eye Infection', 'Stray Rescue'] },
  { type: 'bird', breed: 'Parrot', titles: ['Wing Repair', 'Beak Infection', 'Feather Plucking Recovery'] },
  { type: 'rabbit', breed: 'Holland Lop', titles: ['Dental Surgery', 'Ear Mite Treatment', 'GI Stasis Support'] },
  { type: 'horse', breed: 'Arabian', titles: ['Colic Surgery', 'Hoof Treatment', 'Rescue Sanctuary Support'] },
  { type: 'other', breed: 'Turtle', titles: ['Shell Repair', 'Vitamin Deficiency', 'Habitat Rescue'] },
];

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
const urgencies = ['critical', 'high', 'medium', 'low', 'stable'];

export async function runSeed() {
  const vet = await User.findOne({ role: 'vet' });
  if (!vet) {
    throw new Error('No vet user found. Please ensure users are seeded first.');
  }

  // Clear existing cases
  await Case.deleteMany({});
  
  const cases = [];
  // Create 10 cases for each type to ensure full testing
  for (const animal of animalData) {
    for (let i = 0; i < 10; i++) {
      const title = `${animal.titles[i % animal.titles.length]} - ${animal.breed} #${i + 1}`;
      const goalAmount = Math.floor(Math.random() * 150000) + 10000;
      const raisedAmount = Math.floor(Math.random() * (goalAmount * 0.8));
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      cases.push({
        title,
        petName: `Pet${i + 1}`,
        petBreed: animal.breed,
        petAge: Math.floor(Math.random() * 10) + 1,
        petType: animal.type.charAt(0).toUpperCase() + animal.type.slice(1),
        urgency,
        medicalHistory: 'Previously healthy. Rescued from the street.',
        description: `This ${animal.type} is in urgent need of ${title.toLowerCase()}. We need funds to cover the surgery and post-op care.`,
        diagnosis: `Clinical examination revealed ${animal.titles[i % animal.titles.length].toLowerCase()}.`,
        treatmentPlan: 'Immediate surgery followed by 2 weeks of antibiotic treatment and rehabilitation.',
        goalAmount,
        raisedAmount,
        location: city,
        status: 'open',
        ownerId: vet._id,
        images: [`https://loremflickr.com/800/600/${animal.type}?lock=${i + 100}`],
        isApproved: true,
      });
    }
  }

  await Case.insertMany(cases);
  return cases.length;
}
