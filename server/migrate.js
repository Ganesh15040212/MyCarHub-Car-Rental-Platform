import mongoose from 'mongoose';
import Car from './models/Car.js';
import Booking from './models/Booking.js';
import { carsSeedData } from './config/carsSeed.js';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/mycarhub';

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const hasInsecureIds = await Car.exists({ id: { $regex: /^\d+$/ } });
    if (hasInsecureIds) {
      console.log('⚠️ Numeric vehicle IDs detected in MongoDB!');
      console.log('Initiating database schema migration: dropping old fleet and clearing related bookings...');
      await Car.deleteMany({});
      await Booking.deleteMany({});
      console.log('Migration cleanup complete.');
    }

    const carCount = await Car.countDocuments();
    if (carCount === 0) {
      console.log('Auto-seeding default secure 8-digit cars dataset...');
      await Car.insertMany(carsSeedData);
      console.log(`Successfully seeded ${carsSeedData.length} default cars in MongoDB!`);
    } else {
      console.log(`Database already seeded with ${carCount} cars. Skipping seeding.`);
    }

    console.log('Migration successfully completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

migrate();
