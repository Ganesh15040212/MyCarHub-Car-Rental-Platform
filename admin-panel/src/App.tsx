import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  TrendingUp, 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  Check, 
  X, 
  Lock, 
  ChevronRight, 
  LogOut, 
  Database, 
  AlertTriangle,
  RefreshCw,
  Users,
  Menu
} from 'lucide-react';

import { Toaster, toast } from 'sonner';

// Backend API Base URL
const API_URL = 'http://localhost:5000/api';

// Interface structures
interface ICar {
  id: string;
  name: string;
  price: number;
  seater: number;
  category: 'manual' | 'automatic';
  image: string;
  images: string[];
  available: boolean;
  isBooked?: boolean;
  availableFrom?: string;
}

interface IBooking {
  bookingId: string;
  carId: string;
  carName: string;
  customerName: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  dropDate: string;
  dropTime: string;
  durationDays: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

interface IFeedback {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  message: string;
  status: 'Unread' | 'Read';
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Setup Form States
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cars' | 'bookings' | 'feedbacks'>('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Core MERN entities
  const [cars, setCars] = useState<ICar[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Manage Cars Form State
  const [isCarFormOpen, setIsCarFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<ICar | null>(null);
  const [carFormData, setCarFormData] = useState({
    id: '',
    name: '',
    price: 1500,
    seater: 5,
    category: 'manual' as 'manual' | 'automatic',
    image: '',
    images: Array(10).fill(''),
    available: true
  });

  // Verify auth session on mount
  useEffect(() => {
    const token = localStorage.getItem('mch_admin_token');
    if (token) {
      verifyToken(token);
    }
    checkBackendConnection();
    checkSetupStatus();
  }, []);

  // Poll database entities once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchEntities();

      // Live update: Poll entities every 4 seconds to sync live
      const interval = setInterval(() => {
        fetchEntities();
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkBackendConnection = async () => {
    try {
      const res = await fetch(`${API_URL}/cars`);
      if (res.ok) {
        setIsBackendConnected(true);
      }
    } catch (e) {
      setIsBackendConnected(false);
    }
  };

  const checkSetupStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/setup-status`);
      if (res.ok) {
        const data = await res.json();
        setIsSetupRequired(data.isSetupRequired);
      }
    } catch (e) {
      // Offline fallback: check if local setup exists
      const cachedAdmin = localStorage.getItem('mch_offline_admin');
      setIsSetupRequired(!cachedAdmin);
    }
  };

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('mch_admin_token');
      }
    } catch (err) {
      // Offline fallback: assume token valid if stored locally to allow offline admin preview
      setIsAuthenticated(true);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupPassword !== setupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoginLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: setupEmail, password: setupPassword })
      });

      if (res.ok) {
        toast.success('Admin account established successfully', { description: 'You can now log in with your credentials.' });
        setIsSetupRequired(false);
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Setup failed');
      }
    } catch (err: any) {
      // Offline fallback: save to localStorage
      localStorage.setItem('mch_offline_admin', JSON.stringify({ email: setupEmail, password: setupPassword }));
      toast.success('Admin established (Offline Local Mode)', { description: 'Credentials saved locally in browser.' });
      setIsSetupRequired(false);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('mch_admin_token', data.token);
        setIsAuthenticated(true);
        toast.success('Successfully Authenticated', { description: 'Welcome to the Executive Admin Control Center.' });
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Unauthorized');
      }
    } catch (err: any) {
      // Offline fallback: check localStorage or default fallback
      const cachedAdminStr = localStorage.getItem('mch_offline_admin');
      let isVerified = false;

      if (cachedAdminStr) {
        const cachedAdmin = JSON.parse(cachedAdminStr);
        if (email.toLowerCase().trim() === cachedAdmin.email && password === cachedAdmin.password) {
          isVerified = true;
        }
      } else {
        // Fallback default
        if (email.toLowerCase().trim() === 'admin@mycarhub.com' && password === 'adminPassword123') {
          isVerified = true;
        }
      }

      if (isVerified) {
        setIsAuthenticated(true);
        toast.success('Offline Authenticated (Fallback Mode)', { description: 'Credentials verified locally.' });
      } else {
        toast.error('Authentication Failed', { description: err.message || 'Invalid email or password.' });
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('mch_admin_token');
    setIsAuthenticated(false);
    toast.info('Logged Out Successfully');
  };

  const fetchEntities = async () => {
    setIsLoading(true);
    try {
      const [carsRes, bookingsRes, feedbacksRes] = await Promise.all([
        fetch(`${API_URL}/cars`),
        fetch(`${API_URL}/bookings`),
        fetch(`${API_URL}/feedbacks`)
      ]);

      if (carsRes.ok) setCars(await carsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (feedbacksRes.ok) setFeedbacks(await feedbacksRes.json());
      
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend offline. Loaded standalone fallback dataset.');
      setIsBackendConnected(false);
      // Retrieve fallback items from localStorage
      const cachedCars = localStorage.getItem('mch_cars');
      const cachedBookings = localStorage.getItem('mch_bookings');
      const cachedFeedbacks = localStorage.getItem('mch_feedbacks');

      if (cachedCars) setCars(JSON.parse(cachedCars));
      if (cachedBookings) setBookings(JSON.parse(cachedBookings));
      if (cachedFeedbacks) setFeedbacks(JSON.parse(cachedFeedbacks));
    } finally {
      setIsLoading(false);
    }
  };

  // Keep localStorage updated for standalone fallbacks
  useEffect(() => {
    if (cars.length > 0) localStorage.setItem('mch_cars', JSON.stringify(cars));
  }, [cars]);
  useEffect(() => {
    if (bookings.length > 0) localStorage.setItem('mch_bookings', JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    if (feedbacks.length > 0) localStorage.setItem('mch_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Car Management CRUD Functions
  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCar) {
      // UPDATE Car
      try {
        const res = await fetch(`${API_URL}/cars/${editingCar.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(carFormData)
        });
        if (res.ok) {
          toast.success('Car Updated Successfully');
          fetchEntities();
        } else {
          throw new Error();
        }
      } catch (err) {
        // Offline update
        setCars(prev => prev.map(c => c.id === editingCar.id ? { ...c, ...carFormData } : c));
        toast.success('Car Updated (Local Offline Mode)');
      }
    } else {
      // ADD Car
      try {
        const res = await fetch(`${API_URL}/cars`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(carFormData)
        });
        if (res.ok) {
          toast.success('Car Created Successfully');
          fetchEntities();
        } else {
          throw new Error('API server returned error');
        }
      } catch (err) {
        // Offline add
        setCars(prev => [...prev, { ...carFormData }]);
        toast.success('Car Created (Local Offline Mode)');
      }
    }

