import express from 'express';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Helper to validate image size (Max 1 MB) for base64 uploads
const validateImageSize = (imgStr) => {
  if (!imgStr) return true;
  // If it's a standard URL (starts with http), it's already hosted on Cloudinary or external CDN, which is valid.
  if (imgStr.startsWith('http')) return true;
  
  // Calculate size in bytes from base64 string
  try {
    const base64Data = imgStr.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    return buffer.length <= 1 * 1024 * 1024; // 1 MB limit
  } catch (err) {
    return false;
  }
};

// GET all cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find({});
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findOne({ id: req.params.id });
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new car (Admin only / Auth managed)
router.post('/', async (req, res) => {
  try {
    const { id, name, price, seater, category, image, images, available } = req.body;
    
    // Validate image size (max 1 MB)
    if (image && !validateImageSize(image)) {
      return res.status(400).json({ message: 'Primary car image exceeds 1 MB limit' });
    }
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        if (images[i] && !validateImageSize(images[i])) {
          return res.status(400).json({ message: `Gallery image ${i + 1} exceeds 1 MB limit` });
        }
      }
    }
    
    // Check if ID already exists
    const carExists = await Car.findOne({ id });
    if (carExists) {
      return res.status(400).json({ message: 'Car with this registration number already exists' });
    }

    const car = new Car({
      id,
      name,
      price,
      seater,
      category,
      image,
      images,
      available: available ?? true
    });

    const createdCar = await car.save();
    res.status(201).json(createdCar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) a car
router.put('/:id', async (req, res) => {
  try {
    const car = await Car.findOne({ id: req.params.id });

    if (car) {
      // If registration number/ID has changed, verify uniqueness and cascade-update existing bookings
      if (req.body.id && req.body.id !== car.id) {
        const carExists = await Car.findOne({ id: req.body.id });
        if (carExists) {
          return res.status(400).json({ message: 'Car with this registration number already exists' });
        }
        const oldId = car.id;
        car.id = req.body.id;
        await Booking.updateMany({ carId: oldId }, { carId: req.body.id });
      }

      // Validate image size (max 1 MB)
      if (req.body.image && !validateImageSize(req.body.image)) {
        return res.status(400).json({ message: 'Primary car image exceeds 1 MB limit' });
      }
      if (req.body.images && Array.isArray(req.body.images)) {
        for (let i = 0; i < req.body.images.length; i++) {
          if (req.body.images[i] && !validateImageSize(req.body.images[i])) {
            return res.status(400).json({ message: `Gallery image ${i + 1} exceeds 1 MB limit` });
          }
        }
      }

      car.name = req.body.name || car.name;
      car.price = req.body.price !== undefined ? req.body.price : car.price;
      car.seater = req.body.seater || car.seater;
      car.category = req.body.category || car.category;
      car.image = req.body.image || car.image;
      car.images = req.body.images !== undefined ? req.body.images : car.images;
      car.available = req.body.available !== undefined ? req.body.available : car.available;

      const updatedCar = await car.save();
      res.json(updatedCar);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a car
router.delete('/:id', async (req, res) => {
  try {
    const result = await Car.deleteOne({ id: req.params.id });
    if (result.deletedCount > 0) {
      res.json({ message: 'Car removed successfully' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
