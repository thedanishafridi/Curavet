
const mongoose = require('mongoose');
const uri = 'mongodb+srv://afrididev01:IM5AN4N0cHHoqRm3@cluster0.uyqrt0k.mongodb.net/?appName=Cluster0';

async function test() {
  try {
    console.log('Connecting...');
    await mongoose.connect(uri);
    console.log('Connected!');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}
test();
