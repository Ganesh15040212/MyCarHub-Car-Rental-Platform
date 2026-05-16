import { useState } from 'react';
import { X, Check, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Car, REQUIRED_DOCUMENTS } from '../types/car';
import { toast } from 'sonner';

interface BookingModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ car, isOpen, onClose }: BookingModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    aadharNumber: '',
    licenseNumber: '',
    smartCardNumber: '',
    bikeModel: '',
    bikeYear: '',
    bookingDate: '',
    bookingDuration: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation Patterns
  const patterns = {
    customerName: /^[a-zA-Z\s]{3,50}$/,
    phone: /^[6-9]\d{9}$/,
    aadharNumber: /^\d{4}-\d{4}-\d{4}$|^\d{12}$/,
    licenseNumber: /^[A-Z0-9\s/-]{5,20}$/i,
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    
    if (name === 'customerName' && value && !patterns.customerName.test(value)) {
      error = 'Name must be letters only (min 3 chars).';
    } else if (name === 'phone' && value && !patterns.phone.test(value.replace(/\D/g, ''))) {
      error = 'Enter a valid 10-digit mobile number.';
    } else if (name === 'aadharNumber' && value && !patterns.aadharNumber.test(value.trim())) {
      error = 'Aadhar must be 12 digits (XXXX-XXXX-XXXX).';
    } else if (name === 'licenseNumber' && value && !patterns.licenseNumber.test(value.trim())) {
      error = 'Invalid license format.';
    } else if (name === 'smartCardNumber' && value && value.trim().length < 5) {
      error = 'Smart Card number is too short.';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrors({});
    setFormData({
      customerName: '',
      phone: '',
      aadharNumber: '',
      licenseNumber: '',
      smartCardNumber: '',
      bikeModel: '',
      bikeYear: '',
      bookingDate: '',
      bookingDuration: 1,
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final check
    const hasErrors = Object.values(errors).some(err => err !== '');
    const isMissingFields = !formData.customerName || !formData.phone || !formData.aadharNumber ||
                           !formData.licenseNumber || !formData.smartCardNumber || !formData.bookingDate;

    if (hasErrors || isMissingFields) {
      toast.error('Validation Error', { description: 'Please correct the highlighted fields before submitting.' });
      return;
    }

    setIsSuccess(true);
    toast.success('Booking Request Sent!', {
      description: 'Our team will contact you shortly for verification.',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none">
        {isSuccess ? (
          <div className="p-12 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900">Booking Confirmed!</h2>
              <p className="text-gray-500 font-medium max-w-sm mx-auto">
                Thank you, <span className="text-red-600 font-bold">{formData.customerName}</span>. 
                Your booking for the <span className="font-bold">{car.name}</span> has been successfully placed.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booking ID</span>
                <span className="font-mono font-bold text-gray-900">MCH-{Math.floor(Math.random() * 100000)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Amount</span>
                <span className="font-bold text-red-600">₹{car.price * formData.bookingDuration}</span>
              </div>
            </div>
            <Button 
              onClick={handleClose}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-red-600" />
                Book {car.name}
              </DialogTitle>
            </DialogHeader>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-lg mb-2">Rental Details:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Price: <span className="font-bold">₹{car.price}/day</span></p>
                <p>Seater: <span className="font-bold">{car.seater}-Seater</span></p>
                <p className="col-span-2">Limit: <span className="font-bold">300 KM in 24 Hours</span></p>
                <p className="col-span-2">Extra: <span className="font-bold">₹{car.seater === 5 ? '5' : '8'}/KM, ₹{car.seater === 5 ? '200' : '300'}/Hour</span></p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <p className="font-semibold mb-2">Required Documents:</p>
              <ul className="space-y-1 text-sm">
                {REQUIRED_DOCUMENTS.map((doc, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-semibold text-gray-700">Full Name *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 ${errors.customerName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    required
                  />
                  {errors.customerName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.customerName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className={`bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                    required
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber" className="text-sm font-semibold text-gray-700">Aadhar Number *</Label>
                    <Input
                      id="aadharNumber"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleChange}
                      placeholder="XXXX-XXXX-XXXX"
                      className={`bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 ${errors.aadharNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                    {errors.aadharNumber && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.aadharNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aadharPhoto" className="text-sm font-semibold text-gray-700">Upload Aadhar (Original Photo) *</Label>
                    <Input
                      id="aadharPhoto"
                      type="file"
                      accept="image/*"
                      className="bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-2 h-auto"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-sm font-semibold text-gray-700">Driving License Number *</Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="Enter license number"
                      className={`bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 ${errors.licenseNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                    {errors.licenseNumber && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.licenseNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licensePhoto" className="text-sm font-semibold text-gray-700">Upload License (Original Photo) *</Label>
                    <Input
                      id="licensePhoto"
                      type="file"
                      accept="image/*"
                      className="bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-2 h-auto"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <Label htmlFor="smartCardNumber" className="text-sm font-semibold text-gray-700">Smart Card Number *</Label>
                    <Input
                      id="smartCardNumber"
                      name="smartCardNumber"
                      value={formData.smartCardNumber}
                      onChange={handleChange}
                      placeholder="Enter smart card number"
                      className={`bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 ${errors.smartCardNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                    {errors.smartCardNumber && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.smartCardNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smartCardPhoto" className="text-sm font-semibold text-gray-700">Upload Smart Card (Original Photo) *</Label>
                    <Input
                      id="smartCardPhoto"
                      type="file"
                      accept="image/*"
                      className="bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-2 h-auto"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Label htmlFor="bookingDate" className="text-sm font-semibold text-gray-700">Booking Date *</Label>
                  <Input
                    id="bookingDate"
                    name="bookingDate"
                    type="date"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 mt-2"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Label htmlFor="bookingDuration" className="text-sm font-semibold text-gray-700">Duration (Days) *</Label>
                  <Input
                    id="bookingDuration"
                    name="bookingDuration"
                    type="number"
                    min="1"
                    value={formData.bookingDuration}
                    onChange={handleChange}
                    className="bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 mt-2"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Label htmlFor="bikeModel" className="text-sm font-semibold text-gray-700">Bike/Scooter Model (Optional)</Label>
                  <Input
                    id="bikeModel"
                    name="bikeModel"
                    value={formData.bikeModel}
                    onChange={handleChange}
                    placeholder="e.g., Honda Activa"
                    className="bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 mt-2"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Label htmlFor="bikeYear" className="text-sm font-semibold text-gray-700">Bike/Scooter Year (Optional)</Label>
                  <Input
                    id="bikeYear"
                    name="bikeYear"
                    type="number"
                    min="2020"
                    max={new Date().getFullYear()}
                    value={formData.bikeYear}
                    onChange={handleChange}
                    placeholder="2020 or above"
                    className="bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 mt-2"
                  />
                </div>
              </div>

              <div className="bg-red-50/50 border border-red-100 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-lg font-bold text-gray-900">Total Amount</p>
                  <p className="text-2xl font-black text-red-600">₹{car.price * formData.bookingDuration}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <p>For {formData.bookingDuration} day{formData.bookingDuration > 1 ? 's' : ''}</p>
                  <p>+ ₹10,000 Refundable Deposit</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={handleClose} className="hover:bg-gray-100 py-6 text-gray-600">
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95">
                  Confirm Booking
                </Button>
              </div>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                * This is a demonstration. All data entered here is only used for this preview and will not be stored permanently.
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
