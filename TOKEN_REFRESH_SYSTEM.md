# 🪄 Magical Token Refresh System

A sophisticated, silent token refresh implementation that handles expired tokens automatically without user intervention.

## 📋 Overview

This system implements **Automatic Token Refresh with Retry Logic** using an **Axios Interceptor Pattern**. When a user's access token expires, the system:

1. **Detects** the expired token (either proactively or when API returns 401)
2. **Refreshes** the token using the refresh token API
3. **Updates** the NextAuth session with new tokens
4. **Retries** the original failed request
5. **User never notices** - completely seamless! ✨

## 🏗️ Architecture

### Components

1. **Token Manager** (`lib/tokenManager.ts`)
   - Core magical function for token refresh
   - JWT token verification and expiration checking
   - Session update handling

2. **Axios Interceptor** (`app/api/axiosInstance.ts`)
   - Request interceptor: Proactively checks token before each request
   - Response interceptor: Catches 401 errors and triggers refresh

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      API REQUEST                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          REQUEST INTERCEPTOR (Proactive Check)               │
│  • Is token expired or about to expire (5 min buffer)?      │
│  • If YES: Call magicalTokenRefresh()                       │
│  • If NO: Proceed with original token                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SEND REQUEST TO API                       │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │   SUCCESS    │    │  401 ERROR   │
            │   (200-299)  │    │  "Token is   │
            │              │    │   expired"   │
            └──────────────┘    └──────────────┘
                    │                   │
                    │                   ▼
                    │       ┌──────────────────────────────┐
                    │       │   RESPONSE INTERCEPTOR       │
                    │       │ • Detect token expiration    │
                    │       │ • Call magicalTokenRefresh() │
                    │       │ • Retry with new token       │
                    │       └──────────────────────────────┘
                    │                   │
                    └───────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  RETURN RESPONSE │
                    │    TO CALLER     │
                    └──────────────────┘
```

## 🪄 The Magical Function

### `magicalTokenRefresh()`

Located in `lib/tokenManager.ts`, this function:

```typescript
export async function magicalTokenRefresh(): Promise<string | null>
```

**What it does:**
1. Gets current NextAuth session
2. Extracts refresh token
3. Calls refresh token API (`/api/v1/auth/refresh`)
4. Receives new access token and refresh token
5. Updates session storage for immediate availability
6. Dispatches custom event for session update
7. Returns new access token

**Features:**
- ✅ Prevents duplicate refresh attempts (queue system)
- ✅ Uses native `fetch` to avoid circular axios dependency
- ✅ Handles session update with sessionStorage bridge
- ✅ Automatically signs out if refresh fails

### Token Expiration Check

```typescript
export function isTokenExpired(token: string): boolean
```

**What it does:**
- Decodes JWT token
- Checks expiration time (`exp` claim)
- Adds 5-minute buffer for proactive refresh
- Returns `true` if expired or about to expire

### Convenience Function

```typescript
export async function getValidAccessToken(): Promise<string | null>
```

**What it does:**
- Gets current session
- Checks if token is valid
- Refreshes if needed
- Returns valid access token

## 🔄 How It Works

### Scenario 1: Proactive Refresh (Request Interceptor)

```typescript
// User makes an API call
const response = await getCourseDetail(courseId);

// Behind the scenes:
// 1. Request interceptor checks token expiration
// 2. Token is expired (or will expire in < 5 minutes)
// 3. Calls magicalTokenRefresh() BEFORE sending request
// 4. Request proceeds with fresh token
// 5. User gets response - never knew token was expired!
```

### Scenario 2: Reactive Refresh (Response Interceptor)

```typescript
// User makes an API call
const response = await enrollInCourse(courseId);

// Behind the scenes:
// 1. Request sent with current token
// 2. Server returns 401 with "Token is expired"
// 3. Response interceptor catches error
// 4. Calls magicalTokenRefresh()
// 5. Retries original request with new token
// 6. User gets response - never knew about the error!
```

### Scenario 3: Multiple Simultaneous Requests

```typescript
// User triggers multiple API calls at once
Promise.all([
  getCourseDetail(courseId1),
  getCourseDetail(courseId2),
  getUserProfile(),
]);

// Behind the scenes:
// 1. All three requests detect expired token
// 2. First request triggers magicalTokenRefresh()
// 3. Other two requests are queued (not duplicate refresh)
// 4. When refresh completes, all queued requests proceed
// 5. All three requests succeed with new token!
```

## 📝 Usage Examples

### Automatic Usage (Default)

**You don't need to do anything!** All API calls through `axiosInstance` automatically benefit from this system.

```typescript
import axiosInstance from "@/app/api/axiosInstance";

// This will automatically refresh token if needed
const response = await axiosInstance.get("/api/v1/courses");
```

### Manual Usage (Advanced)

If you need to manually check/refresh tokens:

```typescript
import { getValidAccessToken, isTokenExpired } from "@/lib/tokenManager";

