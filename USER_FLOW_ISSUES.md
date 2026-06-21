# InnSync User Flow Issues & Improvements

## Overview

This document outlines the flaws in the current signup → onboarding → home user flow, provides suggested fixes, and lays out an implementation plan.

---

## Current User Flow

1. User signs up (creates account)
2. App checks for existing stays via `/reservations`
3. If no stays → forces user into **onboarding** (which creates a new stay without selecting a hotel!)
4. Onboarding has 4 steps (travel details, preferences, vibe, review)
5. After onboarding → goes to home screen

---

## Critical Issues

### 1. ❌ No Hotel Selection Before Onboarding

**Severity**: CRITICAL  
**Description**: The current onboarding flow creates a stay without letting the user select which hotel they want to book! The `CreateStayDto` has an optional `hotelId` field, but it's not used anywhere.  
**Impact**: Users can't choose their hotel, which is the most fundamental part of booking a stay.  
**Affects**: Both Frontend & Backend

---

### 2. ❌ No Way to Link Existing Reservation

**Severity**: HIGH  
**Description**: If a user already has a reservation (booked via website, travel agent, etc.), there's no way to link it to their account. They're forced to create a new stay instead.  
**Impact**: Poor user experience for returning guests or users who booked through other channels.  
**Affects**: Both Frontend & Backend

---

### 3. ❌ Onboarding is Mandatory (No Skip Option)

**Severity**: HIGH  
**Description**: Users can't skip onboarding even if they just want to browse the app, explore features, or link an existing reservation later.  
**Impact**: High dropout rate; users may abandon the app if forced to do things they don't want to.  
**Affects**: Frontend

---

### 4. ❌ No Welcome/Success Screen After Signup

**Severity**: MEDIUM  
**Description**: After successful signup, the app immediately shows a loading spinner and jumps to stay check/onboarding with no context.  
**Impact**: Disorienting user experience; no positive reinforcement for successful signup.  
**Affects**: Frontend

---

### 5. ❌ "Review & Pay" Step is Misleading

**Severity**: MEDIUM  
**Description**: The 4th onboarding step is called "Review & Pay", but no actual payment processing happens.  
**Impact**: Confuses users; sets wrong expectations.  
**Affects**: Frontend

---

### 6. ❌ No Onboarding Progress Persistence

**Severity**: MEDIUM  
**Description**: If a user leaves the onboarding flow mid-way, they have to start all over from step 1.  
**Impact**: Frustrating user experience.  
**Affects**: Frontend

---

### 7. ❌ No Context to Loading States

**Severity**: LOW  
**Description**: Loading spinners don't explain what's happening (e.g., "Checking for your stays...").  
**Impact**: Poor UX; users don't know what to wait for.  
**Affects**: Frontend

---

## Suggested Improvements

### 1. ✅ Add Welcome Screen After Signup

**What**: Show a friendly welcome screen after successful signup with clear next steps.  
**Why**: Positive reinforcement, sets expectations, lets users choose their path.  
**Affects**: Frontend

---

### 2. ✅ Add 3 Clear Paths on Welcome Screen

**What**:

- **Path A**: "Book a New Stay" → Hotel search → Onboarding
- **Path B**: "Link Existing Reservation" → Enter confirmation number → Link to account
- **Path C**: "Browse the App" → Skip directly to home screen
  **Why**: Gives users control, respects their intent, accommodates different use cases.  
  **Affects**: Both Frontend & Backend

---

### 3. ✅ Add Hotel Search/Selection

**What**: Add a hotel search/selection screen before onboarding.  
**Why**: Users must choose a hotel before booking a stay!  
**Affects**: Both Frontend & Backend

---

### 4. ✅ Add "Link Existing Reservation" Flow

**What**: Let users enter their confirmation number to link an existing stay to their account.  
**Why**: Accommodates users who booked through other channels.  
**Affects**: Both Frontend & Backend

---

### 5. ✅ Rename "Review & Pay" to "Review & Confirm"

**What**: Update the step title to be accurate (no payment happens).  
**Why**: Avoid confusion, set correct expectations.  
**Affects**: Frontend

---

### 6. ✅ Persist Onboarding Progress

**What**: Save onboarding progress to secure storage so users can resume later.  
**Why**: Reduce frustration if user leaves mid-flow.  
**Affects**: Frontend

---

### 7. ✅ Add Context to Loading States

**What**: Update loading screens to show what's happening (e.g., "Checking for your stays...", "Linking your reservation...").  
**Why**: Better UX, keeps users informed.  
**Affects**: Frontend

---

## Implementation Approach Plan

### Phase 1: Quick Wins (Frontend Only)

1. Add welcome screen after signup
2. Add "Skip Onboarding" option to welcome screen
3. Rename "Review & Pay" to "Review & Confirm"
4. Add context to loading states

### Phase 2: Core Features (Frontend + Backend)

1. Add hotel search/selection screen
2. Update onboarding to require hotel selection first
3. Add "Link Existing Reservation" flow (frontend + backend endpoint)
4. Update `CreateStayDto` to make `hotelId` required (or validate it)

### Phase 3: Polish (Frontend Only)

1. Persist onboarding progress
2. Add haptic feedback at key steps
3. Add profile edit option after signup

---

## Required Backend Changes

1. **Hotel endpoints**: Add endpoints to list/search hotels
2. **Link reservation endpoint**: Add endpoint to link existing reservation by confirmation number
3. **Validate `hotelId`**: Make `hotelId` required in `CreateStayDto` or add validation

---

## Required Frontend Changes

1. Add welcome screen component
2. Add hotel search/selection screen
3. Add link reservation screen
4. Update onboarding flow to start with hotel selection
5. Add onboarding progress persistence
6. Update loading states with context
7. Update step titles

---

## File Changes Checklist

### Frontend

- [ ] New: `src/app/welcome.tsx` (welcome screen)
- [ ] New: `src/app/hotel-search.tsx` (hotel search/selection)
- [ ] New: `src/app/link-reservation.tsx` (link existing reservation)
- [ ] Update: `src/app/signup.tsx` (navigate to welcome instead of checking stays directly)
- [ ] Update: `src/screens/OnboardingScreen.tsx` (add hotel selection, rename step 4, persist progress)
- [ ] Update: `src/api/endpoints.ts` (add hotel endpoints, link reservation endpoint)
- [ ] Update: `src/api/types.ts` (add Hotel type, LinkReservationDto type)
- [ ] New: `src/services/hotels.service.ts` (hotel service)
- [ ] New: `src/utils/onboarding-storage.ts` (onboarding progress persistence)

### Backend

- [ ] Add: `GET /hotels` (list/search hotels)
- [ ] Add: `GET /hotels/:id` (get hotel details)
- [ ] Add: `POST /reservations/link` (link existing reservation by confirmation number)
- [ ] Update: `POST /reservations` (validate hotelId, make it required or handle properly)
