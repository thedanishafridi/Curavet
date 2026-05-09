import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const compareUsers = async () => {
    await connectDB();
    const users = await User.find({});
    console.log('--- USER HASH COMPARISON ---');
    for (const user of users) {
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Hash: ${user.passwordHash}`);
        console.log('----------------------------');
    }
    process.exit(0);
};

compareUsers().catch(console.error);
