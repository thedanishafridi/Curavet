import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const testAtlas = async () => {
    // Testing the SRV format instead of the legacy shard-specific one
    const uri = "mongodb+srv://afrididev01:IM5AN4N0cHHoqRm3@cluster0.uyqrt0k.mongodb.net/Curavet_DB?retryWrites=true&w=majority";
    console.log(`Testing SRV connection to: ${uri.split('@')[1]}`);
    
    if (!uri) {
        console.error('MONGO_URI is missing from .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
        const dbName = mongoose.connection.name;
        console.log(`Database Name: ${dbName}`);
        
        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
    } catch (err: any) {
        console.error('❌ FAILURE: Could not connect to Atlas.');
        console.error('Error Message:', err.message);
        if (err.message.includes('IP address')) {
            console.error('CAUSE: Your current IP is not whitelisted in MongoDB Atlas.');
        }
    }
    process.exit(0);
};

testAtlas().catch(console.error);
