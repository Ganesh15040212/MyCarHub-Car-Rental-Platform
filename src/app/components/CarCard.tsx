import { useState } from 'react';
import { Car, Users, Gauge, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Car as CarType } from '../types/car';
import BookingModal from './BookingModal';

import hatchbackImg from '@/assets/images/cars/hatchback.png';

interface CarCardProps {
  car: CarType;
}

export default function CarCard({ car }: CarCardProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="p-0">
          <div className="relative h-48 overflow-hidden">
            <img
              src={car.image}
              alt={car.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = hatchbackImg; // Use imported fallback
              }}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              {car.category === 'automatic' && (
                <Badge className="bg-purple-600">Automatic</Badge>
              )}
              {car.available ? (
                <Badge className="bg-green-600">Available</Badge>
              ) : (
                <Badge variant="destructive">Booked</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <h3 className="text-xl font-bold mb-2">{car.name}</h3>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{car.seater} Seater</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              <span>{car.category === 'automatic' ? 'Auto' : 'Manual'}</span>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg mb-3">
            <p className="text-2xl font-bold text-red-600">₹{car.price}<span className="text-sm text-gray-600">/day</span></p>
            <p className="text-xs text-gray-600 mt-1">300 KM limit in 24 hours</p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Extra: ₹{car.seater === 5 ? '5' : '8'}/KM</p>
            <p>• Extra: ₹{car.seater === 5 ? '200' : '300'}/Hour</p>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={() => setIsBookingOpen(true)}
            disabled={!car.available}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {car.available ? 'Book Now' : 'Not Available'}
          </Button>
        </CardFooter>
      </Card>

      <BookingModal
        car={car}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}
