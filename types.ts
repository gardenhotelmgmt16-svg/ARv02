
export enum RoomType {
  SUPERIOR = 'Superior',
  DELUXE = 'Deluxe',
  SUITE = 'Suite'
}

export enum PaymentStatus {
  CASH = 'Cash',
  DEBIT = 'Debit',
  TF = 'TF',
  KREDIT = 'Kredit',
  QRIS = 'Qris',
  BY_OTA = 'By OTA'
}

export enum PaymentMethod {
  WALK_IN = 'Walk In',
  BY_PHONE = 'By Phone',
  TRAVELOKA = 'Traveloka',
  AGODA = 'Agoda',
  TIKET = 'Tiket',
  MG_HOLIDAY = 'MG Holiday',
  KLIKNBOOK = 'KliknBook',
  SALES = 'Sales',
  BACK_OFFICE = 'Back Office',
  TIKTOK = 'Tiktok',
  VOUCHER = 'Voucher'
}

export enum MealPlan {
  RBF = 'RBF',
  RO = 'RO'
}

export interface Booking {
  id: string;
  noBooking: string;
  roomNumber: string;
  roomType: RoomType;
  bookingDate: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  phone: string;
  price: number;
  mealPlan: MealPlan;
  qtyPax: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  reservationBy: string;
  notes: string;
}

export interface Room {
  number: string;
  type: RoomType;
  price: number;
  status: 'available' | 'booked' | 'cleaning';
}

export type ViewType = 'PUBLIC' | 'ADMIN';
export type AdminPage = 'DASHBOARD' | 'ROOMS' | 'BOOKINGS' | 'NEW_BOOKING' | 'REPORTS';
