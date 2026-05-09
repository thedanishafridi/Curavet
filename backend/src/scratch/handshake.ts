import dotenv from 'dotenv';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8']);

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function runHandshake() {
  console.log('--- STARTING PRODUCTION READINESS HANDSHAKE ---');
  
  // 1. Database Connection
  console.log('\n[1/3] Testing Database Connection...');
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || '';
  if (!mongoUri.includes('mongodb+srv')) {
    console.error('❌ ERROR: MONGO_URI does not appear to be an Atlas connection string (missing mongodb+srv).');
  } else {
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ SUCCESS: Connected to MongoDB Atlas.');
      await mongoose.disconnect();
    } catch (err) {
      console.error('❌ ERROR: Database connection failed:', err);
    }
  }

  // 2. Email Test
  console.log('\n[2/3] Testing Email Connection (Mailtrap)...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  try {
    await transporter.verify();
    console.log('✅ SUCCESS: Mailtrap SMTP connection verified.');
  } catch (err) {
    console.error('❌ ERROR: Email connection failed:', err);
  }

  // 3. Media Bridge (Cloudinary)
  console.log('\n[3/3] Testing Media Bridge (Cloudinary)...');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('✅ SUCCESS: Cloudinary connection verified.');
    } else {
      console.error('❌ ERROR: Cloudinary ping returned non-ok status:', result);
    }
  } catch (err) {
    console.error('❌ ERROR: Cloudinary connection failed:', err);
  }

  console.log('\n--- HANDSHAKE COMPLETE ---');
}

runHandshake();
