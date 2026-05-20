import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/dialog';
import { Car } from '../types/car';
import hatchbackImg from '@/assets/images/cars/hatchback.png';

interface CarGalleryModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CarGalleryModal({ car, isOpen, onClose }: CarGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!car) return null;

  // Merge the primary car.image and the 10 additional car.images array fields to compile the complete 11-image collection.
  let images: string[] = [];
  if (car.image) {
    images.push(car.image);
  }

  const validAdditionalImages = car.images && Array.isArray(car.images)
    ? car.images.filter((img) => img && typeof img === 'string' && img.trim() !== '')
    : [];

  images = [...images, ...validAdditionalImages];

  // If there are no valid additional images, generate fallbacks to ensure we show 11 images total
  if (images.length <= 1) {
    const name = encodeURIComponent(car.name);
    images = [
      car.image || hatchbackImg,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Front+View`,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Rear+View`,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Side+Profile`,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Dashboard`,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Front+Seats`,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Rear+Seats`,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Boot+Space`,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Engine+Bay`,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Wheel+Detail`,
      `https://placehold.co/800x500/f8f9fa/374151?text=${name}+-+Interior+Roof`
    ];
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleClose = () => {
    setCurrentIndex(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] p-0 border-none bg-white text-gray-900 overflow-hidden flex flex-col"
        aria-describedby={undefined}
      >
        <DialogHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between sticky top-0 bg-white z-10">
          <DialogTitle className="text-xl font-bold">
            {car.name} Gallery
          </DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-6 h-6" />
          </DialogClose>
        </DialogHeader>

        <div className="relative flex-1 flex items-center justify-center min-h-[50vh] p-4 bg-white">
          <img
            src={images[currentIndex]}
            alt={`${car.name} - View ${currentIndex + 1}`}
            className="max-w-full max-h-[60vh] object-contain mix-blend-multiply"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = hatchbackImg;
            }}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 p-2 bg-white/80 hover:bg-white rounded-full text-gray-900 shadow-md transition-colors"
                title="Previous Image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 p-2 bg-white/80 hover:bg-white rounded-full text-gray-900 shadow-md transition-colors"
                title="Next Image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="p-4 bg-white flex flex-col items-center gap-3">
            <div className="flex gap-2 justify-center">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-red-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <p className="text-center text-xs text-gray-400">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
