import { useState } from 'react';
import { MessageSquare, MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { COMPANY_INFO } from '../types/car';

export default function FloatingActions() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // WhatsApp link (using the phone number from COMPANY_INFO)
  const whatsappUrl = `https://wa.me/91${COMPANY_INFO.phone}`;

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-[9999] animate-in fade-in slide-in-from-bottom-10 duration-500">
        {/* Feedback Button */}
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl shadow-red-200 hover:bg-red-700 transition-all hover:scale-110 active:scale-95"
          title="Give Feedback"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute right-full mr-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Feedback
          </span>
        </button>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl shadow-green-200 hover:bg-[#128C7E] transition-all hover:scale-110 active:scale-95"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-full mr-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            WhatsApp
          </span>
          {/* Pulsing indicator */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        </a>
      </div>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
}
