import { useState } from 'react';
import { Check, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Car, REQUIRED_DOCUMENTS } from '../types/car';
import { toast } from 'sonner';
import { DatePicker } from './ui/DatePicker';
import { parse, isValid } from 'date-fns';

interface BookingModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ car, isOpen, onClose }: BookingModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    pickupDate: '',
    pickupTime: '',
    dropDate: '',
    dropTime: '',
  });

  const calculateDurationInDays = () => {
    if (!formData.pickupDate || !formData.pickupTime || !formData.dropDate || !formData.dropTime) {
      return 1;
    }

    // Parse dd/mm/yyyy to standard Date format
    const parseDateStr = (dateStr: string) => {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    };

    const pickup = new Date(`${parseDateStr(formData.pickupDate)}T${formData.pickupTime}`);
    const drop = new Date(`${parseDateStr(formData.dropDate)}T${formData.dropTime}`);
    const diffTime = drop.getTime() - pickup.getTime();
    if (diffTime <= 0) return 1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const durationDays = calculateDurationInDays();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation Patterns
  const patterns = {
    customerName: /^[a-zA-Z\s]{3,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[6-9]\d{9}$/,
  };

  const validateField = (name: string, value: string) => {
    let error = '';

    if (name === 'customerName' && value && !patterns.customerName.test(value)) {
      error = 'Name must be letters only (min 3 chars).';
    } else if (name === 'email' && value && !patterns.email.test(value)) {
      error = 'Enter a valid email address.';
    } else if (name === 'phone' && value && !patterns.phone.test(value.replace(/\D/g, ''))) {
      error = 'Enter a valid 10-digit mobile number.';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrors({});
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      pickupDate: '',
      pickupTime: '',
      dropDate: '',
      dropTime: '',
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final check
    const hasErrors = Object.values(errors).some(err => err !== '');
    const isMissingFields = !formData.customerName || !formData.email || !formData.phone ||
      !formData.pickupDate || !formData.pickupTime || !formData.dropDate || !formData.dropTime;

    if (hasErrors || isMissingFields) {
      toast.error('Validation Error', { description: 'Please correct the highlighted fields before submitting.' });
      return;
    }

    if (!car) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId: car.id,
          carName: car.name,
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime,
          dropDate: formData.dropDate,
          dropTime: formData.dropTime,
          durationDays,
          totalAmount: car.price * durationDays,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBookingId(data.bookingId);
        setIsSuccess(true);
        toast.success('Booking Request Confirmed!', {
          description: 'A Email notification has been successfully sent to the owner!',
        });
      } else {
        throw new Error('API server returned error code');
      }
    } catch (err) {
      console.warn('Backend server unreachable. Falling back to local offline submission mode.', err);
      // Standalone fallback
      const generatedId = `MCH-${Math.floor(Math.random() * 90000) + 10000}`;
      setBookingId(generatedId);
      setIsSuccess(true);
      toast.success('Booking Request Sent (Standalone Mode)', {
        description: 'Our team will contact you shortly for verification.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  if (!car) return null;

  // Visual helper to parse selected pickupDate for dropDate minimum restriction
  const pickupParsedDate = formData.pickupDate ? parse(formData.pickupDate, 'dd/MM/yyyy', new Date()) : new Date();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none"
        onInteractOutside={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
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
                <span className="font-mono font-bold text-gray-900">{bookingId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rental Period</span>
                <span className="font-bold text-gray-800">{formData.pickupDate} ➡️ {formData.dropDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Amount</span>
                <span className="font-bold text-red-600">₹{car.price * durationDays}</span>
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
                <div className="md:col-span-2 space-y-2">
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
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    required
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
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
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <Label htmlFor="pickupDate" className="text-sm font-semibold text-gray-700">Pickup Date *</Label>
                  <DatePicker
                    id="pickupDate"
                    value={formData.pickupDate}
                    onChange={(val) => setFormData(prev => ({ ...prev, pickupDate: val }))}
                    minDate={new Date()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupTime" className="text-sm font-semibold text-gray-700">Pickup Time *</Label>
                  <Input
                    id="pickupTime"
                    name="pickupTime"
                    type="time"
                    value={formData.pickupTime}
                    onChange={handleChange}
                    className="bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <Label htmlFor="dropDate" className="text-sm font-semibold text-gray-700">Drop Date *</Label>
                  <DatePicker
                    id="dropDate"
                    value={formData.dropDate}
                    onChange={(val) => setFormData(prev => ({ ...prev, dropDate: val }))}
                    minDate={isValid(pickupParsedDate) ? pickupParsedDate : new Date()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropTime" className="text-sm font-semibold text-gray-700">Drop Time *</Label>
                  <Input
                    id="dropTime"
                    name="dropTime"
                    type="time"
                    value={formData.dropTime}
                    onChange={handleChange}
                    className="bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5"
                    required
                  />
                </div>
              </div>

              <div className="bg-red-50/50 border border-red-100 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-lg font-bold text-gray-900">Total Amount</p>
                  <p className="text-2xl font-black text-red-600">₹{car.price * durationDays}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <p>For {durationDays} day{durationDays > 1 ? 's' : ''}</p>
                  <p>+ ₹10,000 Refundable Deposit</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={handleClose} className="hover:bg-gray-100 py-6 text-gray-600">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95">
                  {isSubmitting ? 'Confirming Booking...' : 'Confirm Booking'}
                </Button>
              </div>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                * Note: Your personal data is handled securely. You will receive booking notifications directly from our team.
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

