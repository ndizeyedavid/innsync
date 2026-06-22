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
  loyaltyTier?: string;
  loyaltyPoints?: number;
  dietaryRestrictions?: string[];
  preferredVibes?: string[];
  preferredLanguage?: string;
  preferredCurrency?: string;
  preferences?: Record<string, any>;
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
  hotelName?: string;
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
  notes?: string;
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
    | "PENDING_REMOTE"
    | "PREPARING"
    | "ON_THE_WAY"
    | "DELIVERED"
    | "CANCELLED"
    | "FAILED";
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
  status: 'pending' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled' | 'failed';
  total: number;
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
  guestStayId: string;
  externalRoomId: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
  hasPin: boolean;
}

export interface UnlockDto {
  digitalKeyId: string;
  method: "BLE" | "PIN" | "NFC";
  result: "SUCCESS" | "FAILED" | "TIMEOUT";
}

export interface VerifyPinDto {
  digitalKeyId: string;
  pin: string;
}

// Itinerary Types
export interface ItineraryItem {
  id: string;
  guestStayId: string;
  externalActivityId: string;
  day: number;
  startTime: string;
  endTime?: string;
  title: string;
  location?: string;
  status: "booked" | "cancelled" | "completed";
  priceCents: number;
  notes?: string;
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
  amountCents: number;
  currency: string;
  date: string;
  category?: string;
}

export interface Folio {
  lines: FolioLine[];
  totalCents: number;
  currency: string;
  finalized: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  channel: "IN_APP" | "PUSH" | "EMAIL" | "SMS";
  kind: "SUCCESS" | "PENDING" | "WARNING" | "ERROR" | "INFO" | "NEUTRAL";
  title: string;
  body?: string;
  payload?: Record<string, any>;
  sentAt: string;
  readAt?: string;
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
  body: string;
  kind: string;
}

// Hotel Types
export interface Room {
  id: string;
  hotelId: string;
  number: string;
  type: string;
  priceCents: number;
  floor?: string;
  imageUrl?: string;
  amenities: string[];
  status: string;
}

export interface Hotel {
  id: string;
  name: string;
  address?: string;
  description?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  checkInTime?: string;
  checkOutTime?: string;
  currency?: string;
  timezone?: string;
  rating?: number;
  city?: string;
  amenities?: string[];
  availableRooms?: number;
  latitude?: number;
  longitude?: number;
}

export interface LinkReservationDto {
  confirmationNumber: string;
  email?: string;
  phone?: string;
}
