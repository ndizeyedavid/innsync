# InnSync Project Session Summary

**Date**: Ongoing Project

---

## 1. Project Overview

InnSync is a modern hotel guest experience mobile app built with React Native & Expo. It provides guests with digital key access, in-room dining, itinerary management, billing, and more.

---

## 2. Current Implementation Status

### ✅ Core Features Complete

#### Authentication & Onboarding

- Sign in / Sign up with secure token storage
- Token refresh & rotation
- Welcome screen post-signup with 3 paths (Book, Link Reservation, Browse)
- Hotel search & selection (with detailed views and map integration)
- Onboarding flow with guest preferences, hotel selection, and progress persistence
- Restart check-in functionality
- Device info tracking

#### Home & Digital Key

- Home screen with guest stays
- Digital key with press-and-hold unlock
- Haptic feedback during unlock
- Restart check-in screen
- Auto-lock timer
- Quick actions menu

#### Orders & Menu

- Menu browsing with categories
- Order placement with idempotency keys
- Order progress tracking
- Order details modal
- Special instructions support

#### Itinerary

- Daily itinerary views
- Past/today/future day styling
- Auto-scroll to today
- Activity booking

#### Billing & Folio

- Real-time folio from backend
- Transaction list
- Total balance display
- Guest & room info

#### Profile & Settings

- Personal info (edit functionality working)
- Language & currency preferences
- Payment methods
- Help & support

#### Security

- Change password screen (UI complete)
- Two-factor auth setup (UI complete)
- Login history (UI complete, endpoints defined)

#### Privacy

- Data collection info
- Data sharing preferences
- Delete account flow (UI complete)
- Export data flow (UI complete)

#### Legal

- Terms of Service
- Privacy Policy
- Cookie Policy
- Open Source Licenses

#### Additional Screens

- Amenities screen
- Map view with POIs
- Notifications screen
- Hotel search & detail screens
- Link reservation screen
- Restart check-in

---

## 3. Technical Architecture

### Directory Structure

```
src/
├── api/                    # API layer
│   ├── client.ts          # Axios with interceptors
│   ├── endpoints.ts       # Endpoint definitions
│   └── types.ts           # TypeScript types
├── app/                   # Expo Router screens
├── components/            # Reusable components
├── constants/             # Config
├── contexts/              # Toast context
├── hooks/                 # Custom hooks
├── layout/                # Screen layout
├── screens/               # Screen components
├── services/              # API service layer
├── store/                 # Zustand stores
├── types/                 # Additional types
└── utils/                 # Utilities
```

### State Management

- **Zustand**: Auth store, user session
- **React Query**: Data fetching & caching (ready for use)

### Styling

- **Uniwind + Tailwind CSS** for consistent styling
- Custom color system (cobalt, navy, sand, etc.)

---

## 4. Backend Integration

### Endpoints Connected ✅

- `/auth/*` - Full auth flow
- `/reservations` - Guest stays, link reservation
- `/orders` - Order placement & listing
- `/menu` - Menu items
- `/digital-key` - Unlock & PIN verify
- `/itinerary` - Itinerary items
- `/billing/folio/:stayId` - Folio data
- `/hotels` - List/get hotels (UI complete with mock fallback)

### Endpoints Defined (Ready for Backend) 🟡

- `/me/sessions` - Login history
- `/notifications` - Notifications
- `/housekeeping` - Housekeeping requests
- `/loyalty` - Loyalty points
- `/recommendations` - Personalized recommendations

---

## 5. Dependencies

```json
{
  "expo": "~54.0.22",
  "expo-router": "~6.0.23",
  "zustand": "^5.0.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.7.7",
  "socket.io-client": "^4.7.5",
  "expo-secure-store": "^56.0.4",
  "expo-haptics": "~15.0.8",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.0",
  "uniwind": "~1.0.0"
}
```

---

## 6. Pending Tasks

### Backend

- Implement remaining security/privacy endpoints
- Implement hotel endpoints
- WebSocket event handling for orders & notifications

### UI/UX

- QR code scanner for 2FA
- Offline support

### Testing

- Full E2E testing
- Performance optimization

---

## 7. Quick Reference

### Using Toast

```tsx
import { useToast } from "../contexts/ToastContext";

const { showToast } = useToast();
showToast("success", "Action complete");
showToast("error", "Something went wrong");
```

### Using Auth

```tsx
import { useAuthStore } from "../store/auth.store";
const { user, isAuthenticated } = useAuthStore();
```

### Config

Update `src/constants/config.ts` with your backend IP for development.
