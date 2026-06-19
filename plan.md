# Backend Integration Plan for InnSync Mobile App

## Backend Analysis Summary

### Backend Technology Stack
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT with Argon2 password hashing
- **API Documentation**: Swagger/OpenAPI

### API Endpoints Structure

#### Authentication (`/auth`)
- `POST /auth/sign-up` - Create new account
- `POST /auth/sign-in` - Exchange credentials for tokens
- `POST /auth/refresh` - Rotate access + refresh tokens
- `POST /auth/sign-out` - Revoke current session
- `GET /auth/me` - Get authenticated user + guest profile

#### Reservations (`/reservations`)
- `GET /reservations` - List user's reservations
- `POST /reservations` - Create draft stay
- `GET /reservations/:id` - Get single reservation
- `POST /reservations/:id/check-in` - Check in to reservation

#### Orders (`/orders`)
- `POST /orders` - Place new order (idempotent)
- `GET /orders` - List user's orders (active/all)
- `GET /orders/:id` - Get single order

#### Menu (`/menu`)
- `GET /menu` - List menu items (with category filter)

#### Digital Key (`/digital-key`)
- `POST /digital-key/unlock` - Record unlock attempt
- `POST /digital-key/verify-pin` - Verify PIN for digital key

#### Guests (`/reservations/:stayId/guest-info`)
- `POST /guests/guest-info` - Submit guest information

#### Itinerary (`/itinerary`)
- `GET /itinerary` - Get itinerary for stay
- `POST /itinerary/activities/:id/book` - Book activity

#### Other Modules
- Billing (`/billing`)
- Checkout (`/checkout`)
- Housekeeping (`/housekeeping`)
- Loyalty (`/loyalty`)
- Notifications (`/notifications`)
- Payments (`/payments`)
- Recommendations (`/recommendations`)
- Rooms (`/rooms`)
- Users (`/users`)

### Authentication Flow
1. User signs in → Returns `{ tokens: { accessToken, refreshToken }, user }`
2. Access token used in `Authorization: Bearer <token>` header
3. Refresh token rotation for session management
4. Device info tracking (IP, user agent, device label)

## Required Libraries

### Core Dependencies
1. **axios** (~1.7.7)
   - HTTP client with interceptors
   - Request/response transformation
   - Timeout and retry handling

2. **expo-secure-store** (~2.0.0)
   - Secure storage for JWT tokens
   - Encrypt sensitive data

3. **socket.io-client** (~4.7.5)
   - Real-time communication
   - Order status updates
   - Digital key events
   - Notifications

### State Management & Data Fetching
4. **zustand** (~5.0.0)
   - Lightweight state management
   - Auth state, user session

5. **@tanstack/react-query** (~5.0.0)
   - Data fetching, caching, synchronization
   - Automatic retries, refetching
   - Optimistic updates

### Form Handling & Validation
6. **react-hook-form** (~7.53.0)
   - Form state management
   - Performance optimized

7. **zod** (~3.23.0)
   - Schema validation
   - Type-safe validation

### Utilities
8. **jwt-decode** (~4.0.0)
   - JWT token inspection
   - Expiration checking

## Integration Architecture

### Directory Structure
```
src/
├── api/
│   ├── client.ts          # Axios instance with interceptors
│   ├── endpoints.ts       # API endpoint definitions
│   └── types.ts           # API response types
├── services/
│   ├── auth.service.ts    # Authentication logic
│   ├── orders.service.ts  # Orders API calls
│   ├── reservations.service.ts
│   └── ...
├── store/
│   ├── auth.store.ts      # Auth state (Zustand)
│   └── user.store.ts      # User data state
├── hooks/
│   ├── useAuth.ts         # Auth hook
│   ├── useApi.ts          # API query hook
│   └── useWebSocket.ts    # WebSocket hook
├── utils/
│   ├── storage.ts         # Secure storage wrappers
│   └── validation.ts      # Zod schemas
└── constants/
    └── config.ts          # API base URL, constants
```

### Implementation Steps

#### Phase 1: Foundation Setup
1. Install all required dependencies
2. Set up TypeScript types for API responses
3. Configure axios instance with interceptors
4. Set up secure storage utilities
5. Create environment configuration

#### Phase 2: Authentication System
6. Create auth store with Zustand
7. Implement token storage/retrieval
8. Build auth service (sign-in, sign-up, refresh)
9. Create auth hooks (useAuth)
10. Add token refresh interceptor
11. Update login/signup screens with real API calls

#### Phase 3: API Client & Data Fetching
12. Create API client with base configuration
13. Define API endpoints for each module
14. Set up React Query configuration
15. Create service layer for each backend module
16. Implement error handling and retry logic

#### Phase 4: Screen Integration
17. Update HomeScreen with real reservations data
18. Connect OrdersScreen to orders API
19. Connect ItineraryScreen to itinerary API
20. Connect ProfileScreen to user API
21. Connect DigitalKeyScreen to digital-key API
22. Update Menu/Ordering flows with real data

#### Phase 5: Real-time Features
23. Set up Socket.IO client
24. Implement WebSocket hooks
25. Connect to order status updates
26. Connect to digital key events
27. Connect to notifications

#### Phase 6: Error Handling & Loading States
28. Add loading indicators
29. Implement error boundaries
30. Add offline handling
31. Implement retry mechanisms

#### Phase 7: Testing & Optimization
32. Test all API integrations
33. Optimize bundle size
34. Add request/response logging
35. Performance tuning

## Key Integration Points

### Authentication Flow
```
LoginScreen → Auth Service → API → Token Storage → Auth Store → App State
```

### Data Fetching Pattern
```
Screen Component → React Query Hook → Service Layer → API Client → Backend
```

### Real-time Updates
```
Socket.IO Client → Event Listeners → State Update → UI Re-render
```

## Security Considerations

1. **Token Storage**: Use expo-secure-store for token persistence
2. **SSL Pinning**: Implement certificate pinning for production
3. **Request Signing**: Add request signatures for sensitive operations
4. **Rate Limiting**: Respect backend rate limits
5. **Input Validation**: Validate all inputs on client side
6. **Error Messages**: Don't expose sensitive error details

## API Base Configuration

```typescript
const API_CONFIG = {
  baseURL: __DEV__ ? 'http://localhost:3000' : 'https://api.innsync.com',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};
```

## Mobile Screens Mapping

| Screen | Backend Module | Key Endpoints |
|--------|---------------|---------------|
| LoginScreen | Auth | POST /auth/sign-in |
| SignupScreen | Auth | POST /auth/sign-up |
| HomeScreen | Reservations | GET /reservations |
| OrdersScreen | Orders | GET /orders, POST /orders |
| ItineraryScreen | Itinerary | GET /itinerary |
| ProfileScreen | Users, Auth | GET /auth/me |
| DigitalKeyScreen | Digital Key | POST /digital-key/verify-pin |
| OnboardingScreen | Guests | POST /guests/guest-info |
| ViewFolioScreen | Billing | GET /billing |

## Next Steps

1. Install dependencies
2. Set up project structure
3. Implement authentication system
4. Build API client layer
5. Integrate screens one by one
6. Add real-time features
7. Test and optimize

## Notes

- Backend uses idempotency keys for orders - implement on mobile
- Socket.IO for real-time order updates and digital key events
- Token rotation implemented in backend - handle refresh on mobile
- Rate limiting enabled on backend - implement exponential backoff
- Device info tracking - send device metadata on auth