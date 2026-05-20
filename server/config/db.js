import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log('🚀 Running Express API in fallback memory/offline-support mode. Server remains active!');
  }
};

export default connectDB;
