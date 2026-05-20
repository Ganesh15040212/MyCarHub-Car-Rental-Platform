import express from 'express';
import Car from '../models/Car.js';

const router = express.Router();

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
    
    // Check if ID already exists
    const carExists = await Car.findOne({ id });
    if (carExists) {
      return res.status(400).json({ message: 'Car with this ID already exists' });
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
