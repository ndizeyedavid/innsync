import apiClient from './client';
import {
  AuthResponse,
  SignInDto,
  SignUpDto,
  RefreshTokenDto,
  Reservation,
  CreateStayDto,
  Order,
  PlaceOrderDto,
  MenuItem,
  OrderResponseDto,
  DigitalKey,
  UnlockDto,
  VerifyPinDto,
  ItineraryItem,
  Activity,
  Folio,
  GuestInfo,
  User,
} from './types';

// Auth Endpoints
export const authEndpoints = {
  signIn: (credentials: SignInDto) => 
    apiClient.post<AuthResponse>('/auth/sign-in', credentials),
  
  signUp: (credentials: SignUpDto) => 
    apiClient.post<AuthResponse>('/auth/sign-up', credentials),
  
  refresh: (dto: RefreshTokenDto) => 
    apiClient.post<{ tokens: { accessToken: string; refreshToken: string } }>('/auth/refresh', dto),
  
  signOut: () => 
    apiClient.post('/auth/sign-out'),
  
  getMe: () => 
    apiClient.get<User>('/auth/me'),
};

// Reservations Endpoints
export const reservationEndpoints = {
  list: () => 
    apiClient.get<Reservation[]>('/reservations'),
  
  create: (dto: CreateStayDto) => 
    apiClient.post<Reservation>('/reservations', dto),
  
  getOne: (id: string) => 
    apiClient.get<Reservation>(`/reservations/${id}`),
  
  checkIn: (id: string) => 
    apiClient.post(`/reservations/${id}/check-in`),
};

// Orders Endpoints
export const orderEndpoints = {
  place: (dto: PlaceOrderDto, idempotencyKey: string) => 
    apiClient.post<OrderResponseDto>('/orders', dto, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  
  list: (params?: { status?: 'active' | 'all'; limit?: number }) => 
    apiClient.get<OrderResponseDto[]>('/orders', { params }),
  
  getOne: (id: string) => 
    apiClient.get<OrderResponseDto>(`/orders/${id}`),
};

// Menu Endpoints
export const menuEndpoints = {
  list: (category?: MenuItem['category']) => 
    apiClient.get<MenuItem[]>('/menu', { params: { category } }),
};

// Digital Key Endpoints
export const digitalKeyEndpoints = {
  unlock: (dto: UnlockDto) => 
    apiClient.post('/digital-key/unlock', dto),
  
  verifyPin: (dto: VerifyPinDto) => 
    apiClient.post<{ ok: boolean }>('/digital-key/verify-pin', dto),
};

// Guests Endpoints
export const guestEndpoints = {
  submitGuestInfo: (stayId: string, dto: GuestInfo) => 
    apiClient.post(`/reservations/${stayId}/guest-info`, dto),
};

// Itinerary Endpoints
export const itineraryEndpoints = {
  list: (stayId: string) => 
    apiClient.get<ItineraryItem[]>('/itinerary', { params: { stayId } }),
  
  bookActivity: (activityId: string, stayId: string) => 
    apiClient.post(`/itinerary/activities/${activityId}/book`, null, { 
      params: { stayId } 
    }),
};

// Billing Endpoints
export const billingEndpoints = {
  getFolio: (stayId: string) => 
    apiClient.get<Folio>(`/billing/folio/${stayId}`),
};

// Rooms Endpoints
export const roomEndpoints = {
  list: (stayId: string) => 
    apiClient.get(`/rooms`, { params: { stayId } }),
};

// Housekeeping Endpoints
export const housekeepingEndpoints = {
  requestService: (stayId: string, type: string, notes?: string) => 
    apiClient.post(`/housekeeping/request`, { stayId, type, notes }),
  
  getStatus: (stayId: string) => 
    apiClient.get(`/housekeeping/status/${stayId}`),
};

// Notifications Endpoints
export const notificationEndpoints = {
  list: () => 
    apiClient.get('/notifications'),
  
  markAsRead: (id: string) => 
    apiClient.patch(`/notifications/${id}/read`),
};

// Loyalty Endpoints
export const loyaltyEndpoints = {
  getPoints: () => 
    apiClient.get('/loyalty/points'),
  
  getRewards: () => 
    apiClient.get('/loyalty/rewards'),
};

// Recommendations Endpoints
export const recommendationEndpoints = {
  getPersonalized: (stayId: string) => 
    apiClient.get('/recommendations/personalized', { params: { stayId } }),
  
  getPopular: () => 
    apiClient.get('/recommendations/popular'),
};