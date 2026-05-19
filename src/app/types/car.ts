export interface Car {
  id: string;
  name: string;
  price: number;
  seater: 5 | 7;
  category: 'manual' | 'automatic';
  image: string;
  images?: string[];
  available: boolean;
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
  name: "My Car Hub",
  phone: "9597693716",
  owner: "M Kanthaswamy",
  email: "info@mycarhub.com",
  address: "Tamil Nadu, India"
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
