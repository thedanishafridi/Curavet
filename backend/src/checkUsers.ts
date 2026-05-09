import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

const checkUsers = async () => {
  await connectDB();
  const users = await User.find({});
  console.log('--- USER DATABASE ---');
  users.forEach(u => {
    console.log(`Email: ${u.email}, Role: ${u.role}, HasHash: ${!!u.passwordHash}`);
  });
  console.log('---------------------');
  process.exit(0);
};

checkUsers().catch(console.error);
