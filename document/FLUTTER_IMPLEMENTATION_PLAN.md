# Flutter Mobile App Implementation Plan
## Logistics Webflow - Driver Mobile Application

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Planning Phase  
**Technology:** Flutter (Dart)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Backend Enhancements](#backend-enhancements)
3. [Flutter App Structure](#flutter-app-structure)
4. [Implementation Phases](#implementation-phases)
5. [Authentication Flow](#authentication-flow)
6. [Security Considerations](#security-considerations)
7. [Dependencies](#dependencies)

---

## 🎯 Overview

### Goal
Create a minimal Flutter mobile app for drivers with:
- ✅ Driver login (using existing user accounts)
- ✅ Home page (driver dashboard)
- ✅ User profile (view and edit)

### Key Requirements
- Use same user database (PostgreSQL)
- JWT authentication (for mobile)
- Same security standards as web app
- Flutter app calls Express API

### Scope (Phase 1)
**Included:**
- Driver login with JWT
- Home page (placeholder for future features)
- User profile display
- Change password functionality

**Not Included:**
- Trip management (future phase)
- Location capture (future phase)
- Photo upload (future phase)

---

## 🔧 Backend Enhancements

### Phase 1: JWT Authentication Infrastructure

#### 1.1 Why JWT for Flutter?
**Problem:** Web app uses session-based auth (cookies), Flutter needs stateless tokens  
**Solution:** Add JWT authentication alongside existing session auth  
**Benefit:** Both web and mobile use same user database, different auth methods

#### 1.2 What Needs to be Added

**A. JWT Dependencies**
- **What:** Install `jsonwebtoken` package
- **Why:** Generate and verify JWT tokens
- **How:** Add to package.json, run npm install

**B. Environment Variables**
- **What:** Add `JWT_SECRET` and `JWT_EXPIRES_IN` to `.env`
- **Why:** 
  - `JWT_SECRET`: Required to sign/verify tokens (must be strong, random)
  - `JWT_EXPIRES_IN`: Token expiration time (e.g., "7d" for 7 days)
- **Security:** JWT_SECRET must be different from SESSION_SECRET, never commit to git

**C. JWT Service**
- **What:** Create `server/services/jwt.service.ts`
- **Why:** Centralize JWT logic (generate tokens, verify tokens)
- **Functions:**
  - `generateToken(user)`: Create JWT with user info (id, username, role)
  - `verifyToken(token)`: Validate token and extract user data
- **Returns:** Token string or user payload

**D. Mobile Login Endpoint**
- **What:** Create `POST /api/auth/login-mobile`
- **Why:** Flutter app needs JWT tokens (not sessions)
- **How:** 
  - Reuse same user validation as web login (Passport local strategy)
  - Instead of creating session, return JWT token
  - Apply same rate limiting as web login
- **Request:** `{ username, password }`
- **Response:** `{ token: "jwt_string", user: {...} }`

**E. JWT Middleware**
- **What:** Create `server/middleware/jwt.middleware.ts`
- **Why:** Protect routes for Flutter app
- **How:**
  - Extract token from `Authorization: Bearer {token}` header
  - Verify token signature using JWT_SECRET
  - Extract user ID from token
  - Load user from database (ensure still active)
  - Set `req.user` (same format as session auth)
- **Protection:** Reject if token invalid, expired, or user inactive

**F. Universal Auth Middleware**
- **What:** Create middleware that supports both session and JWT
- **Why:** 
  - Web routes keep working (session-based)
  - Mobile routes work (JWT-based)
  - Backward compatible
- **How:**
  - Check for `Authorization` header first → use JWT middleware
  - Otherwise → use session middleware
  - Same `req.user` format for both

**G. Protected Route Example**
- **What:** Create `GET /api/driver/profile` endpoint
- **Why:** Flutter app needs driver-specific endpoints
- **How:**
  - Use JWT middleware (or universal middleware)
  - Return user profile data
  - Same validation as web endpoints

#### 1.3 Files to Create/Modify

**New Files:**
- `server/services/jwt.service.ts` - JWT generation/verification
- `server/middleware/jwt.middleware.ts` - JWT validation middleware
- `server/middleware/auth.middleware.ts` - Universal auth middleware (update existing)

**Modified Files:**
- `server/config/env.ts` - Add JWT environment variables
- `server/controllers/auth.controller.ts` - Add mobile login function
- `server/routes/auth.routes.ts` - Register mobile login endpoint

**No Changes Needed:**
- Existing web login (still works with sessions)
- Existing user database (same users for both platforms)
- Existing security measures (rate limiting, validation)

#### 1.4 Backend Implementation Checklist

**Step 1: Install Dependencies**
- Add jsonwebtoken to package.json
- Run npm install

**Step 2: Environment Configuration**
- Add JWT_SECRET to .env (generate strong random string)
- Add JWT_EXPIRES_IN to .env (e.g., "7d")
- Update env.ts to read and validate these variables

**Step 3: Create JWT Service**
- Implement generateToken(user)
- Implement verifyToken(token)
- Handle errors properly

**Step 4: Create Mobile Login Endpoint**
- Add loginMobile function to auth controller
- Use same Passport validation as web login
- Return JWT token instead of creating session
- Apply rate limiting

**Step 5: Create JWT Middleware**
- Extract token from Authorization header
- Verify token signature
- Load user from database
- Set req.user

**Step 6: Test Backend**
- Test mobile login endpoint (Postman/curl)
- Verify token generation
- Verify token validation
- Test protected endpoint with JWT

**Step 7: Verify Web Still Works**
- Test web login (should still use sessions)
- Ensure no breaking changes

---

## 📱 Flutter App Structure

### Project Organization

```
flutter_driver_app/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── config/
│   │   ├── api_config.dart       # API base URL, endpoints
│   │   └── app_config.dart       # App configuration
│   ├── models/
│   │   ├── user.dart             # User model
│   │   └── auth_response.dart    # Login response model
│   ├── services/
│   │   ├── api_service.dart      # HTTP client, API calls
│   │   ├── auth_service.dart     # Authentication logic
│   │   └── storage_service.dart  # Secure token storage
│   ├── providers/
│   │   └── auth_provider.dart    # Auth state management
│   ├── screens/
│   │   ├── login/
│   │   │   └── login_screen.dart
│   │   ├── home/
│   │   │   └── home_screen.dart
│   │   └── profile/
│   │       ├── profile_screen.dart
│   │       └── change_password_screen.dart
│   ├── widgets/
│   │   └── common/               # Reusable widgets
│   └── utils/
│       ├── constants.dart        # App constants
│       └── validators.dart       # Form validation
├── pubspec.yaml                  # Dependencies
└── android/                      # Android config
└── ios/                          # iOS config
```

### Key Components

#### 1. API Service
**What:** HTTP client for backend API calls  
**Why:** Centralize API communication, handle errors  
**Responsibilities:**
- Base URL configuration
- Add Authorization header automatically
- Handle HTTP errors
- Parse JSON responses

**Key Features:**
- Automatic JWT token injection in headers
- Error handling (401, 403, 500, etc.)
- Timeout configuration

#### 2. Auth Service
**What:** Handles authentication operations  
**Why:** Centralize login, logout, token management  
**Responsibilities:**
- Login API call
- Store JWT token securely
- Retrieve stored token
- Clear token on logout
- Check if user is logged in

**Key Features:**
- Login with username/password
- Secure token storage (flutter_secure_storage)
- Auto-login check (read stored token)
- Logout (clear token)

#### 3. Storage Service
**What:** Secure token storage  
**Why:** JWT tokens must be stored securely on device  
**Implementation:**
- Use `flutter_secure_storage` package
- Stores token in iOS Keychain / Android Keystore
- Encrypted at OS level

**Storage Keys:**
- `auth_token` - JWT token
- `user_data` - User info (optional, for offline)

#### 4. Auth Provider (State Management)
**What:** Manages authentication state  
**Why:** React to auth changes, control navigation  
**Responsibilities:**
- Track logged-in state
- Store current user data
- Notify UI of auth changes
- Handle auto-login

**Implementation:**
- Use Provider or Riverpod (lightweight state management)
- Single source of truth for auth state
- Listen to changes from anywhere in app

#### 5. Screens

**Login Screen:**
- Email and password input fields
- Login button
- Loading state
- Error messages
- Navigate to home on success

**Home Screen:**
- Welcome message with user name
- Placeholder for future features (trips, etc.)
- Navigation to profile
- Logout button

**Profile Screen:**
- Display user information (name, email, role)
- Email verification status
- Change password button
- Logout button

**Change Password Screen:**
- Current password field
- New password field
- Confirm password field
- Submit button
- Success/error messages

---

## 📅 Implementation Phases

### Phase 1: Backend JWT Setup (Week 1)

**Goals:**
- Add JWT authentication to backend
- Create mobile login endpoint
- Test with API client

**Tasks:**
1. ✅ Install JWT dependencies
2. ✅ Add JWT environment variables
3. ✅ Create JWT service
4. ✅ Create mobile login endpoint
5. ✅ Create JWT middleware
6. ✅ Create universal auth middleware
7. ✅ Create driver profile endpoint
8. ✅ Test with Postman/curl

**Deliverables:**
- Working `/api/auth/login-mobile` endpoint
- Working `/api/driver/profile` endpoint
- JWT token generation and validation
- Documentation

**Success Criteria:**
- Mobile login returns valid JWT token
- Token validates correctly in middleware
- Driver profile endpoint works with JWT
- Web login still works (no regression)

---

### Phase 2: Flutter Project Setup (Week 1-2)

**Goals:**
- Initialize Flutter project
- Setup project structure
- Install dependencies

**Tasks:**
1. ✅ Create Flutter project
2. ✅ Setup folder structure
3. ✅ Install dependencies (HTTP, secure storage, state management)
4. ✅ Configure API base URL
5. ✅ Setup navigation (go_router or Navigator)
6. ✅ Configure environment variables
7. ✅ Setup code formatting (dart format)

**Dependencies Needed:**
- `http` or `dio` - HTTP client
- `flutter_secure_storage` - Secure token storage
- `provider` or `riverpod` - State management
- `go_router` or `flutter_riverpod` - Navigation
- `shared_preferences` (optional) - For settings

**Deliverables:**
- Flutter project initialized
- Dependencies installed
- Basic project structure
- Configuration files

**Success Criteria:**
- App runs on iOS simulator
- App runs on Android emulator
- No compilation errors
- Dependencies properly installed

---

### Phase 3: Authentication Implementation (Week 2)

**Goals:**
- Implement login functionality
- Secure token storage
- Auto-login on app start

**Tasks:**
1. ✅ Create API service
2. ✅ Create storage service
3. ✅ Create auth service
4. ✅ Create auth provider
5. ✅ Build login screen UI
6. ✅ Implement login functionality
7. ✅ Implement secure token storage
8. ✅ Implement auto-login check
9. ✅ Handle login errors
10. ✅ Navigate based on auth state

**Deliverables:**
- Working login screen
- JWT authentication functional
- Token stored securely
- Auto-login on app restart
- Error handling

**Success Criteria:**
- User can login with same credentials as web
- Token stored securely in Keychain/Keystore
- Auto-login works (token persists)
- Invalid credentials show error
- Login redirects to home screen

---

### Phase 4: Home & Profile Screens (Week 2-3)

**Goals:**
- Build home screen
- Build profile screen
- Implement profile features

**Tasks:**
1. ✅ Build home screen UI
2. ✅ Fetch and display user data on home
3. ✅ Build profile screen UI
4. ✅ Create driver profile API endpoint (if not exists)
5. ✅ Fetch and display profile data
6. ✅ Build change password screen
7. ✅ Implement change password functionality
8. ✅ Add logout functionality
9. ✅ Navigation between screens
10. ✅ Loading states and error handling

**Deliverables:**
- Home screen with user greeting
- Profile screen with user info
- Change password functionality
- Logout functionality
- Complete navigation flow

**Success Criteria:**
- Home screen displays user name
- Profile shows correct user information
- Change password works
- Logout clears token and redirects to login
- Navigation flows smoothly

---

### Phase 5: Testing & Refinement (Week 3)

**Goals:**
- Test all features
- Fix bugs
- Polish UI

**Tasks:**
1. ✅ Test login flow (success, error cases)
2. ✅ Test auto-login
3. ✅ Test profile display
4. ✅ Test change password
5. ✅ Test logout
6. ✅ Test token expiration handling
7. ✅ UI/UX improvements
8. ✅ Error message improvements
9. ✅ Loading state improvements
10. ✅ Code cleanup

**Deliverables:**
- Tested application
- Bug fixes
- Polished UI
- Error handling improvements

**Success Criteria:**
- All features work correctly
- No crashes or critical bugs
- Good user experience
- Error messages are clear
- App handles edge cases (no internet, expired token, etc.)

---

## 🔐 Authentication Flow

### Login Flow

```
1. User opens app
   ↓
2. Check if token exists (auto-login)
   ├─ Yes → Validate token → Load user → Show home
   └─ No → Show login screen
   ↓
3. User enters email/password
   ↓
4. App calls POST /api/auth/login-mobile
   ↓
5. Backend validates credentials
   ├─ Valid → Returns JWT token + user data
   └─ Invalid → Returns 401 error
   ↓
6. App stores token securely
   ↓
7. App stores user data in state
   ↓
8. Navigate to home screen
```

### API Request Flow

```
1. App makes API request (e.g., GET /api/driver/profile)
   ↓
2. Auth service retrieves stored token
   ↓
3. API service adds Authorization: Bearer {token} header
   ↓
4. Backend receives request
   ↓
5. JWT middleware validates token
   ├─ Valid → Load user → Execute endpoint
   └─ Invalid → Return 401
   ↓
6. App receives response
   ├─ Success → Update UI
   └─ 401 → Clear token → Redirect to login
```

### Token Storage

**Where:** Secure storage (iOS Keychain / Android Keystore)  
**How:** flutter_secure_storage package  
**Why:** OS-level encryption protects tokens  
**What:** JWT token string

---

## 🔒 Security Considerations

### Token Security

**Why Secure Storage:**
- Tokens in plain text can be stolen
- Secure storage uses OS encryption (Keychain/Keystore)
- Protects against malware reading tokens

**Implementation:**
- Use flutter_secure_storage (not shared_preferences)
- Never log tokens in console
- Clear tokens on logout

### API Security

**HTTPS Only:**
- All API calls must use HTTPS in production
- Prevents token interception
- Reject HTTP connections

**Token Validation:**
- Backend validates token on every request
- Checks user still active
- Rejects expired tokens

**Error Handling:**
- Don't expose sensitive info in errors
- Generic error messages
- Log errors server-side only

### App Security

**Code Obfuscation:**
- Flutter builds are compiled (not plain source)
- Additional obfuscation available for release builds
- Protects API endpoints and logic

**Certificate Pinning:**
- Validate server certificate (prevents MITM attacks)
- Future enhancement (not Phase 1)

---

## 📦 Dependencies

### Core Dependencies

**HTTP Client:**
- `dio` - Recommended (better error handling, interceptors)
- Alternative: `http` - Simpler but less features

**Secure Storage:**
- `flutter_secure_storage` - Store JWT tokens securely
- Uses Keychain (iOS) and Keystore (Android)

**State Management:**
- `provider` - Simple, recommended for small apps
- Alternative: `riverpod` - More powerful, better for complex state

**Navigation:**
- `go_router` - Modern, declarative routing
- Alternative: `flutter_riverpod` (if using Riverpod)

**HTTP:**
- `dio` package handles all HTTP requests

### Development Dependencies

**Code Quality:**
- Built-in `dart format` - Code formatting
- Built-in linting rules

**JSON Serialization:**
- `json_annotation` + `json_serializable` - Auto-generate JSON models
- Or manual JSON parsing (simpler for Phase 1)

---

## 🧪 Testing Strategy

### Unit Testing
- Test auth service logic
- Test API service
- Test storage service
- Test validators

### Widget Testing
- Test login screen UI
- Test profile screen UI
- Test form validation

### Integration Testing
- Test login flow end-to-end
- Test API calls with mock server
- Test token storage/retrieval

### Manual Testing
- Test on iOS device/simulator
- Test on Android device/emulator
- Test offline scenarios
- Test token expiration

---

## 📊 Success Metrics

### Technical
- ✅ Login success rate > 95%
- ✅ API response time < 2 seconds
- ✅ App size < 50MB
- ✅ No crashes on authentication

### User Experience
- ✅ Login time < 5 seconds
- ✅ Auto-login works reliably
- ✅ Clear error messages
- ✅ Smooth navigation

---

## 📝 Implementation Checklist

### Backend
- [ ] Install JWT dependencies
- [ ] Add JWT environment variables
- [ ] Create JWT service
- [ ] Create mobile login endpoint
- [ ] Create JWT middleware
- [ ] Create universal auth middleware
- [ ] Create driver profile endpoint
- [ ] Test endpoints with Postman

### Flutter App
- [ ] Initialize Flutter project
- [ ] Install dependencies
- [ ] Setup project structure
- [ ] Create API service
- [ ] Create storage service
- [ ] Create auth service
- [ ] Create auth provider
- [ ] Build login screen
- [ ] Implement login flow
- [ ] Build home screen
- [ ] Build profile screen
- [ ] Implement change password
- [ ] Test all features
- [ ] Polish UI/UX

---

## 🔄 Next Steps (Future Phases)

### Phase 2: Trip Management
- View assigned trips
- Update trip status
- Trip details screen

### Phase 3: Location Capture
- GPS permission
- Location capture at pickup/delivery
- Location history

### Phase 4: Photo Upload
- Camera integration
- Photo capture
- Photo upload to backend

### Phase 5: Offline Support
- Offline data storage
- Sync queue
- Conflict resolution

---

## 📋 Notes

- **Backend Compatibility:** All backend changes are backward compatible with web app
- **Same Users:** Flutter app uses same PostgreSQL user database
- **Security First:** All security measures from web app apply to mobile
- **Minimal Features:** Phase 1 focuses on authentication and basic profile only
- **Future Ready:** Structure supports easy addition of trip features later

---

**Document Status:** Planning Complete - Ready for Implementation  
**Next Step:** Begin Phase 1 - Backend JWT Setup

