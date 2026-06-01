import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seater: {
    type: Number,
    required: true,
    enum: [5, 7]
  },
  category: {
    type: String,
    required: true,
    enum: ['manual', 'automatic']
  },
  image: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  available: {
    type: Boolean,
    default: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  availableFrom: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

const Car = mongoose.model('Car', carSchema);

export default Car;
