# InnSync Mobile App

A modern hotel guest experience app built with React Native and Expo.

## Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Styling**: Uniwind + Tailwind CSS
- **API**: Axios with interceptors
- **Real-time**: Socket.IO
- **Storage**: Expo Secure Store
- **Haptics**: Expo Haptics

## Features

### ✅ Implemented

- **Authentication**: Sign in / Sign up, token refresh, secure storage
- **Welcome Screen**: New post-signup screen with three distinct paths (Book, Link, Browse)
- **Onboarding**: Guest info, preferences, meal plans, progress persistence, hotel selection
- **Hotel Search**: Browse and select hotels with detailed views and map integration
- **Link Reservation**: Link existing bookings using confirmation number
- **Home Screen**: Digital key, quick actions, notifications
- **Orders**: Menu browsing, order placement, order tracking
- **Itinerary**: Daily agenda, activity booking
- **Digital Key**: Press-and-hold unlock with haptic feedback, restart check-in
- **View Folio**: Real-time billing and transactions
- **Profile**: Personal info, settings (edit functionality working)
- **Security**: Change password, 2FA setup, login history (UI complete)
- **Privacy**: Data collection, sharing, deletion, export (UI complete)
- **Legal**: Terms, privacy policy, cookies, open source
- **Amenities**: Hotel amenities
- **Map View**: POI markers, hotel location maps
- **Notifications**: In-app notifications
- **Haptic Feedback**: Added haptic feedback at key interaction points

### 📁 Project Structure

```
innsync-alpha/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios client with interceptors
│   │   ├── endpoints.ts       # API endpoint definitions
│   │   └── types.ts           # TypeScript types
│   ├── app/                   # Expo Router screens
│   ├── components/            # Reusable components
│   ├── constants/             # Config, constants
│   ├── contexts/              # React contexts (Toast)
│   ├── hooks/                 # Custom hooks
│   ├── layout/                # Layout components
│   ├── screens/               # Screen components
│   ├── services/              # API service layer
│   ├── store/                 # Zustand stores
│   ├── types/                 # Additional types
│   ├── utils/                 # Utilities
│   └── global.css             # Global styles
├── backend/                   # NestJS backend (separate repo)
├── app.json
├── package.json
└── metro.config.js
```

## Getting Started

### Prerequisites

- Node.js
- Expo CLI
- iOS/Android simulator or physical device

### Installation

```bash
# Install dependencies
npm install

# Start Expo
npm start
```

### Backend Setup

The app requires the InnSync NestJS backend running on the same network. Update `src/constants/config.ts` with your backend IP.

## Key Dependencies

```json
{
  "expo": "~54.0.22",
  "expo-router": "~6.0.23",
  "zustand": "^5.0.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.7.7",
  "socket.io-client": "^4.7.5",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.0"
}
```

## Development

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```
