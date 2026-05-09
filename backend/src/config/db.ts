import mongoose from 'mongoose'

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI
  
  if (!mongoUri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ FATAL: MONGO_URI is not defined in production environment!')
    }
    console.warn('⚠️ MONGO_URI not found, falling back to local database.')
  }

  try {
    await mongoose.connect(mongoUri ?? 'mongodb://127.0.0.1:27017/CuraVet_Local')
    console.log('Connected to MongoDB successfully.')
  } catch (err) {
    if (mongoUri) {
      console.warn('⚠️ Atlas connection failed. Falling back to local database...')
      await mongoose.connect('mongodb://127.0.0.1:27017/CuraVet_Local')
      console.log('Connected to Local MongoDB successfully.')
    } else {
      throw err
    }
  }
}

export default connectDB
