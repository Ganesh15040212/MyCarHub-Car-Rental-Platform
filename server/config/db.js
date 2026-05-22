import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mycarhub';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    
    // If it failed connecting to Atlas, try connecting to local fallback
    if (uri !== 'mongodb://127.0.0.1:27017/mycarhub') {
      console.log('🔄 Attempting local fallback MongoDB connection...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/mycarhub');
        console.log(`❇️ Successfully connected to local fallback database: ${localConn.connection.host}`);
        return;
      } catch (localError) {
        console.error(`❌ Local fallback MongoDB connection also failed: ${localError.message}`);
      }
    }
    
    console.log('🚀 Running Express API in fallback memory/offline-support mode. Server remains active!');
  }
};

export default connectDB;
