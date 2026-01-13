# Postman API Testing Guide

Complete guide for testing the Logistics Webflow API with Postman for both **ADMIN** and **DRIVER** roles.

---

## 📋 Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Base Configuration](#base-configuration)
3. [Authentication Flow](#authentication-flow)
4. [Admin Endpoints](#admin-endpoints)
5. [Driver Endpoints](#driver-endpoints)
6. [Test Scenarios](#test-scenarios)
7. [Common Errors & Solutions](#common-errors--solutions)

---

## 🔧 Setup Instructions

### Prerequisites
- Postman installed (Desktop or Web)
- Server running on `http://localhost:5001` (or your configured PORT)

### Default Credentials

**Admin User:**
- Email: `admin@logistics.com`
- Password: `admin123`

**Driver User:**
- Create via Admin → Users Management (or use seeded driver if exists)

---

## ⚙️ Base Configuration

### Create Environment Variables

In Postman, create an environment (or use the default) with:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `baseUrl` | `http://localhost:5001` | `http://localhost:5001` |
| `sessionCookie` | (empty) | (auto-filled after login) |

### Enable Cookie Management

1. Go to Postman Settings (⚙️) → General
2. Enable **"Automatically follow redirects"**
3. Enable **"Send cookies"** (cookies are managed automatically in Postman)

---

## 🔐 Authentication Flow

**All endpoints (except login) require authentication via session cookies.**

### Step 1: Login

**Endpoint:** `POST {{baseUrl}}/api/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "admin@logistics.com",
  "password": "admin123"
}
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "username": "admin@logistics.com",
  "fullName": "System Admin",
  "role": "ADMIN",
  "isActive": true,
  "mustChangePassword": false,
  "lastLoginAt": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Important:** After successful login, Postman automatically captures the session cookie (`connect.sid`). All subsequent requests will use this cookie for authentication.

---

### Step 2: Verify Session (Get Current User)

**Endpoint:** `GET {{baseUrl}}/api/user`

**Headers:** None required (cookie is sent automatically)

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "username": "admin@logistics.com",
  "fullName": "System Admin",
  "role": "ADMIN",
  "isActive": true,
  "mustChangePassword": false,
  "lastLoginAt": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Step 3: Logout

**Endpoint:** `POST {{baseUrl}}/api/logout`

**Headers:** None required (cookie is sent automatically)

**Expected Response (200 OK):** Empty body

**Note:** After logout, the session cookie is invalidated.

---

## 👨‍💼 Admin Endpoints

**All admin endpoints require `role: "ADMIN"` in the authenticated user.**

### 1. List All Users

**Endpoint:** `GET {{baseUrl}}/api/admin/users`

**Headers:** None required (cookie sent automatically)

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "username": "admin@logistics.com",
    "fullName": "System Admin",
    "role": "ADMIN",
    "isActive": true,
    "mustChangePassword": false,
    "lastLoginAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "username": "driver1@test.com",
    "fullName": "Driver One",
    "role": "DRIVER",
    "isActive": true,
    "mustChangePassword": true,
    "lastLoginAt": null,
    "createdAt": "2024-01-01T01:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - User is not ADMIN

---

### 2. Create New User

**Endpoint:** `POST {{baseUrl}}/api/admin/users`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "driver2@test.com",
  "fullName": "Driver Two",
  "role": "DRIVER",
  "isActive": true
}
```

**Fields:**
- `email` (required): Valid email address
- `fullName` (required): Minimum 2 characters
- `role` (optional): `"ADMIN"` or `"DRIVER"` (default: `"DRIVER"`)
- `isActive` (optional): `true` or `false` (default: `true`)

**Response (201 Created):**
```json
{
  "id": "uuid-here",
  "username": "driver2@test.com",
  "fullName": "Driver Two",
  "role": "DRIVER",
  "isActive": true,
  "mustChangePassword": true,
  "lastLoginAt": null,
  "createdAt": "2024-01-01T02:00:00.000Z",
  "tempPassword": "Abc123XyZ789"
}
```

**⚠️ Important:** Save the `tempPassword` immediately - it's only returned once!

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - User is not ADMIN
- `409 Conflict` - Email already exists

---

### 3. Update User

**Endpoint:** `PATCH {{baseUrl}}/api/admin/users/:id`

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `:id` - User UUID (replace in URL)

**Body (raw JSON) - At least one field required:**
```json
{
  "fullName": "Updated Driver Name",
  "role": "DRIVER",
  "isActive": false
}
```

**Fields (all optional, but at least one required):**
- `fullName`: Minimum 2 characters
- `role`: `"ADMIN"` or `"DRIVER"`
- `isActive`: `true` or `false`

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "username": "driver2@test.com",
  "fullName": "Updated Driver Name",
  "role": "DRIVER",
  "isActive": false,
  "mustChangePassword": true,
  "lastLoginAt": null,
  "createdAt": "2024-01-01T02:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or trying to deactivate yourself
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - User is not ADMIN
- `404 Not Found` - User ID doesn't exist

**Special Rule:** Admin cannot deactivate themselves (`isActive: false` on own account returns 400).

---

### 4. Reset User Password

**Endpoint:** `POST {{baseUrl}}/api/admin/users/:id/reset-password`

**Headers:** None required (cookie sent automatically)

**URL Parameters:**
- `:id` - User UUID (replace in URL)

**Body:** None

**Response (200 OK):**
```json
{
  "userId": "uuid-here",
  "tempPassword": "XyZ987Abc123"
}
```

**⚠️ Important:** Save the `tempPassword` immediately - it's only returned once!

**Error Responses:**
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - User is not ADMIN
- `404 Not Found` - User ID doesn't exist

---

## 🚚 Driver Endpoints

**Drivers have limited access - only authentication endpoints.**

### Available Endpoints for Drivers:

1. ✅ `POST /api/login` - Login
2. ✅ `POST /api/logout` - Logout
3. ✅ `GET /api/user` - Get current user info
4. ✅ `POST /api/change-password` - Change own password

### Driver Cannot Access:

- ❌ `GET /api/admin/users` - Returns 403 Forbidden
- ❌ `POST /api/admin/users` - Returns 403 Forbidden
- ❌ `PATCH /api/admin/users/:id` - Returns 403 Forbidden
- ❌ `POST /api/admin/users/:id/reset-password` - Returns 403 Forbidden

---

### Change Password (Driver & Admin)

**Endpoint:** `POST {{baseUrl}}/api/change-password`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "currentPassword": "current-password-here",
  "newPassword": "newPassword123"
}
```

**Fields:**
- `currentPassword` (required): Current password
- `newPassword` (required): Minimum 8 characters

**Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Incorrect current password or validation error
- `401 Unauthorized` - Not logged in

---

## 🧪 Test Scenarios

### Scenario 1: Admin Full Workflow

1. **Login as Admin**
   ```
   POST /api/login
   Body: { "username": "admin@logistics.com", "password": "admin123" }
   ```

2. **Get Current User**
   ```
   GET /api/user
   ```

3. **List All Users**
   ```
   GET /api/admin/users
   ```

4. **Create New Driver**
   ```
   POST /api/admin/users
   Body: { "email": "driver3@test.com", "fullName": "Driver Three", "role": "DRIVER" }
   ```
   - **Save the `tempPassword` from response!**

5. **Login as New Driver** (in new Postman tab/environment)
   ```
   POST /api/login
   Body: { "username": "driver3@test.com", "password": "<tempPassword>" }
   ```

6. **Driver Changes Password**
   ```
   POST /api/change-password
   Body: { "currentPassword": "<tempPassword>", "newPassword": "driverPassword123" }
   ```

7. **Admin Updates Driver**
   ```
   PATCH /api/admin/users/:driverId
   Body: { "fullName": "Updated Driver Three" }
   ```

8. **Admin Resets Driver Password**
   ```
   POST /api/admin/users/:driverId/reset-password
   ```
   - **Save the new `tempPassword`!**

9. **Logout**
   ```
   POST /api/logout
   ```

---

### Scenario 2: Driver Permission Test

1. **Login as Driver**
   ```
   POST /api/login
   Body: { "username": "driver1@test.com", "password": "driverPassword123" }
   ```

2. **Try to Access Admin Endpoint** (Should Fail)
   ```
   GET /api/admin/users
   Expected: 403 Forbidden
   ```

3. **Access Own Info** (Should Succeed)
   ```
   GET /api/user
   Expected: 200 OK
   ```

4. **Change Own Password** (Should Succeed)
   ```
   POST /api/change-password
   Body: { "currentPassword": "driverPassword123", "newPassword": "newDriverPass123" }
   Expected: 200 OK
   ```

---

### Scenario 3: Security Testing

1. **Rate Limiting Test**
   - Send 11+ login requests with wrong password
   - 11th request should return `429 Too Many Requests`

2. **Inactive User Test**
   - Admin deactivates a user: `PATCH /api/admin/users/:id` with `"isActive": false`
   - Try to login with that user: Should fail with `401 Invalid credentials`

3. **Self-Deactivation Prevention**
   - Admin tries to deactivate themselves: `PATCH /api/admin/users/:ownId` with `"isActive": false`
   - Expected: `400 Bad Request` with message about not being able to deactivate yourself

---

## ❌ Common Errors & Solutions

### 401 Unauthorized
**Cause:** Not logged in or session expired

**Solution:**
1. Login again: `POST /api/login`
2. Check that cookies are enabled in Postman
3. Verify you're using the same Postman environment

---

### 403 Forbidden
**Cause:** User doesn't have required role (e.g., DRIVER trying to access admin endpoints)

**Solution:**
1. Login with an ADMIN account for admin endpoints
2. Check user role: `GET /api/user`

---

### 400 Bad Request
**Cause:** Validation error or business rule violation

**Solution:**
1. Check request body format (must be valid JSON)
2. Verify required fields are present
3. Check field constraints (min length, email format, etc.)
4. For self-deactivation: Use a different user ID

---

### 404 Not Found
**Cause:** User ID doesn't exist in database

**Solution:**
1. List users first: `GET /api/admin/users`
2. Copy the correct UUID from the response
3. Use that UUID in the request URL

---

### 409 Conflict
**Cause:** Email already exists when creating a user

**Solution:**
1. Use a different email address
2. Or update the existing user instead of creating a new one

---

### 429 Too Many Requests
**Cause:** Rate limiting triggered (10 login attempts per 15 minutes)

**Solution:**
1. Wait 15 minutes
2. Or test from a different IP address

---

### Cookies Not Working
**Cause:** Postman cookie management disabled or environment issue

**Solution:**
1. Postman Settings → General → Enable "Send cookies"
2. After login, check Cookies tab (🍪 icon) in Postman
3. Verify `connect.sid` cookie exists
4. Try using a new Postman request (don't reuse old requests)

---

## 📝 Postman Collection Structure

**Recommended folder structure:**

```
Logistics API
├── Authentication
│   ├── Login (Admin)
│   ├── Login (Driver)
│   ├── Get Current User
│   ├── Logout
│   └── Change Password
├── Admin - User Management
│   ├── List All Users
│   ├── Create User
│   ├── Update User
│   └── Reset Password
└── Testing Scenarios
    ├── Admin Full Workflow
    ├── Driver Permission Test
    └── Security Tests
```

---

## 🔒 Security Notes

1. **Session-Based Authentication:** Uses Express sessions with cookies
2. **Password Hashing:** Passwords are never returned (bcrypt hashed)
3. **Rate Limiting:** Login endpoint limited to 10 attempts per 15 minutes
4. **RBAC:** Role-based access control enforced on admin endpoints
5. **Safe User Objects:** API responses never include password hashes

---

## 📞 Quick Reference

| Endpoint | Method | Auth Required | Role Required |
|----------|--------|---------------|---------------|
| `/api/login` | POST | ❌ | - |
| `/api/logout` | POST | ✅ | - |
| `/api/user` | GET | ✅ | - |
| `/api/change-password` | POST | ✅ | - |
| `/api/admin/users` | GET | ✅ | ADMIN |
| `/api/admin/users` | POST | ✅ | ADMIN |
| `/api/admin/users/:id` | PATCH | ✅ | ADMIN |
| `/api/admin/users/:id/reset-password` | POST | ✅ | ADMIN |

---

**Happy Testing! 🚀**

For issues or questions, check server logs or verify your server is running on the correct port.

