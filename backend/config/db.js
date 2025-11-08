const mongoose = require('mongoose');

const db = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!db) {
      console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
      process.exit(1);
    }
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected successfully!');
  } catch (err) {
    console.error('--- DATABASE CONNECTION FAILED ---');
    console.error('Error Type:', err.name);
    console.error('Error Message:', err.message);
    console.error('----------------------------------');
    console.error('Potential Fixes:');
    console.error('1. Verify the MONGO_URI in your Vercel environment variables is correct.');
    console.error('2. Check if your database password has special characters that need encoding.');
    console.error('3. Ensure your MongoDB Atlas Network Access is set to "0.0.0.0/0" (Allow Access from Anywhere).');

    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
