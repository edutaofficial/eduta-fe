# OAuth Google Authentication Error Analysis

## Error Message
```
'UserRepositoryAdapter' object has no attribute 'get_by_provider'
```

## Authentication Flow

1. **User clicks "Continue with Google"** → Google OAuth flow starts
2. **Google OAuth completes** → User authorizes, Google redirects back
3. **NextAuth `signIn` callback triggered** → Processes OAuth data
4. **Frontend calls `handleOAuthUser`** → Tries to authenticate user
5. **Backend API call fails** → Backend tries to call non-existent method
6. **Error propagates** → User redirected to `/login?error=...`

## Root Cause

**This is a BACKEND API issue**, not a frontend issue. The backend's `UserRepositoryAdapter` class is missing the `get_by_provider` method that the login/signup endpoints are trying to call.

## Possible Reasons

### 1. **Backend Code Issue (Most Likely)**
- The backend's `UserRepositoryAdapter` class doesn't have a `get_by_provider(provider: str, provider_id: str)` method
- The backend login/signup endpoints are calling this method but it was never implemented
- The backend might be using a different method name (e.g., `find_by_provider`, `get_user_by_provider`, etc.)

### 2. **Backend API Version Mismatch**
- The backend API might have been updated but the OAuth provider lookup logic wasn't implemented
- The backend might expect a different request format

### 3. **Backend Database Schema Issue**
- The backend might not have the proper database tables/columns to store OAuth provider information
- Missing `provider` and `provider_id` columns in the user table

### 4. **Backend Dependency Issue**
- The backend might be missing a required dependency or library for OAuth user lookup
- The repository pattern implementation might be incomplete

## Frontend Code Flow

### Current Implementation

**File: `app/api/auth/[...nextauth]/route.ts`**

1. `signIn` callback receives Google OAuth data
2. Calls `handleOAuthUser(email, providerId, "google", name)`
3. `handleOAuthUser` tries to:
   - **First attempt**: `loginUser({ email, provider: "google", providerId })`
     - Sends POST to `/api/v1/user/login` with:
       ```json
       {
         "email": "user@example.com",
         "provider": "google",
         "providerId": "1234567890"
       }
       ```
   - **If login fails**: `signupUser({ email, provider: "google", providerId, ... })`
     - Sends POST to `/api/v1/user` with:
       ```json
       {
         "email": "user@example.com",
         "first_name": "John",
         "last_name": "Doe",
         "user_type": "learner",
         "provider": "google",
         "providerId": "1234567890"
       }
       ```

### What the Backend Should Do

When receiving OAuth login request:
1. Look up user by `provider` + `providerId` OR by `email`
2. If found → return JWT token
3. If not found → return error (which triggers signup)

When receiving OAuth signup request:
1. Check if user exists by `email` or `provider` + `providerId`
2. If exists → return error
3. If not → create user with OAuth provider info
4. Return success

## Solutions

### Solution 1: Fix Backend (Recommended)

**Backend needs to implement:**

```python
# In UserRepositoryAdapter class
def get_by_provider(self, provider: str, provider_id: str):
    """Find user by OAuth provider and provider ID"""
    return self.db.query(User).filter(
        User.provider == provider,
        User.provider_id == provider_id
    ).first()

# Or if using email lookup:
def get_by_email_and_provider(self, email: str, provider: str):
    """Find user by email and provider"""
    return self.db.query(User).filter(
        User.email == email,
        User.provider == provider
    ).first()
```

### Solution 2: Frontend Workaround (Temporary)

If backend can't be fixed immediately, we could:

1. **Try email-only lookup first** (if backend supports it)
2. **Handle the error more gracefully** (already implemented)
3. **Add retry logic** with different request formats

### Solution 3: Alternative Backend Endpoint

If the backend has a different endpoint for OAuth:
- Check backend documentation for OAuth-specific endpoints
- Update frontend to use the correct endpoint

## Current Error Handling

The frontend already has good error handling:
- ✅ Error messages are displayed to users
- ✅ Errors are logged for debugging
- ✅ Network errors are distinguished from auth errors

## Next Steps

1. **Check Backend API Documentation** - Verify the correct endpoint/method for OAuth login
2. **Contact Backend Team** - Report missing `get_by_provider` method
3. **Check Backend Logs** - See what the backend is actually receiving
4. **Test Backend Directly** - Use Postman/curl to test OAuth endpoints
5. **Verify Backend Database** - Ensure OAuth fields exist in user table

## Testing

To test if backend supports OAuth:

```bash
# Test OAuth login endpoint
curl -X POST https://api.eduta.org/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "provider": "google",
    "providerId": "test-provider-id"
  }'

# Test OAuth signup endpoint
curl -X POST https://api.eduta.org/api/v1/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "user_type": "learner",
    "provider": "google",
    "providerId": "test-provider-id"
  }'
```

## Additional Issues Found

1. **404 Errors for Blog API** - `GET /api/v1/blog?page=1&pageSize=3` returns 404
   - This is a separate backend issue
   - Blog endpoint might not exist or URL is incorrect
   - **Fix**: Check backend API documentation for correct blog endpoint

2. **Missing site.webmanifest** - Returns 404
   - File exists in `app/site.webmanifest` but might not be served correctly
   - **Fix**: Ensure file is in `public/` directory or add route handler

3. **Double slashes in API URL** - `https://api.eduta.org//api/v1/blog`
   - Base URL might have trailing slash: `https://api.eduta.org/`
   - When combined with `/api/v1/blog`, creates `//api/v1/blog`
   - **Fix**: Normalize base URL in `lib/config/api.ts`:
     ```typescript
     export function getBaseUrl(): string {
       if (!API_CONFIG.BASE_URL) {
         throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not defined");
       }
       // Remove trailing slash to prevent double slashes
       return API_CONFIG.BASE_URL.replace(/\/+$/, "");
     }
     ```

