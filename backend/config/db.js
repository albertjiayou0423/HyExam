const mongoose = require('mongoose');

const db = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!db) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
