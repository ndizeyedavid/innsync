# InnSync Project Session Summary

_Date: June 9, 2026_

---

## 1. Overview of Session

This session focused on:

- Fixing signup/login errors
- Implementing a custom animated toast notification system
- Integrating the backend API with the frontend
- Setting up proper routing with authentication checks
- Fixing infinite loading issues in the auth store

---

## 2. Backend Integration Progress

### 2.1 Backend Endpoints Analyzed

We examined the backend controllers and identified the following key endpoints:

| Endpoint                       | Method   | Description                   |
| ------------------------------ | -------- | ----------------------------- |
| `/auth/sign-in`                | POST     | User sign-in                  |
| `/auth/sign-up`                | POST     | User sign-up                  |
| `/auth/refresh`                | POST     | Token refresh                 |
| `/auth/me`                     | GET      | Get current user              |
| `/reservations`                | GET/POST | List stays / Create new stay  |
| `/reservations/:id/guest-info` | POST     | Add guest info to stay        |
| `/orders`                      | GET/POST | List orders / Place new order |
| `/itinerary`                   | GET      | Get itinerary for stay        |
| `/menu`                        | GET      | List menu items               |

### 2.2 Frontend API Client Updates

- Updated `src/api/endpoints.ts` to unwrap the backend's response format (`{ data: ... }`)
- Updated API types in `src/api/types.ts` to match backend models:
  - `GuestStay` instead of `Reservation`
  - Updated `OrderResponseDto` to match backend structure

---

## 3. Implemented Features

### 3.1 Custom Toast Notification System

We built a fully custom, animated toast notification system to replace the problematic third-party library:

**Files Added/Updated:**

- `src/contexts/ToastContext.tsx` - Context for managing toast state
- `src/components/Toast.tsx` - Animated toast component
- `src/app/_layout.tsx` - Added `ToastProvider` to root layout
- `src/screens/LoginScreen.tsx`, `src/screens/SignupScreen.tsx` - Integrated toast notifications

**Key Features:**

- Support for `success`, `error`, `info`, and `warn` types
- Smooth slide-in/slide-out animations
- Auto-dismiss after 3 seconds
- Custom icons using `Ionicons`

### 3.2 Authentication & Routing Improvements

- **Fixed signup error:** Corrected import for `getDeviceInfo`
- **Updated `auth.service.ts`:** Changed to use the new endpoint wrappers
- **Added authentication checks to all entry points:**
  - `src/app/index.tsx` - Initial app entry point
  - `src/app/guest.tsx` - Guest home screen
  - `src/app/login.tsx` - Login screen
  - `src/app/signup.tsx` - Signup screen
  - `src/app/onboarding.tsx` - Onboarding flow

### 3.3 Onboarding Flow Fixes

- Updated `OnboardingScreen.tsx` to:
  - Check for existing stays on load
  - Redirect to tabs if stays exist
  - Properly use `GuestInfoDto` and `GuestStay`
- Updated `Preference.tsx` to use string IDs for meal plans instead of numeric indexes
- Updated `ReviewAndPay.tsx` to use selected meal plan ID
- Updated meal plan constant (`mealPlans.tsx`) to use valid backend values (`room-only`, `breakfast`, etc.)

### 3.4 GuestHomeScreen (Amenities Tab) Updates

- Updated `GuestHomeScreen.tsx` to conditionally render:
  - When NOT authenticated: Shows "Discover / Find Your Stay" header, login/signup buttons, and search bar below
  - When authenticated: Hides header, shows search bar in flex-row with notification bell and profile avatar on the right

---

## 4. File Changes Summary

### 4.1 New Files

- `src/constants/dietaryRestrictions.ts` - Dietary restriction options
- `src/contexts/ToastContext.tsx` - Custom toast context
- `src/components/Toast.tsx` - Custom animated toast component

### 4.2 Modified Files

