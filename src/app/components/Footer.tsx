import { Link } from 'react-router';
import { Car, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { COMPANY_INFO } from '../types/car';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-8 h-8 text-red-600" />
              <span className="text-xl font-bold">{COMPANY_INFO.name}</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner for self-driving car rentals. Quality vehicles at affordable prices.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-red-600 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-red-600 transition">Home</Link>
              </li>
              <li>
                <Link to="/cars" className="text-gray-400 hover:text-red-600 transition">Our Cars</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-red-600 transition">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-red-600 mt-0.5" />
                <a href={`tel:${COMPANY_INFO.phone}`} className="text-gray-400 hover:text-red-600 transition">
                  {COMPANY_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-red-600 mt-0.5" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="text-gray-400 hover:text-red-600 transition">
                  {COMPANY_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                <span className="text-gray-400">{COMPANY_INFO.address}</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Monday - Saturday: 8:00 AM - 8:00 PM</li>
              <li>Sunday: 9:00 AM - 6:00 PM</li>
              <li className="text-red-600 font-semibold mt-4">24/7 Support Available</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} {COMPANY_INFO.name}. All rights reserved. | Owner: {COMPANY_INFO.owner}</p>
        </div>
      </div>
    </footer>
  );
}
