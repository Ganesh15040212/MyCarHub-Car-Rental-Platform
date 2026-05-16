import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Car, Phone, Mail, Menu, X } from 'lucide-react';
import { COMPANY_INFO } from '../types/car';
import { Button } from './ui/button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/cars', label: 'Cars' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-2 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
            <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center gap-1.5 hover:text-red-600 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {COMPANY_INFO.phone}
            </a>
            <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-1.5 hover:text-red-600 transition-colors hidden md:flex">
              <Mail className="w-3.5 h-3.5" />
              {COMPANY_INFO.email}
            </a>
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            Official Partner: <span className="font-bold text-gray-700">{COMPANY_INFO.owner}</span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900">{COMPANY_INFO.name.toUpperCase()}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive(link.path) 
                    ? 'bg-red-50 text-red-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    isActive(link.path) 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
