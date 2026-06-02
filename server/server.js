import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/db.js';
import carRoutes from './routes/carRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import Car from './models/Car.js';
import Admin from './models/Admin.js';
import Booking from './models/Booking.js';
import { carsSeedData } from './config/carsSeed.js';

// Load environmental variables relative to current file in ESM
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

// Establish MongoDB connection
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Endpoints
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🚗 MyCarHub API is running smoothly...');
});

// Automatic Database Seeding
const seedDatabase = async () => {
  try {
    // 1. Migrate numeric vehicle IDs if present
    const hasInsecureIds = await Car.exists({ id: { $regex: /^\d+$/ } });
    if (hasInsecureIds) {
      console.log('⚠️ Numeric vehicle IDs detected in MongoDB. Dropping collections for clean seeder migration...');
      await Car.deleteMany({});
      await Booking.deleteMany({});
      console.log('Migration cleanup complete. Proceeding with fresh Indian Car Number seeding...');
    }

    // 2. Seed cars
    const carCount = await Car.countDocuments();
    if (carCount === 0) {
      console.log('Database empty! Auto-seeding default cars dataset...');
      await Car.insertMany(carsSeedData);
      console.log(`Successfully seeded ${carsSeedData.length} default cars in MongoDB!`);
    } else {
      console.log(`Database already seeded with ${carCount} cars. Skipping seeding.`);
    }

    // 3. Clear default Unsplash gallery URLs from all existing cars in MongoDB to resolve pre-seeded lists
    const cleanRes = await Car.updateMany(
      { images: { $elemMatch: { $regex: /unsplash\.com/ } } },
      { $set: { images: [] } }
    );
    if (cleanRes.modifiedCount > 0) {
      console.log(`🧹 Successfully cleaned up default Unsplash gallery images for ${cleanRes.modifiedCount} cars in MongoDB!`);
    }

    // 2. Seed default admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('Admin empty! Auto-seeding default administrator account...');
      const defaultAdmin = new Admin({
        email: 'admin@mycarhub.com',
        password: 'adminPassword123'
      });
      await defaultAdmin.save();
      console.log('Successfully seeded default admin: admin@mycarhub.com in MongoDB!');
    } else {
      console.log('Admin account already exists in database. Skipping admin seeding.');
    }

    // 3. Synchronize all cars' availability with active confirmed or pending bookings at server boot
    console.log('🔄 Synchronizing all car availability states with active bookings...');
    const allCars = await Car.find({});
    
    const parseDateStr = (dateStr) => {
      if (!dateStr) return new Date(0);
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(dateStr);
    };

    for (const car of allCars) {
      const activeBookings = await Booking.find({ 
        carId: car.id, 
        status: { $in: ['Confirmed', 'Pending'] } 
      });

      if (activeBookings.length > 0) {
        let latestBooking = activeBookings[0];
        let latestDate = parseDateStr(latestBooking.dropDate);

        for (let i = 1; i < activeBookings.length; i++) {
          const currentDate = parseDateStr(activeBookings[i].dropDate);
          if (currentDate > latestDate) {
            latestDate = currentDate;
            latestBooking = activeBookings[i];
          }
        }

        await Car.findOneAndUpdate(
          { id: car.id },
          { isBooked: true, availableFrom: latestBooking.dropDate }
        );
      } else {
        await Car.findOneAndUpdate(
          { id: car.id },
          { isBooked: false, availableFrom: '' }
        );
      }
    }
    console.log('✅ Car availability synchronization complete!');
  } catch (error) {
    console.error(`Auto-seeding failed: ${error.message}`);
  }
};

// Seed db after connection established
import mongoose from 'mongoose';
mongoose.connection.once('open', () => {
  seedDatabase();
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
