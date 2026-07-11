export interface Car {
  id: string;
  name: string;
  price: number;
  seater: 5 | 7;
  category: 'manual' | 'automatic';
  image: string;
  images?: string[];
  available: boolean;
  isBooked?: boolean;
  availableFrom?: string;
}

export interface BookingForm {
  carId: string;
  carName: string;
  customerName: string;
  phone: string;
  proofType: string;
  proofNumber: string;
  depositAmount: number;
  bikeModel?: string;
  bikeYear?: string;
  pickupDate: string;
  pickupTime: string;
  dropDate: string;
  dropTime: string;
}

export const COMPANY_INFO = {
  name: "Mukesh",
  phone: "6369704082",
  owner: "M Kanthaswamy",
  email: "mycarhubbbb@gmail.com",
  address: "304/2A, Kamaraj Nagar, Kurinji Garden, Selvapuram South, Selvapuram, Coimbatore, Tamil Nadu 641026"
};

export const PRICING_TERMS = {
  fiveSeater: {
    hours: 24,
    kmLimit: 300,
    extraKmRate: 5,
    extraHourRate: 200
  },
  sevenSeater: {
    hours: 24,
    kmLimit: 300,
    extraKmRate: 8,
    extraHourRate: 300
  }
};

export const REQUIRED_DOCUMENTS = [
  "Original Aadhar Card",
  "Original Driving Licence",
  "Original Smart Card",
  "10K Deposit (Refundable)",
  "Bike or Scooter (Above 2020 Model) - 1 Bike"
];
