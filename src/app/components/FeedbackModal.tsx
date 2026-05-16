import { useState } from 'react';
import { MessageSquare, X, Send, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    comment: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const patterns = {
    name: /^[a-zA-Z\s]{3,50}$/,
    phone: /^[6-9]\d{9}$/,
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'name' && value && !patterns.name.test(value)) {
      error = 'Letters only (min 3).';
    } else if (name === 'phone' && value && !patterns.phone.test(value.replace(/\D/g, ''))) {
      error = 'Invalid 10-digit number.';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors || !formData.name || !formData.phone) {
      toast.error('Validation Error', { description: 'Please check your inputs.' });
      return;
    }

    if (rating === 0) {
      toast.error('Rating Required', { description: 'Please select a star rating to continue.' });
      return;
    }

    toast.success('Feedback Received!', {
      description: 'Thank you for helping us improve My Car Hub.',
      className: 'bg-green-50 border-green-200 text-green-900 font-medium',
    });

    setRating(0);
    setErrors({});
    setFormData({ name: '', phone: '', comment: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[850px] p-0 border-none bg-transparent shadow-none overflow-hidden flex items-center justify-center [&>button]:hidden">
        <div className="relative bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.18)] w-full overflow-y-auto md:overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-none md:min-h-[500px]">
          {/* Left Column: Branding & Rating */}
          <div className="md:w-[40%] bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 sm:p-12 text-white relative flex flex-col justify-between">
            <div className="absolute bottom-0 left-0 p-10 opacity-10 pointer-events-none">
              <MessageSquare className="w-48 h-48 -rotate-12" />
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-sm z-30 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em]">
                Customer Voice
              </div>
              <DialogTitle className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Help Us <br /> <span className="text-red-200">Perfect</span> <br /> Your Drive
              </DialogTitle>
              <p className="text-red-100/80 text-sm font-medium max-w-[200px]">Your feedback is the engine of our excellence.</p>
            </div>

            {/* Star Rating Moved Here for Horizontal layout */}
            <div className="relative space-y-4 pt-12 md:pt-0">
              <Label className="text-[10px] font-bold text-red-200 uppercase tracking-[0.25em]">Rate Your Experience</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="group relative transition-all duration-300 hover:scale-110 active:scale-90"
                  >
                    <Star 
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-300 ${
                        star <= (hoveredRating || rating) 
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                          : 'text-white/20 fill-white/5'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="md:w-[60%] bg-white p-8 sm:p-12 relative">
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all z-30 hidden md:flex"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 group">
                  <Label htmlFor="fb-name" className="text-xs font-bold text-gray-400 ml-1">YOUR NAME</Label>
                  <Input
                    id="fb-name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`h-12 bg-gray-50/50 border-transparent focus:bg-white focus:border-red-500/30 focus:ring-4 focus:ring-red-500/5 rounded-xl transition-all font-medium px-5 ${errors.name ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="fb-phone" className="text-xs font-bold text-gray-400 ml-1">PHONE NUMBER</Label>
                  <Input
                    id="fb-phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`h-12 bg-gray-50/50 border-transparent focus:bg-white focus:border-red-500/30 focus:ring-4 focus:ring-red-500/5 rounded-xl transition-all font-medium px-5 ${errors.phone ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2 space-y-2 group">
                  <Label htmlFor="fb-comment" className="text-xs font-bold text-gray-400 ml-1">YOUR THOUGHTS</Label>
                  <Textarea
                    id="fb-comment"
                    name="comment"
                    placeholder="Tell us what you loved..."
                    rows={3}
                    value={formData.comment}
                    onChange={handleInputChange}
                    className="bg-gray-50/50 border-transparent focus:bg-white focus:border-red-500/30 focus:ring-4 focus:ring-red-500/5 rounded-2xl transition-all font-medium p-5 resize-none leading-relaxed"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] transition-all hover:-translate-y-1 active:translate-y-0.5 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <Send className="w-5 h-5 mr-3" />
                SEND FEEDBACK
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
