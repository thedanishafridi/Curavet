import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const testLogin = async () => {
    await connectDB();
    const email = 'admin@curavet.com';
    const password = 'admin123';
    
    const user = await User.findOne({ email });
    if (!user) {
        console.log('User not found');
    } else {
        const valid = await bcrypt.compare(password, user.passwordHash);
        console.log(`Login for ${email}: ${valid ? 'SUCCESS' : 'FAILURE'}`);
        console.log(`Role: ${user.role}`);
    }
    process.exit(0);
};

testLogin().catch(console.error);
