import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import CarCard from '../components/CarCard';
import { fiveSeaterCars, sevenSeaterCars, allCars } from '../data/cars';
import { API_URL } from '../config';

export default function Cars() {
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`${API_URL}/cars`);
        if (response.ok) {
          const data = await response.json();
          setCars(data);
        } else {
          throw new Error('Failed to fetch from API');
        }
      } catch (err) {
        console.warn('Backend server offline. Gracefully falling back to static offline car list.', err);
        // Fallback
        setCars(allCars);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();

    // Live update: Poll cars every 4 seconds to sync live with backend / admin changes
    const interval = setInterval(() => {
      fetchCars();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const filterCars = (carsList: any[]) => {
    return carsList.filter((car) => {
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'low' && car.price <= 2000) ||
        (priceFilter === 'medium' && car.price > 2000 && car.price <= 3000) ||
        (priceFilter === 'high' && car.price > 3000);

      const matchesCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'manual' && car.category === 'manual') ||
        (categoryFilter === 'automatic' && car.category === 'automatic');

      // Make sure the car is set to active/available by admin
      return matchesSearch && matchesPrice && matchesCategory && car.available;
    });
  };

  const fiveSeaterList = cars.filter(c => c.seater === 5);
  const sevenSeaterList = cars.filter(c => c.seater === 7);

  const filtered5Seaters = filterCars(fiveSeaterList);
  const filtered7Seaters = filterCars(sevenSeaterList);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Car Collection</h1>
          <p className="text-gray-600 text-lg">
            Choose from our wide range of well-maintained self-driving cars
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search cars by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">₹1,500 - ₹2,000</SelectItem>
                  <SelectItem value="medium">₹2,000 - ₹3,000</SelectItem>
                  <SelectItem value="high">Above ₹3,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Car Tabs */}
        <Tabs defaultValue="5-seater" className="w-full">
          <TabsList className="flex flex-col sm:flex-row w-full max-w-2xl mx-auto bg-gray-100/50 p-1 rounded-xl mb-12 h-auto">
            <TabsTrigger 
              value="5-seater" 
              className="flex-1 py-3 px-6 text-base sm:text-lg rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              5-Seater Cars <span className="ml-2 opacity-60 text-sm">({isLoading ? '...' : filtered5Seaters.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="7-seater" 
              className="flex-1 py-3 px-6 text-base sm:text-lg rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              7-Seater Cars <span className="ml-2 opacity-60 text-sm">({isLoading ? '...' : filtered7Seaters.length})</span>
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 w-full animate-pulse flex flex-col justify-end p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="5-seater">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">5-Seater Self-Driving Cars</h2>
                  <p className="text-gray-600">
                    Perfect for small families and groups. Starting from ₹1,500/day with 300 KM limit.
                  </p>
                </div>

                {filtered5Seaters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered5Seaters.map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No cars found matching your criteria.</p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setPriceFilter('all');
                        setCategoryFilter('all');
                      }}
                      className="mt-4"
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="7-seater">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">7-Seater Self-Driving Cars</h2>
                  <p className="text-gray-600">
                    Ideal for large families and group trips. Starting from ₹2,600/day with 300 KM limit.
                  </p>
                </div>

                {filtered7Seaters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered7Seaters.map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No cars found matching your criteria.</p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setPriceFilter('all');
                        setCategoryFilter('all');
                      }}
                      className="mt-4"
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Info Section */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4 text-center">Rental Terms & Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-lg mb-2">5-Seater Cars</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• 24 Hours rental period</li>
                <li>• 300 KM limit included</li>
                <li>• Extra KM: ₹5 per kilometer</li>
                <li>• Extra Hour: ₹200 per hour</li>
                <li>• ₹10,000 refundable deposit</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">7-Seater Cars</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• 24 Hours rental period</li>
                <li>• 300 KM limit included</li>
                <li>• Extra KM: ₹8 per kilometer</li>
                <li>• Extra Hour: ₹300 per hour</li>
                <li>• ₹10,000 refundable deposit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

