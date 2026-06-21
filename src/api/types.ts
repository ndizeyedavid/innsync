// API Response Types based on Backend Structure

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

// Auth Types
export interface SignInDto {
  email?: string;
  phone?: string;
  password: string;
  deviceLabel?: string;
}

export interface SignUpDto {
  email: string;
  phone?: string;
  name: string;
  password: string;
  deviceLabel?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens: Tokens;
  user: User;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: "GUEST" | "ADMIN" | "STAFF";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  guestProfile?: GuestProfile;
}

export interface GuestProfile {
  id: string;
  userId: string;
  preferences?: Record<string, any>;
  language?: string;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  deviceLabel?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

// Onboarding Types
export type MealPlanDto =
  | "room-only"
  | "breakfast"
  | "half-board"
  | "full-board";

export interface CreateStayDto {
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  hotelId?: string;
  roomPreference?: string;
  bedPreference?: string;
  floorPreference?: string;
  mealPlan?: MealPlanDto;
  specialRequests?: string;
  itineraryVibes?: string[];
  dietaryRestrictions?: string[];
}

export interface GuestInfoDto {
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  roomPreference?: string;
  bedPreference?: string;
  floorPreference?: string;
  mealPlan: MealPlanDto;
  specialRequests?: string;
  itineraryVibes: string[];
  dietaryRestrictions: string[];
}

// Reservation Types
export interface GuestStay {
  id: string;
  userId: string;
  hotelId?: string;
  externalReservationId?: string;
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  roomPreference?: string;
  bedPreference?: string;
  floorPreference?: string;
  mealPlan?: MealPlanDto;
  specialRequests?: string;
  itineraryVibes: string[];
  dietaryRestrictions: string[];
  onboardingCompleted: boolean;
  paymentAuthorized: boolean;
  idUploaded: boolean;
  carbonOffset: boolean;
  selectedRoomId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  confirmationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber?: string;
  roomType?: string;
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
  hotelName?: string;
  hotelAddress?: string;
  guestInfo?: GuestInfo;
  createdAt: string;
  updatedAt: string;
}

export interface GuestInfo {
  id: string;
  stayId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
  arrivalTime?: string;
  preferences?: Record<string, any>;
}

// Order Types
export interface PlaceOrderDto {
  stayId: string;
  category: 'FOOD' | 'DRINKS' | 'ACTIVITIES' | 'ROOM_SERVICE' | 'HOUSEKEEPING';
  items: OrderItem[];
  specialInstructions?: string;
  deliveryRoom?: string;
}

export interface OrderItem {
  externalMenuItemId: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  stayId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "DELIVERING"
    | "DELIVERED"
    | "CANCELLED";
  specialInstructions?: string;
  deliveryRoom?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponseDto {
  id: string;
  placedAt: string;
  etaMinutes?: number;
  status: 'preparing' | 'on-the-way' | 'delivered' | 'cancelled' | 'failed' | 'pending';
  total: number; // cents
  currency: string;
  items: { name: string; quantity: number }[];
}

// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category:
    | "BREAKFAST"
    | "LUNCH"
    | "DINNER"
    | "SNACKS"
    | "BEVERAGES"
    | "DESSERT";
  available: boolean;
  imageUrl?: string;
  preparationTime?: number;
  tags?: string[];
}

// Digital Key Types
export interface DigitalKey {
  id: string;
  userId: string;
  stayId: string;
  roomNumber: string;
  pin: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  validFrom: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnlockDto {
  digitalKeyId: string;
  method: "TAP" | "PIN" | "BIOMETRIC";
  result: "SUCCESS" | "FAILED" | "CANCELLED";
}

export interface VerifyPinDto {
  digitalKeyId: string;
  pin: string;
}

// Itinerary Types
export interface ItineraryItem {
  id: string;
  stayId: string;
  type: "DINING" | "ACTIVITY" | "SPA" | "EXCURSION" | "SERVICE";
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: string;
  duration?: number;
  price?: number;
  currency?: string;
  imageUrl?: string;
  available: boolean;
}

// Billing Types
export interface FolioLine {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category?: string;
}

export interface Folio {
  id: string;
  stayId: string;
  roomNumber: string;
  guestName: string;
  lines: FolioLine[];
  totalAmount: number;
  currency: string;
  balanceDue: number;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type:
    | "ORDER_UPDATE"
    | "DIGITAL_KEY"
    | "HOUSEKEEPING"
    | "GENERAL"
    | "PROMOTION";
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// WebSocket Event Types
export interface OrderUpdateEvent {
  orderId: string;
  status: string;
  estimatedDeliveryTime?: string;
}

export interface DigitalKeyEvent {
  digitalKeyId: string;
  event: "UNLOCK_ATTEMPT" | "PIN_USED" | "KEY_REVOKED";
  timestamp: string;
}

export interface NotificationEvent {
  notificationId: string;
  title: string;
  message: string;
  type: string;
}

// Hotel Types
export interface Hotel {
  id: string;
  name: string;
  address: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  city?: string;
  amenities?: string[];
  availableRooms?: number;
}

export interface LinkReservationDto {
  confirmationNumber: string;
  email?: string;
  phone?: string;
}
