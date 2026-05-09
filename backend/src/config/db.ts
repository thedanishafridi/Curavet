import mongoose from 'mongoose'

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/CuraVet_Local'
  await mongoose.connect(mongoUri)
  console.log('Connected to MongoDB successfully.')
}

export default connectDB
