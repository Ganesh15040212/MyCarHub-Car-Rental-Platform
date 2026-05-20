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
    default: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&q=80&w=800"
    ]
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
