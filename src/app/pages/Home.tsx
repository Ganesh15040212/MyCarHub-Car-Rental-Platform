import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Car, Shield, Clock, HeadphonesIcon, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import CarCard from '../components/CarCard';
import { fiveSeaterCars, sevenSeaterCars } from '../data/cars';

export default function Home() {
  const [cars, setCars] = useState<any[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cars');
        if (response.ok) {
          const data = await response.json();
          setCars(data);
        } else {
          throw new Error('Failed to fetch from API');
        }
      } catch (err) {
        console.warn('Backend server offline. Falling back to static cars.', err);
        setCars([...fiveSeaterCars, ...sevenSeaterCars]);
      }
    };

    fetchCars();

    // Live update: Poll cars every 4 seconds to sync live with backend / admin changes
    const interval = setInterval(() => {
      fetchCars();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Filter active and available cars, displaying a mix of 6 featured cars
  const activeCars = cars.length > 0 ? cars.filter(c => c.available) : [...fiveSeaterCars, ...sevenSeaterCars].filter(c => c.available);
  const featuredCars = activeCars.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Drive Your Dreams with My Car Hub
              </h1>
              <p className="text-xl mb-8 text-red-100">
                Premium self-driving cars at affordable prices. Choose from our wide range of 5-seater and 7-seater vehicles.
              </p>
              <div className="flex gap-4">
                <Link to="/cars">
                  <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                    Browse Cars
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-red-600 transition-all">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?w=800&auto=format&fit=crop&q=80"
                alt="Scenic road trip with an SUV"
                className="rounded-lg shadow-2xl object-cover h-[400px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose My Car Hub?</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
                <p className="text-gray-600">40+ vehicles from economy to premium SUVs</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
                <p className="text-gray-600">Well-maintained cars with full insurance</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Rental</h3>
                <p className="text-gray-600">24-hour rental with fair pricing</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">Round-the-clock customer assistance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Vehicles</h2>
            <p className="text-gray-600">Explore our most popular self-driving cars</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/cars">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                View All Cars
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple & Transparent Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-red-600">5-Seater Cars</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting from:</span>
                    <span className="font-bold">₹1,500/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KM Limit:</span>
                    <span className="font-bold">300 KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extra KM:</span>
                    <span className="font-bold">₹5/KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extra Hour:</span>
                    <span className="font-bold">₹200/Hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-blue-600">7-Seater Cars</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting from:</span>
                    <span className="font-bold">₹2,600/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KM Limit:</span>
                    <span className="font-bold">300 KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extra KM:</span>
                    <span className="font-bold">₹8/KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extra Hour:</span>
                    <span className="font-bold">₹300/Hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Hit the Road?</h2>
          <p className="text-xl mb-8 text-red-100">Book your perfect car today and enjoy the freedom of self-driving!</p>
          <Link to="/cars">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
              Book Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