// Check if current token is valid
const session = await getSession();
const token = session?.accessToken;

if (token && isTokenExpired(token)) {
  console.log("Token is expired!");
}

// Get a valid token (refresh if needed)
const validToken = await getValidAccessToken();
if (validToken) {
  // Use the token
  fetch("/some-api", {
    headers: { Authorization: `Bearer ${validToken}` }
  });
}
```

### Custom API Calls

For API calls NOT using `axiosInstance`:

```typescript
import { getValidAccessToken } from "@/lib/tokenManager";

async function customAPICall() {
  // Get valid token (will refresh if needed)
  const token = await getValidAccessToken();
  
  if (!token) {
    // User needs to login
    return;
  }
  
  const response = await fetch("/custom-api", {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  return response.json();
}
```

## 🎯 Key Features

### 1. **Silent Operation**
- User never sees login prompts for expired tokens
- No interruption to user workflow
- Seamless experience

### 2. **Proactive Refresh**
- Checks token before each request
- 5-minute buffer before expiration
- Reduces 401 errors

### 3. **Reactive Refresh**
- Catches 401 "Token is expired" errors
- Automatically retries failed requests
- Handles edge cases

### 4. **Request Queueing**
- Multiple simultaneous expired requests
- Only one refresh operation at a time
- All queued requests proceed after refresh

### 5. **Smart Error Handling**
- Detects various token expiration messages
- Skips refresh for auth endpoints (login, signup)
- Proper error propagation

## ⚙️ Configuration

### Token Expiration Buffer

Modify the buffer time in `lib/tokenManager.ts`:

```typescript
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 5 * 60; // Change this (in seconds)
  
  return decoded.exp < currentTime + bufferTime;
}
```

### Session Storage Timeout

Modify the temporary storage duration in `lib/tokenManager.ts`:

```typescript
// Clear temporary tokens after session updates
setTimeout(() => {
  sessionStorage.removeItem("_refresh_access_token");
  sessionStorage.removeItem("_refresh_refresh_token");
}, 5000); // Change this (in milliseconds)
```

## 🔍 Debugging

### Enable Console Logs

The system already includes strategic console logs:

```typescript
// In request interceptor
console.log("Token expired, proactively refreshing before request...");

// In token manager
console.error("No session found");
console.error("No refresh token found in session");
console.error("Token refresh failed:", error);

// In response interceptor
console.error("Magical token refresh failed:", refreshError);
```

### Check Token Status

```typescript
import { isTokenExpired } from "@/lib/tokenManager";
import { getSession } from "next-auth/react";

async function checkTokenStatus() {
  const session = await getSession();
  const token = session?.accessToken;
  
  if (!token) {
    console.log("No token found");
    return;
  }
  
  console.log("Token expired?", isTokenExpired(token));
  
  // Decode and inspect
  const parts = token.split(".");
  const payload = JSON.parse(atob(parts[1]));
  console.log("Token payload:", payload);
  console.log("Expires at:", new Date(payload.exp * 1000));
}
```

## 🚨 Error Scenarios

### 1. No Refresh Token

**Scenario:** User's refresh token is missing or invalid

**Handling:**
- `magicalTokenRefresh()` returns `null`
- User is automatically signed out
- Redirected to `/login`

### 2. Refresh API Fails

**Scenario:** Refresh token API returns error

**Handling:**
- Caught in try-catch block
- User is automatically signed out
- Redirected to `/login`

### 3. Network Error During Refresh

**Scenario:** Network issue during token refresh

**Handling:**
- Error logged to console
- User is signed out
- Redirected to `/login`

### 4. Circular Dependency

**Scenario:** Using `axiosInstance` in refresh function

**Solution:** ✅ Already handled!
- `magicalTokenRefresh()` uses native `fetch` API
- No circular dependency with axios

## 📊 API Response Format

The system expects this response from `/api/v1/auth/refresh`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Alternative format also supported:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🎉 Benefits

1. **Better UX**: Users never interrupted by expired token errors
2. **Fewer Support Tickets**: No "why was I logged out?" complaints
3. **Improved Performance**: Proactive refresh prevents failed requests
4. **Maintainable Code**: Centralized token logic in one place
5. **Scalable**: Handles multiple simultaneous requests efficiently

## 🔮 Future Enhancements

Potential improvements:

1. **Refresh Token Rotation**: Rotate refresh tokens on each refresh
2. **Token Preemptive Refresh**: Refresh before user action (idle time)
3. **Retry Strategies**: Exponential backoff for refresh failures
4. **Analytics**: Track token refresh metrics
5. **WebSocket Support**: Handle token refresh for WebSocket connections

## 📚 Related Files

- `lib/tokenManager.ts` - Core magical function
- `app/api/axiosInstance.ts` - Axios interceptors
- `lib/context/AuthContext.tsx` - Authentication context
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration

---

**Built with ✨ by the Eduta team**

