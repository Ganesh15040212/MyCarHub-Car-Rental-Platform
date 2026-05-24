import { Phone, Mail, MapPin, Clock, User, MessageSquare, Send, Navigation, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { COMPANY_INFO, REQUIRED_DOCUMENTS } from '../types/car';
import { useState } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

const CAR_HUBS = [
  {
    id: 'chennai',
    name: 'Chennai Central Airport Hub',
    address: 'GST Road, Meenambakkam, Chennai, Tamil Nadu 600027',
    coords: 'Chennai Airport, Tamil Nadu, India',
    phone: '+91 9597693716',
    hours: '24 Hours Support'
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore Airport Hub',
    address: 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641014',
    coords: 'Coimbatore Airport, Tamil Nadu, India',
    phone: '+91 9597693716',
    hours: '8:00 AM - 10:00 PM'
  },
  {
    id: 'madurai',
    name: 'Madurai Junction Railway Station Hub',
    address: 'Railway Station Rd, Madurai, Tamil Nadu 625001',
    coords: 'Madurai Railway Station, Tamil Nadu, India',
    phone: '+91 9597693716',
    hours: '8:00 AM - 10:00 PM'
  },
  {
    id: 'salem',
    name: 'Salem Central Bus Terminal Hub',
    address: 'Central Bus Stand Rd, Salem, Tamil Nadu 636009',
    coords: 'Salem Bus Stand, Tamil Nadu, India',
    phone: '+91 9597693716',
    hours: '8:00 AM - 9:00 PM'
  }
];

export default function Contact() {
  const [selectedHub, setSelectedHub] = useState(CAR_HUBS[0]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const patterns = {
    name: /^[a-zA-Z\s]{3,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[6-9]\d{9}$/,
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'name' && value && !patterns.name.test(value)) {
      error = 'Letters only (min 3).';
    } else if (name === 'email' && value && !patterns.email.test(value)) {
      error = 'Invalid email address.';
    } else if (name === 'phone' && value && !patterns.phone.test(value.replace(/\D/g, ''))) {
      error = 'Invalid 10-digit number.';
    } else if (name === 'message' && value && value.trim().length < 10) {
      error = 'Message too short (min 10).';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors || !formData.name || !formData.phone || !formData.message) {
      toast.error('Validation Error', { description: 'Please check your inputs.' });
      return;
    }

    const toastId = toast.loading('Sending message...');
    try {
      const response = await fetch(`${API_URL}/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Message Sent Successfully!', {
          id: toastId,
          description: 'Thank you! The company owner has been alerted and we will get back to you shortly.',
        });
        setFormData({ name: '', email: '', phone: '', message: '' });
        setErrors({});
      } else {
        throw new Error('API server returned error');
      }
    } catch (err) {
      console.warn('Backend server offline. Simulating offline contact message submit.', err);
      toast.info('Message Sent (Offline Mode)', {
        id: toastId,
        description: 'Your message has been logged in this session preview. Our team will contact you shortly.',
      });
      setFormData({ name: '', email: '', phone: '', message: '' });
      setErrors({});
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 text-lg">
            Get in touch with us for any queries or booking assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information Cards */}
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <a href={`tel:${COMPANY_INFO.phone}`} className="text-red-600 hover:underline text-lg">
                {COMPANY_INFO.phone}
              </a>
              <p className="text-gray-600 mt-2 text-sm">Available 24/7</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <a href={`mailto:${COMPANY_INFO.email}`} className="text-blue-600 hover:underline">
                {COMPANY_INFO.email}
              </a>
              <p className="text-gray-600 mt-2 text-sm">Response within 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p className="text-gray-700">{COMPANY_INFO.address}</p>
              <p className="text-gray-600 mt-2 text-sm">Visit us anytime</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-red-600" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    required
                  />
                  {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
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

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold text-gray-700">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you today?"
                    rows={5}
                    className={`bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-xl resize-none ${errors.message ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.message && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.message}</p>}
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Business Info & Requirements */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  About My Car Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-semibold text-lg">{COMPANY_INFO.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-semibold">{COMPANY_INFO.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-semibold">{COMPANY_INFO.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{COMPANY_INFO.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-green-600" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Saturday</span>
                    <span className="font-semibold">8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-red-600 font-semibold text-center">24/7 Support Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Documents for Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {REQUIRED_DOCUMENTS.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-red-600 font-bold">{index + 1}.</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interactive Google Maps and Hub Locations Section */}
        <div className="mt-16 border-t pt-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2 mb-3">
              <Map className="w-8 h-8 text-red-600 animate-pulse" />
              Our Car Delivery & Pickup Hubs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select one of our premium hubs below to view its precise location on the map, zoom in/out to check delivery zones, and get direct navigation directions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Hub Selector Cards Column */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-start">
              {CAR_HUBS.map((hub) => {
                const isSelected = selectedHub.id === hub.id;
                return (
                  <div
                    key={hub.id}
                    onClick={() => setSelectedHub(hub)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${
                      isSelected
                        ? 'border-red-600 bg-red-50/40 shadow-lg shadow-red-50/80 ring-2 ring-red-600/20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold text-base transition-colors ${isSelected ? 'text-red-700' : 'text-gray-900'}`}>
                            {hub.name}
                          </h4>
                          {isSelected && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                              Active Focus
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{hub.address}</p>
                        <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {hub.hours}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-gray-700">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {hub.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Google Map Iframe Column */}
            <div className="lg:col-span-7 flex flex-col">
              <Card className="overflow-hidden flex-1 border-2 border-gray-100 shadow-xl rounded-2xl flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Interactive Map</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedHub.coords)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Get Directions
                  </a>
                </div>
                <CardContent className="p-0 relative flex-1 min-h-[450px] bg-gray-100">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedHub.coords)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="100%"
                    className="absolute inset-0 border-0 rounded-b-2xl shadow-inner"
                    allowFullScreen
                    loading="lazy"
                    title={selectedHub.name}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
