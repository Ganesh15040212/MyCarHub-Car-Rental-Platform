import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  carId: {
    type: String,
    required: true
  },
  carName: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  pickupDate: {
    type: String,
    required: true // dd/mm/yyyy format
  },
  pickupTime: {
    type: String,
    required: true
  },
  dropDate: {
    type: String,
    required: true // dd/mm/yyyy format
  },
  dropTime: {
    type: String,
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
