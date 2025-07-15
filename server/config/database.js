const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Database URL:', process.env.MONGODB_URI ? 'Set' : 'Not set');

    console.log(process.env.MONGODB_URI);
    if (!process.env.MONGODB_URI) {

      throw new Error('DATABASE_URL is not set in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Database connection error stack:', error.stack);
    process.exit(1);
  }
};

module.exports = { connectDB };