1. `src/api/client.ts` - Added token refresh interceptor (already present, verified)
2. `src/api/endpoints.ts` - Updated all endpoints to unwrap backend response format
3. `src/api/types.ts` - Updated to match backend models
4. `src/app/_layout.tsx` - Added `ToastProvider`
5. `src/app/index.tsx` - Added auth check to route user correctly
6. `src/app/guest.tsx` - Added auth check
7. `src/app/login.tsx` - Added auth check
8. `src/app/signup.tsx` - Added auth check
9. `src/app/onboarding.tsx` - Added auth and stay checks
10. `src/components/onboarding/Preference.tsx` - Updated to use meal plan IDs
11. `src/components/onboarding/ReviewAndPay.tsx` - Updated to use selected meal plan
12. `src/components/onboarding/TravelDetails.tsx` - Verified number stepper usage
13. `src/components/SelectField.tsx` - Fixed potential `items.find` error with optional chaining
14. `src/constants/mealPlans.tsx` - Updated meal plan IDs to backend values
15. `src/hooks/useAuth.ts` - Improved auth initialization logic
16. `src/screens/GuestHomeScreen.tsx` - Added conditional header rendering
17. `src/screens/HomeScreen.tsx` - Updated to use `GuestStay` and `reservationsService`
18. `src/screens/LoginScreen.tsx` - Added toast notifications and stay check
19. `src/screens/SignupScreen.tsx` - Added toast notifications and stay check
20. `src/screens/OnboardingScreen.tsx` - Updated onboarding flow
21. `src/services/auth.service.ts` - Updated to use new endpoints
22. `src/services/reservations.service.ts` - Updated to use `GuestStay`
23. `src/services/orders.service.ts` - Updated to use unwrapped endpoints
24. `src/services/menu.service.ts` - Updated to use unwrapped endpoints
25. `src/services/itinerary.service.ts` - Updated to use unwrapped endpoints
26. `src/services/guests.service.ts` - Updated to use `GuestInfoDto`
27. `src/store/auth.store.ts` - Added `hasInitialized` flag to prevent infinite loading

---

## 5. Fixes & Resolutions

1. **Signup Error:** Fixed `getDeviceInfo` import error in `auth.service.ts`
2. **API Response Wrapping:** Updated all endpoints to unwrap `{ data: ... }` from backend
3. **Meal Plan Validation:** Fixed meal plan values to match backend (`room-only`, `breakfast`, etc.)
4. **Infinite Loading:** Added `hasInitialized` flag to auth store to prevent repeated initialization
5. **Routing:** Added proper auth checks to all entry point routes

---

## 6. Pending Tasks (Next Steps)

1. **Finish integrating other tab screens** (Itinerary, Orders, Profile) with backend API
2. **Implement digital key functionality** (connect with `DigitalKey.tsx` component)
3. **Add menu ordering functionality** (connect with Orders screen)
4. **Implement itinerary features** (book activities, view schedule)
5. **Add profile screen functionality** (edit user profile, view past stays)
6. **Test the full flow** (signup → onboarding → stay experience → checkout)
7. **Implement notifications system** (push notifications, in-app notifications)
8. **Add more error handling** and loading states across all screens
9. **Test on real devices** and optimize performance

---

## 7. Critical Decision Log

1. **Replaced Third-Party Toast Library:** Switched from `caveman` and others to a custom toast system using `Ionicons` because of dependency compatibility issues
2. **Used Zustand for Auth State:** Kept using Zustand since it's already integrated and lightweight
3. **Wrapped Backend API Responses:** The backend uses `{ data: T }` format, so we added unwrapping in `src/api/endpoints.ts` to keep data access consistent
4. **Added `hasInitialized` Flag:** Added to auth store to prevent infinite initialization loops caused by useEffect dependencies

---

## 8. Project Structure Reminder

```
innsync-alpha/
├── backend/ (NestJS)
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── types.ts
│   ├── app/ (Expo Router)
│   ├── components/
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── layout/
│   ├── screens/
│   ├── services/
│   ├── store/
│   └── utils/
└── app.json
```

---

## 9. Dependencies Used (Relevant Additions)

- `@expo/vector-icons` (already present)
- `zustand` (already present)
- `expo-router` (already present)
- `expo-secure-store` (already present)

---

## 10. Quick Code Reference

### 10.1 Using the Custom Toast

```tsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showToast } = useToast();

  const handlePress = () => {
    showToast('success', 'Action completed!');
    // Or:
    showToast('error', 'Something went wrong');
  };

  return (
    // ...
  );
}
```

### 10.2 Using the Auth Hook

```tsx
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, isLoading, user, signIn, signOut } = useAuth();

  // ...
}
```

---

## 11. Notes for Next Session

- Make sure to start the backend server before testing the app
- Both devices (iPhone and development machine) must be on the same Wi-Fi network
- The backend is configured to listen on all interfaces (`0.0.0.0`)
- The frontend API base URL is configured to use the development machine's IP address in `src/constants/config.ts`

---

This document contains all the necessary context to continue working on the InnSync project in the next session!
