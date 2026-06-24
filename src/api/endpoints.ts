import apiClient from "./client";
import {
  AuthResponse,
  SignInDto,
  SignUpDto,
  GoogleSignInDto,
  RefreshTokenDto,
  GuestStay,
  CreateStayDto,
  PlaceOrderDto,
  MenuItem,
  OrderResponseDto,
  UnlockDto,
  VerifyPinDto,
  ItineraryItem,
  Folio,
  GuestInfoDto,
  User,
  ApiResponse,
  AuthSession,
  Hotel,
  LinkReservationDto,
} from "./types";

// Auth Endpoints
export const authEndpoints = {
  signIn: (credentials: SignInDto) =>
    apiClient
      .post<ApiResponse<AuthResponse>>("/auth/sign-in", credentials)
      .then((r) => r.data.data),

  signUp: (credentials: SignUpDto) =>
    apiClient
      .post<ApiResponse<AuthResponse>>("/auth/sign-up", credentials)
      .then((r) => r.data.data),

  refresh: (dto: RefreshTokenDto) =>
    apiClient
      .post<
        ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>
      >("/auth/refresh", dto)
      .then((r) => r.data.data),

  signOut: () => apiClient.post("/auth/sign-out"),

  googleSignIn: (dto: GoogleSignInDto) =>
    apiClient
      .post<ApiResponse<AuthResponse>>("/auth/google", dto)
      .then((r) => r.data.data),

  getMe: () =>
    apiClient.get<ApiResponse<User>>("/auth/me").then((r) => r.data.data),
};

// Orders Endpoints
export const orderEndpoints = {
  place: (dto: PlaceOrderDto, idempotencyKey: string) =>
    apiClient
      .post<ApiResponse<OrderResponseDto>>("/orders", dto, {
        headers: { "Idempotency-Key": idempotencyKey },
      })
      .then((r) => r.data.data),

  list: (params?: { status?: "active" | "all"; limit?: number }) =>
    apiClient
      .get<ApiResponse<OrderResponseDto[]>>("/orders", { params })
      .then((r) => r.data.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<OrderResponseDto>>(`/orders/${id}`)
      .then((r) => r.data.data),
};

// Menu Endpoints
export const menuEndpoints = {
  list: (category?: MenuItem["category"]) =>
    apiClient
      .get<ApiResponse<MenuItem[]>>("/menu", { params: { category } })
      .then((r) => r.data.data),
};

// Digital Key Endpoints
export const digitalKeyEndpoints = {
  unlock: (dto: UnlockDto) => apiClient.post("/digital-key/unlock", dto),

  verifyPin: (dto: VerifyPinDto) =>
    apiClient.post<{ ok: boolean }>("/digital-key/verify-pin", dto),
};

// Guests Endpoints
export const guestEndpoints = {
  submitGuestInfo: (stayId: string, dto: GuestInfoDto) =>
    apiClient
      .post<ApiResponse<GuestStay>>(`/reservations/${stayId}/guest-info`, dto)
      .then((r) => r.data.data),
};

// Itinerary Endpoints
export const itineraryEndpoints = {
  list: (stayId: string) =>
    apiClient
      .get<ApiResponse<ItineraryItem[]>>("/itinerary", { params: { stayId } })
      .then((r) => r.data.data),

  bookActivity: (activityId: string, stayId: string) =>
    apiClient.post(`/itinerary/activities/${activityId}/book`, null, {
      params: { stayId },
    }),
};

// Billing Endpoints
export const billingEndpoints = {
  getFolio: (stayId: string) =>
    apiClient
      .get<ApiResponse<Folio>>(`/billing/folio/${stayId}`)
      .then((r) => r.data.data),
};

// Rooms Endpoints
export const roomEndpoints = {
  list: (stayId: string) => apiClient.get(`/rooms`, { params: { stayId } }),
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
  list: () => apiClient.get("/notifications"),

  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
};

// Loyalty Endpoints
export const loyaltyEndpoints = {
  getPoints: () => apiClient.get("/loyalty/points"),

  getRewards: () => apiClient.get("/loyalty/rewards"),
};

// Recommendations Endpoints
export const recommendationEndpoints = {
  getPersonalized: (stayId: string) =>
    apiClient.get("/recommendations/personalized", { params: { stayId } }),

  getPopular: () => apiClient.get("/recommendations/popular"),
};

// User/Security Endpoints
export const userEndpoints = {
  getLoginHistory: () =>
    apiClient
      .get<ApiResponse<AuthSession[]>>("/me/sessions")
      .then((r) => r.data.data),

  revokeSession: (sessionId: string) =>
    apiClient.delete(`/me/sessions/${sessionId}`),

  // TODO: Add change password, 2FA endpoints when backend supports them
};

// Hotel Endpoints
export const hotelEndpoints = {
  list: (search?: string, city?: string) =>
    apiClient
      .get<ApiResponse<Hotel[]>>("/hotels", { params: { search, city } })
      .then((r) => r.data.data),

  getOne: (hotelId: string) =>
    apiClient
      .get<ApiResponse<Hotel>>(`/hotels/${hotelId}`)
      .then((r) => r.data.data),

  getRooms: (hotelId: string) =>
    apiClient
      .get<ApiResponse<Room[]>>(`/hotels/${hotelId}/rooms`)
      .then((r) => r.data.data),
};

// Extend reservation endpoints with link
export const reservationEndpoints = {
  list: () =>
    apiClient
      .get<ApiResponse<GuestStay[]>>("/reservations")
      .then((r) => r.data.data),

  create: (dto: CreateStayDto) =>
    apiClient
      .post<ApiResponse<GuestStay>>("/reservations", dto)
      .then((r) => r.data.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<GuestStay>>(`/reservations/${id}`)
      .then((r) => r.data.data),

  checkIn: (id: string) => apiClient.post(`/reservations/${id}/check-in`),

  linkReservation: (dto: LinkReservationDto) =>
    apiClient
      .post<ApiResponse<GuestStay>>("/reservations/link", dto)
      .then((r) => r.data.data),
};
