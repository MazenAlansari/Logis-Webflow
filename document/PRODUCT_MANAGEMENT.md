# Product Management Document
## Logistics Webflow - Fleet Management Platform

**Document Version:** 1.1  
**Last Updated:** January 2025  
**Product Manager:** [To be assigned]  
**Status:** Phase 1 - Foundation Complete (Enhanced Security & Pagination)

---

## 📋 Table of Contents

1. [Product Overview](#product-overview)
2. [Product Vision & Goals](#product-vision--goals)
3. [Target Users & Personas](#target-users--personas)
4. [Features & Functionality](#features--functionality)
5. [User Stories & Requirements](#user-stories--requirements)
6. [User Flows](#user-flows)
7. [Technical Architecture](#technical-architecture)
8. [Security & Compliance](#security--compliance)
9. [API Documentation](#api-documentation)
10. [Future Roadmap](#future-roadmap)
11. [Success Metrics & KPIs](#success-metrics--kpis)
12. [Business Context](#business-context)

---

## 🎯 Product Overview

### Product Name
**Logistics Webflow** - Fleet Management & Driver Operations Platform

### Product Description
Logistics Webflow is an internal web-based application designed for a transportation and logistics company to manage their fleet operations, drivers, and daily trip journeys. The platform provides secure, role-based access control for administrators and drivers, enabling efficient operations management and driver activity tracking within the organization.

### Product Type
- **Category:** Internal Business Application / Fleet Management System
- **Platform:** Web Application (Desktop & Mobile Responsive)
- **Deployment Model:** Internal deployment (self-hosted or private cloud)
- **Target Users:** Single organization's employees (admins and drivers)

### Current Phase
**Phase 1: Foundation & Authentication** ✅ **COMPLETE**

Focus areas completed:
- Secure authentication system
- Role-based access control (RBAC)
- User management infrastructure
- Production-ready security practices

---

## 🎯 Product Vision & Goals

### Vision Statement
To provide a comprehensive, secure, and efficient internal platform for managing fleet operations, driver activities, and daily trip journeys, enabling the organization to optimize operations and maintain complete control over logistics management.

### Primary Goals

#### Phase 1 Goals (Achieved)
- ✅ Establish secure authentication foundation
- ✅ Implement role-based access control
- ✅ Create user management system for administrators
- ✅ Implement email verification system
- ✅ Add pagination system for scalable list management
- ✅ Integrate email notifications (Novu)
- ✅ Ensure production-ready security standards
- ✅ Build extensible architecture for future features

#### Long-term Goals (Future Phases)
- 📋 Enable comprehensive trip and journey management
- 📋 Implement real-time tracking capabilities
- 📋 Provide analytics and reporting dashboard
- 📋 Enable mobile app for drivers
- 📋 Support fleet expansion and scaling

### Success Criteria
- Secure system with zero security breaches
- 99.9% uptime for production deployments
- User satisfaction score > 4.5/5.0
- Scalable architecture supporting 1000+ concurrent users
- Compliance with data protection regulations

---

## 👥 Target Users & Personas

### User Roles

#### 1. Administrator (Admin)
**Role:** System Administrator / Fleet Manager  
**Responsibilities:**
- Manage user accounts (create, update, deactivate)
- Monitor system access and security
- Oversee driver operations
- Configure system settings

**Needs:**
- Complete control over user management
- Security and audit capabilities
- Easy-to-use administrative interface
- Comprehensive user activity monitoring

**Technical Proficiency:** High to Medium

---

#### 2. Driver
**Role:** Fleet Driver / Operator  
**Responsibilities:**
- Access the system securely
- Record daily trips and journeys (future feature)
- Update personal profile information
- View assigned tasks and routes (future feature)

**Needs:**
- Simple, intuitive interface
- Mobile-friendly access
- Quick login and navigation
- Clear task instructions

**Technical Proficiency:** Low to Medium

---

## ✨ Features & Functionality

### Phase 1 Features (Implemented)

#### Authentication & Security
- ✅ Secure login with email and password
- ✅ Session-based authentication (HttpOnly cookies)
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control (ADMIN/DRIVER)
- ✅ Password change enforcement for new users
- ✅ Email verification system (token-based, 24-hour expiration)
- ✅ Email verification enforcement (users must verify before accessing system)
- ✅ Email change verification (admin email changes require re-verification)
- ✅ Verification token rate limiting (max 3 resends per hour)
- ✅ Password trimming on login (prevents accidental space characters)
- ✅ Rate limiting on login endpoints (10 attempts per 15 minutes)
- ✅ Security headers (Helmet.js)
- ✅ Inactive user prevention

#### User Management (Admin Only)
- ✅ Create new users (ADMIN or DRIVER roles)
- ✅ List all system users with pagination (5, 10, 15, 20 items per page)
- ✅ Update user information (name, role, active status, email)
- ✅ Change user email addresses
- ✅ Reset user passwords (with temporary password generation)
- ✅ Send welcome emails via Novu integration
- ✅ Activate/Deactivate users
- ✅ Prevent self-deactivation (admin cannot deactivate themselves)
- ✅ Prevent self-email-change (admin cannot change own email)

#### User Profile
- ✅ View profile information
- ✅ Change password
- ✅ View role and account status
- ✅ View email verification status
- ✅ View last login information
- ✅ Verify email address (with token from email)
- ✅ Resend verification email (rate limited)

#### Navigation & UI
- ✅ Role-based navigation menus
- ✅ Admin dashboard
- ✅ Driver dashboard
- ✅ Responsive design
- ✅ Modern, clean UI (Tailwind CSS + shadcn/ui)
- ✅ Pagination controls with configurable page size
- ✅ Client-side search and filtering
- ✅ Email verification page with auto-verification

---

### Future Features (Roadmap)

#### Phase 2: Trip Management
- 📋 Create and manage trips
- 📋 Assign trips to drivers
- 📋 Track trip status
- 📋 Trip history and reports

#### Phase 3: Vehicle Management
- 📋 Vehicle registration and management
- 📋 Maintenance scheduling
- 📋 Vehicle tracking integration

#### Phase 4: Analytics & Reporting
- 📋 Dashboard with key metrics
- 📋 Driver performance reports
- 📋 Trip analytics
- 📋 Export capabilities

#### Phase 5: Mobile Application
- 📋 Native mobile app for drivers
- 📋 Offline capability
- 📋 GPS tracking integration
- 📋 Push notifications

---

## 📝 User Stories & Requirements

### Authentication Stories

#### US-1: User Login
**As a** user (Admin or Driver)  
**I want to** log in to the system securely  
**So that** I can access my assigned features and data

**Acceptance Criteria:**
- User can log in with email and password
- System validates credentials securely
- Session is established with secure cookies
- User is redirected to appropriate dashboard based on role
- Failed login attempts are rate-limited
- Inactive users cannot log in

**Priority:** P0 (Critical)

---

#### US-2: Password Change Enforcement
**As a** new user created by an admin  
**I want to** be required to change my password on first login  
**So that** my account is secured with my own password

**Acceptance Criteria:**
- New users have `mustChangePassword = true`
- User is redirected to password change page after login
- User cannot access other features until password is changed
- Password change updates the flag to false

**Priority:** P0 (Critical)

---

#### US-3: Change Password
**As an** authenticated user  
**I want to** change my password  
**So that** I can maintain account security

**Acceptance Criteria:**
- User can change password from profile or dedicated page
- Current password must be verified
- New password must meet security requirements (min 8 characters)
- Password is securely hashed before storage

**Priority:** P1 (High)

---

#### US-3A: Email Verification
**As a** new user or user with changed email  
**I want to** verify my email address  
**So that** I can access the system and secure my account

**Acceptance Criteria:**
- User receives verification email with secure token
- Verification token expires after 24 hours
- User can verify via email link or manual token entry
- User cannot access system features until email is verified
- Verification can be resent (max 3 times per hour)
- Token is single-use (invalidated after verification)

**Priority:** P0 (Critical)

---

#### US-3B: Resend Verification Email
**As a** user with unverified email  
**I want to** resend the verification email  
**So that** I can verify my email if the original email was missed

**Acceptance Criteria:**
- User can request verification email resend
- System enforces rate limit (max 3 per hour per user)
- New token is generated with 24-hour expiration
- Old tokens remain valid until expiration

**Priority:** P1 (High)

---

### Admin User Management Stories

#### US-4: Create User
**As an** administrator  
**I want to** create new user accounts  
**So that** drivers and other admins can access the system

**Acceptance Criteria:**
- Admin can create users with email, name, and role
- System generates secure temporary password
- Temporary password is shown once (not stored)
- New user must change password on first login
- Email must be unique

**Priority:** P0 (Critical)

---

#### US-5: List Users
**As an** administrator  
**I want to** view all system users  
**So that** I can manage user accounts effectively

**Acceptance Criteria:**
- Admin can see list of all users
- List shows user details (name, email, role, status)
- List is sorted by creation date (newest first)
- Password hashes are never displayed

**Priority:** P0 (Critical)

---

#### US-6: Update User
**As an** administrator  
**I want to** update user information  
**So that** I can maintain accurate user data

**Acceptance Criteria:**
- Admin can update user name, role, active status, and email
- Admin cannot deactivate themselves
- Admin cannot change their own email address
- Email changes require user to re-verify email
- Changes are saved immediately
- User receives updated information on next login

**Priority:** P1 (High)

---

#### US-7A: Send Welcome Email
**As an** administrator  
**I want to** send welcome emails to new users  
**So that** users receive credentials and setup instructions

**Acceptance Criteria:**
- Admin can send welcome email after user creation
- Email includes temporary password and login instructions
- Email is sent via Novu integration
- Sending email is non-blocking (user creation succeeds even if email fails)

**Priority:** P2 (Medium)

---

#### US-7: Reset User Password
**As an** administrator  
**I want to** reset a user's password  
**So that** I can help users who forgot their passwords

**Acceptance Criteria:**
- Admin can reset any user's password
- System generates new temporary password
- Temporary password is shown once
- User must change password on next login

**Priority:** P1 (High)

---

### Authorization Stories

#### US-8: Role-Based Access Control
**As a** system  
**I want to** enforce role-based access to features  
**So that** users only access features appropriate for their role

**Acceptance Criteria:**
- Admin routes are only accessible to ADMIN users
- Driver routes are only accessible to DRIVER users
- Unauthorized access attempts are blocked (403)
- Users are redirected to appropriate dashboard

**Priority:** P0 (Critical)

---

## 🔄 User Flows

### Flow 1: Admin Login & User Management

```
1. Admin navigates to /login
2. Enters credentials (admin@logistics.com / password)
3. System authenticates and creates session
4. Admin redirected to /admin/home
5. Admin clicks "Users" in navigation
6. Admin views user list at /admin/users
7. Admin clicks "Create User"
8. Admin fills form (email, name, role)
9. System creates user and shows temporary password
10. Admin shares temporary password with new user
```

### Flow 2: Driver First Login & Email Verification

```
1. Driver receives credentials from admin
2. Driver navigates to /login
3. Driver enters email and temporary password
4. System authenticates and detects mustChangePassword = true
5. Driver redirected to /change-password
6. Driver enters new password (twice for confirmation)
7. System validates and updates password
8. System sets mustChangePassword = false
9. System checks emailVerified status
10. If emailVerified = false:
    a. Driver redirected to /verify-email
    b. Driver receives verification email automatically
    c. Driver clicks link in email or enters token manually
    d. System verifies token and sets emailVerified = true
11. Driver redirected to /driver/home
```

### Flow 3: Driver Daily Access

```
1. Driver navigates to /login
2. Driver enters credentials
3. System authenticates
4. Driver redirected to /driver/home
5. Driver can access:
   - Dashboard
   - Profile
   - Change Password
```

### Flow 4: Admin Password Reset for User

```
1. Admin logs in
2. Admin navigates to /admin/users
3. Admin finds user in list
4. Admin clicks "Reset Password" action
5. System generates new temporary password
6. System displays temporary password (one-time)
7. Admin shares password with user
8. User logs in with temporary password
9. User is forced to change password
```

### Flow 5: Admin Email Change for User

```
1. Admin logs in
2. Admin navigates to /admin/users
3. Admin finds user and clicks "Change Email"
4. Admin enters new email address
5. System validates email uniqueness
6. System updates email and sets emailVerified = false
7. System generates verification token
8. Verification email sent to new address
9. User receives verification email
10. User verifies email via link/token
11. System sets emailVerified = true
12. User can now access system with new email
```

### Flow 6: User Resend Verification Email

```
1. User logs in but has unverified email
2. User redirected to /verify-email page
3. User clicks "Resend Verification Email"
4. System checks rate limit (max 3 per hour)
5. If within limit:
   a. System generates new token (24-hour expiration)
   b. System sends verification email
   c. User receives new email with token
6. If rate limit exceeded:
   a. System shows error message
   b. User must wait before retrying
```

---

## 🏗️ Technical Architecture

### Technology Stack

#### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI based)
- **State Management:** TanStack Query (React Query)
- **Routing:** Wouter
- **HTTP Client:** Fetch API with custom queryClient wrapper

#### Backend
- **Framework:** Express.js with TypeScript
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Authentication:** Passport.js (Local Strategy)
- **Session Management:** express-session with memory store
- **Security:** Helmet.js, bcrypt, rate limiting

#### Infrastructure
- **Database:** PostgreSQL 16+
- **Runtime:** Node.js 20+
- **Package Manager:** npm

### Architecture Patterns

#### Backend Architecture (MVC Pattern)
```
Routes → Controllers → Services → Storage (Repository)
```

**Layers:**
- **Routes:** HTTP route definitions
- **Controllers:** Request/response handling
- **Services:** Business logic
- **Storage/Repository:** Data access layer

#### Frontend Architecture
```
Pages → Components → Hooks → API Client → Backend
```

**Layers:**
- **Pages:** Route components
- **Components:** Reusable UI components
- **Hooks:** Custom React hooks (auth, data fetching)
- **API Client:** HTTP request handlers

### Database Schema

#### Users Table
```typescript
{
  id: UUID (Primary Key)
  username: string (Email, Unique)
  password: string (Hashed with bcrypt)
  fullName: string
  role: enum ['ADMIN', 'DRIVER']
  isActive: boolean (default: true)
  mustChangePassword: boolean (default: true)
  emailVerified: boolean (default: false)
  lastLoginAt: timestamp (nullable)
  createdAt: timestamp
}
```

#### Email Verification Tokens Table
```typescript
{
  id: UUID (Primary Key)
  userId: UUID (Foreign Key -> users.id, CASCADE delete)
  token: string (Unique, secure random token)
  expiresAt: timestamp (24 hours from creation)
  createdAt: timestamp
  verifiedAt: timestamp (nullable, set when token is used)
}
```

---

## 🔒 Security & Compliance

### Security Features

#### Authentication Security
- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ Session-based authentication (no JWT in localStorage)
- ✅ HttpOnly cookies (prevents XSS access)
- ✅ Secure cookies in production (HTTPS only)
- ✅ SameSite cookie policy (CSRF protection)
- ✅ Session expiration (1 day default)
- ✅ Email verification system (token-based)
- ✅ Verification token expiration (24 hours)
- ✅ Verification token single-use enforcement
- ✅ Password trimming on frontend (prevents copy-paste issues)
- ✅ Email change verification (prevents unauthorized email changes)

#### Authorization Security
- ✅ Role-based access control (RBAC)
- ✅ Route-level authorization middleware
- ✅ API endpoint protection
- ✅ Self-deactivation prevention

#### Input Security
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Drizzle ORM parameterized queries)
- ✅ XSS prevention (React automatic escaping)
- ✅ CSRF protection (SameSite cookies)

#### Rate Limiting
- ✅ Login endpoint rate limiting (10 attempts per 15 minutes)
- ✅ Prevents brute force attacks
- ✅ Email verification resend limiting (max 3 per hour per user)
- ✅ Prevents verification email abuse

#### Security Headers
- ✅ Helmet.js for security headers
- ✅ Content Security Policy (CSP) in production
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options

#### Data Protection
- ✅ Password hashes never returned in API responses
- ✅ Temporary passwords never stored in database
- ✅ Verification tokens stored securely with expiration
- ✅ Safe user objects (whitelist approach)
- ✅ No sensitive data in logs
- ✅ Generic error messages (prevents user enumeration)
- ✅ Email verification tokens cleared after use

### Compliance Considerations
- **Data Privacy:** User data is stored securely
- **Access Control:** Strict role-based access
- **Email Verification:** Enforced email verification for account access
- **Audit Trail:** Session management and login tracking
- **Password Policy:** Enforced password changes for new users
- **Token Security:** Time-limited verification tokens with single-use enforcement
- **Rate Limiting:** Protection against abuse and brute force attacks

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000 (Development)
https://yourdomain.com (Production)
```

### Authentication
All endpoints (except login) require authentication via session cookie.

### Endpoints

#### Authentication Endpoints

**POST /api/login**
- **Description:** Authenticate user and create session
- **Auth Required:** No
- **Rate Limited:** Yes (10/15min)
- **Request Body:**
  ```json
  {
    "username": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200):**
  ```json
  {
    "id": "uuid",
    "username": "user@example.com",
    "fullName": "User Name",
    "role": "ADMIN",
    "isActive": true,
    "mustChangePassword": false,
    "lastLoginAt": null,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
  ```

**POST /api/logout**
- **Description:** Logout current user
- **Auth Required:** Yes
- **Response (200):** Empty body

**GET /api/user**
- **Description:** Get current authenticated user
- **Auth Required:** Yes
- **Response (200):** User object (safe fields only)

**POST /api/change-password**
- **Description:** Change current user's password
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "currentPassword": "oldPassword",
    "newPassword": "newPassword123"
  }
  ```

**POST /api/auth/verify-email**
- **Description:** Verify email address using token
- **Auth Required:** No (token-based verification)
- **Request Body:**
  ```json
  {
    "token": "verification-token-string"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Email verified successfully"
  }
  ```

**POST /api/auth/resend-verification-email**
- **Description:** Resend verification email (rate limited)
- **Auth Required:** Yes
- **Rate Limited:** Yes (max 3 per hour)
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Verification email sent"
  }
  ```

#### Admin User Management Endpoints

**GET /api/admin/users**
- **Description:** List all users
- **Auth Required:** Yes (ADMIN only)
- **Response (200):** Array of user objects

**GET /api/admin/users/paginated**
- **Description:** List users with pagination
- **Auth Required:** Yes (ADMIN only)
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `sortBy` (string, optional, default: "createdAt")
  - `sortOrder` (string, "asc" | "desc", default: "desc")
- **Response (200):**
  ```json
  {
    "data": [/* array of user objects */],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 50,
      "totalPages": 10
    }
  }
  ```

**POST /api/admin/users**
- **Description:** Create new user
- **Auth Required:** Yes (ADMIN only)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "DRIVER",
    "isActive": true
  }
  ```
- **Response (201):** User object + `tempPassword` field

**PATCH /api/admin/users/:id**
- **Description:** Update user
- **Auth Required:** Yes (ADMIN only)
- **Request Body:** Partial user object (at least one field required)
  ```json
  {
    "fullName": "Updated Name",
    "role": "DRIVER",
    "isActive": true,
    "email": "newemail@example.com"
  }
  ```
- **Note:** Email changes trigger email verification requirement

**POST /api/admin/users/:id/reset-password**
- **Description:** Reset user password
- **Auth Required:** Yes (ADMIN only)
- **Response (200):** `{ userId, tempPassword }`

**POST /api/admin/notifications/send-welcome**
- **Description:** Send welcome email to user
- **Auth Required:** Yes (ADMIN only)
- **Request Body:**
  ```json
  {
    "userId": "uuid",
    "tempPassword": "temporary-password"
  }
  ```
- **Response (200):**
  ```json
  {
    "ok": true
  }
  ```

**POST /api/admin/users/:id/reset-password**
- **Description:** Reset user password
- **Auth Required:** Yes (ADMIN only)
- **Response (200):** `{ userId, tempPassword }`

### Error Responses

**401 Unauthorized**
```json
{
  "message": "Unauthorized"
}
```

**403 Forbidden**
```json
{
  "message": "Forbidden: Admin access required"
}
```

**400 Bad Request**
```json
{
  "message": "Validation error",
  "errors": [...]
}
```

**429 Too Many Requests**
```json
{
  "message": "Too many login attempts, please try again later"
}
```

### API Testing
See [POSTMAN_API_GUIDE.md](./POSTMAN_API_GUIDE.md) for complete API testing documentation and Postman collection.

---

## 🗺️ Future Roadmap

### Phase 2: Trip Management (Q2 2025)
**Goals:**
- Implement trip creation and management
- Driver trip assignment
- Trip status tracking
- Basic trip history

**Features:**
- Create/Edit/Delete trips
- Assign trips to drivers
- Trip status workflow (Pending → In Progress → Completed)
- Trip list and filtering
- Driver trip view

**Success Metrics:**
- 100% trip creation workflow completion
- < 2 second trip list load time
- 95% driver satisfaction with trip interface

---

### Phase 3: Vehicle Management (Q3 2025)
**Goals:**
- Vehicle registration and tracking
- Maintenance scheduling
- Vehicle-driver assignment

**Features:**
- Vehicle CRUD operations
- Vehicle status tracking
- Maintenance reminders
- Vehicle assignment to drivers
- Vehicle history

---

### Phase 4: Analytics & Reporting (Q4 2025)
**Goals:**
- Comprehensive dashboard
- Performance metrics
- Reporting capabilities

**Features:**
- Admin dashboard with KPIs
- Driver performance reports
- Trip analytics
- Export functionality (PDF, CSV)
- Custom date range filtering

---

### Phase 5: Mobile Application (2026)
**Goals:**
- Native mobile experience for drivers
- Offline capabilities
- Real-time tracking

**Features:**
- iOS and Android apps
- Offline trip recording
- GPS tracking integration
- Push notifications
- Photo capture for deliveries

---

## 📊 Success Metrics & KPIs

### Security Metrics
- **Zero security breaches** - Target: 100% achievement
- **Failed login attempts** - Monitor for anomalies
- **Password reset frequency** - Track user support needs
- **Email verification rate** - Percentage of users with verified emails
- **Verification email delivery rate** - Monitor email service reliability
- **Token expiration rate** - Track unverified accounts

### Performance Metrics
- **API response time** - Target: < 200ms (p95)
- **Page load time** - Target: < 2 seconds
- **Uptime** - Target: 99.9%

### User Engagement Metrics
- **Daily Active Users (DAU)** - Track adoption
- **Login frequency** - Monitor usage patterns
- **Feature adoption rate** - Track feature usage

### Business Metrics
- **User creation rate** - Admin activity
- **User activation rate** - Percentage of active users
- **Support ticket volume** - Track user issues

### User Satisfaction
- **User Satisfaction Score** - Target: > 4.5/5.0
- **Net Promoter Score (NPS)** - Target: > 50
- **Task completion rate** - Target: > 95%

---

## 💼 Business Context

### Business Context
This application is developed for internal use by a single transportation and logistics company to manage their fleet operations.

### Business Problem
The organization needs a secure, scalable internal platform to:
- Manage driver access and operations
- Track daily trips and journeys
- Maintain compliance and security standards
- Scale operations as the fleet grows
- Maintain complete control over data and operations

### Business Value
- **Security:** Enterprise-grade security protects internal operations
- **Efficiency:** Streamlined user management saves administrative time
- **Scalability:** Architecture supports fleet and driver growth
- **Control:** Complete internal control over data and operations
- **Compliance:** Built-in security practices aid regulatory compliance
- **Cost-Effectiveness:** Internal solution reduces external dependencies

### Key Benefits
- Modern, intuitive user interface for internal staff
- Production-ready security from day one
- Extensible architecture for rapid feature development
- Custom-built for the organization's specific needs
- Full data ownership and privacy

---

## 📚 Additional Resources

### Documentation
- [README.md](./README.md) - Setup and installation guide
- [POSTMAN_API_GUIDE.md](./POSTMAN_API_GUIDE.md) - API testing guide
- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) - Technical architecture details
- [QUICK_START.md](./QUICK_START.md) - Quick reference guide

### Repository
- **GitHub:** https://github.com/MazenAlansari/Logis-Webflow
- **Branch Strategy:** Main branch + feature branches

### Contact
- **Product Questions:** [To be assigned]
- **Technical Support:** [To be assigned]
- **Security Issues:** [To be assigned]

---

## 📝 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2025 | Initial | Created initial PM document |
| 1.1 | January 2025 | Update | Added email verification system, pagination, enhanced security features, Novu integration |

---

**Note:** This document is a living document and will be updated as the product evolves. All stakeholders should refer to this document for product decisions and planning.