    setIsCarFormOpen(false);
    setEditingCar(null);
    resetCarFormData();
  };

  const handleEditCarClick = (car: ICar) => {
    setEditingCar(car);
    setCarFormData({
      id: car.id,
      name: car.name,
      price: car.price,
      seater: car.seater,
      category: car.category,
      image: car.image,
      images: car.images && car.images.length === 10
        ? [...car.images]
        : car.images && car.images.length > 0
          ? [...car.images, ...Array(10 - car.images.length).fill('')]
          : Array(10).fill(''),
      available: car.available
    });
    setIsCarFormOpen(true);
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this car?')) return;

    try {
      const res = await fetch(`${API_URL}/cars/${carId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Car Removed Successfully');
        fetchEntities();
      } else {
        throw new Error();
      }
    } catch (err) {
      setCars(prev => prev.filter(c => c.id !== carId));
      toast.success('Car Removed (Local Offline Mode)');
    }
  };

  const handleToggleAvailability = async (car: ICar) => {
    const nextState = !car.available;
    try {
      const res = await fetch(`${API_URL}/cars/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: nextState })
      });
      if (res.ok) {
        toast.success(`Availability changed for ${car.name}`);
        fetchEntities();
      } else {
        throw new Error();
      }
    } catch (err) {
      setCars(prev => prev.map(c => c.id === car.id ? { ...c, available: nextState } : c));
      toast.success(`Availability toggled (Offline Mode)`);
    }
  };

  const generateRandomCarNumber = () => {
    const states = ['MH', 'KA', 'DL', 'HR', 'UP', 'GJ', 'TS', 'TN', 'KL', 'AP'];
    const state = states[Math.floor(Math.random() * states.length)];
    const district = Math.floor(10 + Math.random() * 90).toString();
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const num = Math.floor(1000 + Math.random() * 9000).toString();
    return `${state}${district}${letters}${num}`; // No hyphens, e.g. TN67GH0412
  };

  const resetCarFormData = () => {
    const randomId = generateRandomCarNumber();
    setCarFormData({
      id: randomId,
      name: '',
      price: 1500,
      seater: 5,
      category: 'manual',
      image: '',
      images: Array(10).fill(''),
      available: true
    });
  };

  // Booking status changes
  const handleBookingStatus = async (bookingId: string, nextStatus: IBooking['status']) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        toast.success(`Booking status changed to ${nextStatus}`);
        fetchEntities();
      } else {
        throw new Error();
      }
    } catch (err) {
      setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: nextStatus } : b));
      toast.success(`Booking status updated (Offline Mode)`);
    }
  };

  // Feedback delete & read states
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Delete this contact message?')) return;

    try {
      const res = await fetch(`${API_URL}/feedbacks/${feedbackId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Message Deleted');
        fetchEntities();
      } else {
        throw new Error();
      }
    } catch (err) {
      setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      toast.success('Message Deleted (Offline Mode)');
    }
  };

  const handleMarkFeedbackRead = async (feedbackId: string) => {
    try {
      const res = await fetch(`${API_URL}/feedbacks/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Read' })
      });
      if (res.ok) {
        toast.success('Marked as read');
        fetchEntities();
      } else {
        throw new Error();
      }
    } catch (err) {
      setFeedbacks(prev => prev.map(f => f._id === feedbackId ? { ...f, status: 'Read' } : f));
      toast.success('Marked as read (Offline Mode)');
    }
  };

  // Dashboard Stats Calculations
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed');
  const activeBookings = bookings.filter(b => b.status === 'Confirmed');
  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const unreadFeedbacks = feedbacks.filter(f => f.status === 'Unread');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden text-gray-900">
        {/* Sleek Gradient backgrounds */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-100/50 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-red-50/50 blur-[120px]" />

        <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl relative z-10">
          {isSetupRequired ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <Database className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">First-Time Setup</h1>
                <p className="text-gray-500 text-sm mt-2">Create the initial Executive Admin credentials.</p>
              </div>

              <form onSubmit={handleSetup} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@mycarhub.com"
                    value={setupEmail}
                    onChange={e => setSetupEmail(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Choose Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={setupPassword}
                    onChange={e => setSetupPassword(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={setupConfirmPassword}
                    onChange={e => setSetupConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 mt-4 cursor-pointer"
                >
                  {isLoginLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Establish Account</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <Lock className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">Executive Login</h1>
                <p className="text-gray-500 text-sm mt-2">Manage the MyCarHub fleet and active requests.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@mycarhub.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 mt-4 cursor-pointer"
                >
                  {isLoginLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Unlock Console</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col md:flex-row text-gray-900 overflow-hidden">
      {/* MOBILE TOP BAR */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 md:hidden sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-900 leading-none">My Car Hub</h2>
            <span className="text-[9px] text-red-600 font-bold uppercase tracking-wider">Control Panel</span>
          </div>
          {isBackendConnected ? (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Database Connected" />
          ) : (
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Offline standalone mode active" />
          )}
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all text-gray-700 cursor-pointer shadow-sm"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-red-600" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Backdrop overlay for mobile sidebar drawer */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-50 border-r border-gray-200 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 h-full ${
        isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          {/* Logo Brand Header (visible on desktop) */}
          <div className="p-6 border-b border-gray-200 hidden md:flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900">My Car Hub</h2>
              <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Control Panel</span>
            </div>
            {isBackendConnected ? (
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" title="Database Connected" />
            ) : (
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse" title="Offline standalone mode active" />
            )}
          </div>

          {/* Close Menu Button on Mobile Sidebar */}
          <div className="p-4 border-b border-gray-100 flex md:hidden items-center justify-between bg-white">
            <div>
              <h2 className="text-lg font-black tracking-tight text-gray-900 leading-none">Navigation</h2>
              <span className="text-[9px] text-red-600 font-bold uppercase">Menu options</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center border border-red-200 cursor-pointer text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full h-12 px-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/15'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('cars');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full h-12 px-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'cars'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/15'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Manage Cars</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('bookings');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full h-12 px-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/15'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Bookings</span>
              {bookings.filter(b => b.status === 'Pending').length > 0 && (
                <span className="ml-auto bg-red-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                  {bookings.filter(b => b.status === 'Pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('feedbacks');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full h-12 px-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'feedbacks'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/15'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>User Feedbacks</span>
              {unreadFeedbacks.length > 0 && (
                <span className="ml-auto bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                  {unreadFeedbacks.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-4">
          {!isBackendConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-2 text-xs text-yellow-800">
              <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-600 mt-0.5" />
              <p>Database server is unreachable. Running in standalone mode. LocalStorage synchronized.</p>
            </div>
          )}

          <button
            onClick={() => {
              handleLogOut();
              setIsMobileMenuOpen(false);
            }}
            className="w-full h-12 px-4 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Lock Console</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto bg-slate-50/50">
        {/* VIEW HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-black capitalize tracking-tight text-gray-900">{activeTab} Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time business intelligence and inventory sync.</p>
          </div>
          <button 
            onClick={fetchEntities}
            disabled={isLoading}
            className="h-11 px-4 border border-gray-300 hover:bg-gray-50 bg-white rounded-xl flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </header>

        {/* ==================== TAB: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200/80 shadow-md rounded-3xl p-6 flex justify-between items-start transition-all hover:shadow-lg">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Gross Income</p>
                  <h3 className="text-3xl font-black text-red-600 mt-2 truncate">₹{totalEarnings.toLocaleString('en-IN')}</h3>
                  <p className="text-[10px] text-gray-500 mt-2">Earned from {confirmedBookings.length} confirmed orders</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
              </div>

              <div className="bg-white border border-gray-200/80 shadow-md rounded-3xl p-6 flex justify-between items-start transition-all hover:shadow-lg">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Bookings</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-2 truncate">{activeBookings.length}</h3>
                  <p className="text-[10px] text-gray-500 mt-2">Rentals currently active in client tier</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <div className="bg-white border border-gray-200/80 shadow-md rounded-3xl p-6 flex justify-between items-start transition-all hover:shadow-lg">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Cars Fleet</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-2 truncate">{cars.length}</h3>
                  <p className="text-[10px] text-gray-500 mt-2">Active listings across catalog</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
              </div>

              <div className="bg-white border border-gray-200/80 shadow-md rounded-3xl p-6 flex justify-between items-start transition-all hover:shadow-lg">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Unread Feedback</p>
                  <h3 className="text-3xl font-black text-blue-600 mt-2 truncate">{unreadFeedbacks.length}</h3>
                  <p className="text-[10px] text-gray-500 mt-2">New messages in contact queue</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Quick overview of latest bookings */}
            <div className="bg-white border border-gray-200/80 shadow-md rounded-3xl p-6 text-gray-900">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Recent Bookings Queue</h3>
              
              {bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left text-sm text-gray-800">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 text-xs font-bold uppercase">
                        <th className="py-4">Booking ID</th>
                        <th className="py-4">Customer</th>
                        <th className="py-4">Car Name</th>
                        <th className="py-4">Date Slot</th>
                        <th className="py-4 text-right">Total Price</th>
                        <th className="py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.bookingId} className="hover:bg-gray-50 transition-all">
                          <td className="py-4 font-mono font-bold text-gray-500">{booking.bookingId}</td>
                          <td className="py-4 font-bold text-gray-900">{booking.customerName}</td>
                          <td className="py-4 text-red-600 font-bold">{booking.carName}</td>
                          <td className="py-4 text-gray-700">{booking.pickupDate} ➡️ {booking.dropDate}</td>
                          <td className="py-4 text-right font-bold text-green-600">₹{booking.totalAmount}</td>
                          <td className="py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-250' :
                              booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-250' :
                              booking.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-250' :
                              'bg-red-50 text-red-700 border-red-250'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">No bookings recorded in database.</p>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: CARS (CRUD) ==================== */}
        {activeTab === 'cars' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Toolbar header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-400 text-sm font-semibold">{cars.length} cars in catalog.</p>
              <button
                onClick={() => {
                  setEditingCar(null);
                  resetCarFormData();
                  setIsCarFormOpen(true);
                }}
                className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/15 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add Fleet Car</span>
              </button>
            </div>

            {/* List Cars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car) => (
                <div key={car.id} className="bg-white border border-gray-200/80 shadow-md rounded-3xl overflow-hidden group flex flex-col justify-between">
                  <div className="p-5">
                    {/* Car Image Preview */}
                    <div className="w-full h-44 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden mb-4 relative border border-gray-100">
                      <img 
                        src={car.image || 'https://via.placeholder.com/300x180/ffffff/d4183d?text=No+Photo'} 
                        alt={car.name} 
                        className="w-auto max-h-36 object-contain group-hover:scale-105 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x180/ffffff/d4183d?text=No+Photo';
                        }}
                      />
                      
                      {/* Availability Badge Overlay */}
                      <button
                        onClick={() => handleToggleAvailability(car)}
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all shadow-md cursor-pointer ${
                          car.available 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-yellow-600 text-white hover:bg-yellow-700'
                        }`}
                      >
                        {car.available ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <h3 className="text-lg font-bold truncate text-gray-900">{car.name}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-1">{car.seater}-Seater • {car.category}</p>
                    {car.isBooked && car.availableFrom && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                        Booked · Available on {car.availableFrom}
                      </span>
                    )}
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Rental Rate</span>
                        <strong className="text-xl font-black text-red-600">₹{car.price} <span className="text-xs text-gray-500 font-normal">/day</span></strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="bg-gray-50/50 border-t border-gray-100 p-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleEditCarClick(car)}
                      className="h-10 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-gray-750 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCar(car.id)}
                      className="h-10 hover:bg-red-50 border border-red-100 hover:border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-red-650 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-650" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* In-Line Overlay Form Dialog (Modal Modal Add/Edit Car) */}
            {isCarFormOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                <div className="bg-white border border-gray-200/80 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-in zoom-in duration-300 text-gray-900">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-gray-900">{editingCar ? 'Modify Vehicle Details' : 'Register Fleet Vehicle'}</h3>
                    <button onClick={() => { setIsCarFormOpen(false); setEditingCar(null); }} className="w-10 h-10 bg-gray-100 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center transition-all text-gray-500 cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCarSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Car Number *</label>
                        <input
                          type="text"
                          value={carFormData.id}
                          onChange={e => setCarFormData(prev => ({ ...prev, id: e.target.value }))}
                          placeholder="E.g. TN67GH0412"
                          className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Name *</label>
                        <input
                          type="text"
                          value={carFormData.name}
                          onChange={e => setCarFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="E.g. Mahindra Thar"
                          className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price / Day (₹) *</label>
                        <input
                          type="number"
                          value={carFormData.price}
                          onChange={e => setCarFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                          className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seating Capacity *</label>
                        <select
                          value={carFormData.seater}
                          onChange={e => setCarFormData(prev => ({ ...prev, seater: parseInt(e.target.value) as 5 | 7 }))}
                          className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                        >
                          <option value={5}>5-Seater</option>
                          <option value={7}>7-Seater</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transmission *</label>
                        <select
                          value={carFormData.category}
                          onChange={e => setCarFormData(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                        >
                          <option value="manual">Manual</option>
                          <option value="automatic">Automatic</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Availability Status</label>
                        <select
                          value={carFormData.available ? "true" : "false"}
                          onChange={e => setCarFormData(prev => ({ ...prev, available: e.target.value === "true" }))}
                          className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                        >
                          <option value="true">Active / Enabled</option>
                          <option value="false">Disabled / Offline</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Image Web Link *</label>
                        <input
                          type="url"
                          value={carFormData.image}
                          onChange={e => setCarFormData(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="https://example.com/car-photo.png"
                          className="w-full h-12 px-4 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-sm transition-all text-gray-900"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Additional Gallery Images (10 Detailed Views)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Array(10).fill(0).map((_, idx) => (
                            <div key={idx} className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gallery Image {idx + 1}</label>
                              <input
                                type="url"
                                value={carFormData.images[idx] || ''}
                                onChange={e => {
                                  const newImages = [...carFormData.images];
                                  newImages[idx] = e.target.value;
                                  setCarFormData(prev => ({ ...prev, images: newImages }));
                                }}
                                placeholder={`https://example.com/view-${idx + 1}.png`}
                                className="w-full h-10 px-3 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl outline-none text-xs transition-all text-gray-900"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => { setIsCarFormOpen(false); setEditingCar(null); }}
                        className="h-12 px-6 border border-gray-300 hover:bg-gray-100 text-xs font-bold rounded-xl text-gray-700 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-200 cursor-pointer"
                      >
                        {editingCar ? 'Update Info' : 'Confirm Registration'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: BOOKINGS ==================== */}
        {activeTab === 'bookings' && (
          <div className="bg-white border border-gray-200/80 shadow-md rounded-3xl p-6 animate-in fade-in duration-300 text-gray-900">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-sm font-semibold">{bookings.length} reservations on record.</p>
            </div>

            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm text-gray-800">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs font-bold uppercase">
                      <th className="py-4">Booking ID</th>
                      <th className="py-4">Customer Details</th>
                      <th className="py-4">Car Reserved</th>
                      <th className="py-4">Schedule Slots</th>
                      <th className="py-4">Rental Duration</th>
                      <th className="py-4">Pricing</th>
                      <th className="py-4 text-center">Status</th>
                      <th className="py-4 text-right">Workflow Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((booking) => (
                      <tr key={booking.bookingId} className="hover:bg-gray-50/50 transition-all">
                        <td className="py-4 font-mono font-bold text-gray-500">{booking.bookingId}</td>
                        <td className="py-4">
                          <div className="font-bold text-gray-900">{booking.customerName}</div>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <a href={`tel:${booking.phone}`} className="text-xs text-red-600 hover:underline font-bold">{booking.phone}</a>
                            {booking.email && <span className="text-xs text-gray-500 break-all">{booking.email}</span>}
                          </div>
                        </td>
                        <td className="py-4 font-bold text-gray-800">{booking.carName}</td>
                        <td className="py-4">
                          <div className="text-xs text-gray-700">Pick: {booking.pickupDate} ({booking.pickupTime})</div>
                          <div className="text-xs text-gray-500">Drop: {booking.dropDate} ({booking.dropTime})</div>
                        </td>
                        <td className="py-4 font-bold text-gray-900">{booking.durationDays} Day(s)</td>
                        <td className="py-4 text-green-600 font-bold">₹{booking.totalAmount}</td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-250' :
                            booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-250' :
                            booking.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-250' :
                            'bg-red-50 text-red-700 border-red-250'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {booking.status === 'Pending' && (
                              <button
                                onClick={() => handleBookingStatus(booking.bookingId, 'Confirmed')}
                                className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all border border-blue-200 cursor-pointer"
                                title="Confirm Request"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            
                            {booking.status === 'Confirmed' && (
                              <button
                                onClick={() => handleBookingStatus(booking.bookingId, 'Completed')}
                                className="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-all border border-green-200 cursor-pointer"
                                title="Mark Completed"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleBookingStatus(booking.bookingId, 'Cancelled')}
                                className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-650 flex items-center justify-center transition-all border border-red-200 cursor-pointer"
                                title="Cancel Rental"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No bookings received in database.</p>
            )}
          </div>
        )}

        {/* ==================== TAB: FEEDBACKS ==================== */}
        {activeTab === 'feedbacks' && (
          <div className="space-y-6 animate-in fade-in duration-300 text-gray-900">
            <p className="text-gray-500 text-sm font-semibold">{unreadFeedbacks.length} unread out of {feedbacks.length} feedbacks.</p>

            {feedbacks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedbacks.map((fb) => (
                  <div key={fb._id} className={`bg-white border rounded-3xl p-6 transition-all ${
                    fb.status === 'Unread' ? 'border-red-200 shadow-md shadow-red-100/30' : 'border-gray-250/60 opacity-90'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{fb.name}</h4>
                        {fb.email && <span className="text-xs text-gray-500">{fb.email}</span>}
                        <div className="text-xs text-red-600 font-bold mt-1">Phone: {fb.phone}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {fb.status === 'Unread' ? (
                          <button
                            onClick={() => handleMarkFeedbackRead(fb._id)}
                            className="h-8 px-3 rounded-full bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[10px] uppercase border border-red-200 transition-all cursor-pointer"
                          >
                            Mark Read
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            Read
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteFeedback(fb._id)}
                          className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-full flex items-center justify-center transition-all cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-650" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 bg-gray-50 p-4 border border-gray-100 rounded-2xl whitespace-pre-wrap leading-relaxed">
                      {fb.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No feedback records found in database.</p>
            )}
          </div>
        )}
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
}
