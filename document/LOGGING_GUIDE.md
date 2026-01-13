# Logging Guide - Backend vs Frontend

## 📊 Overview (Comparison with Java/Angular)

| Stack | Backend Logs | Frontend Logs |
|-------|-------------|---------------|
| **Java/Angular** | application.log files, Log4j, console | Browser Console (F12) |
| **Node.js/React** | Console output (stdout/stderr), log files | Browser Console (F12) |

## 🔧 Backend Logs (Express/Node.js)

### Location
- **Console Output**: When running `npm run dev`, logs appear in the terminal
- **Log File**: Currently redirected to `/tmp/server.log`
- **Code Location**: `server/index.ts` (line 29-37)

### How to View Backend Logs

#### 1. **Real-time Logs (Recommended)**
```bash
# View logs as they happen
tail -f /tmp/server.log

# View last 50 lines
tail -50 /tmp/server.log
```

#### 2. **Terminal Output** (if running in foreground)
```bash
# Stop background server and run in foreground
pkill -f "tsx server"
npm run dev
# Now you'll see logs directly in terminal
```

#### 3. **Check Recent Logs**
```bash
# Last 100 lines
tail -100 /tmp/server.log

# Search for specific patterns
grep "POST /api/admin/users" /tmp/server.log
grep "ERROR" /tmp/server.log
```

### What Backend Logs Include

The backend automatically logs:
- ✅ All API requests: `GET /api/admin/users 200 in 5ms`
- ✅ Request method, path, status code, duration
- ✅ Response data (for API endpoints)
- ✅ Server startup: `serving on port 5001`
- ✅ Errors and exceptions
- ✅ Database operations (via console.log in code)

**Example Log Entry:**
```
2:28:47 PM [express] POST /api/change-password 200 in 201ms :: {"message":"Password updated successfully"}
```

**Format:**
```
[TIME] [SOURCE] METHOD PATH STATUS in DURATION :: RESPONSE_DATA
```

### Backend Logging Code

Located in `server/index.ts`:
```typescript
// Custom log function (line 29)
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Automatic API request logging (line 40-64)
app.use((req, res, next) => {
  // Logs every API request automatically
});
```

### Adding Custom Backend Logs

```typescript
// In any server file (server/routes.ts, server/auth.ts, etc.)
import { log } from "./index";

// Simple log
log("User created successfully");

// Or use console.log directly
console.log("Debug message");
console.error("Error occurred", error);
```

---

## 🎨 Frontend Logs (React)

### Location
- **Browser Console**: Open Developer Tools (F12 or Cmd+Option+I on Mac)
- **Code Location**: Any file in `client/src/`

### How to View Frontend Logs

#### 1. **Open Browser Console**
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Safari**: Enable Developer menu first, then `Cmd+Option+C`
- Go to **Console** tab

#### 2. **Filter Log Types**
- Click the filter icons to show/hide:
  - 📝 Info (console.log)
  - ⚠️ Warnings (console.warn)
  - ❌ Errors (console.error)

#### 3. **Network Tab** (API Calls)
- Open Developer Tools → **Network** tab
- See all API requests/responses
- Click any request to see headers, body, response

### What Frontend Logs Include

Currently, the frontend doesn't have extensive logging, but you can add:
- ✅ React component render logs
- ✅ API call logs
- ✅ Error boundaries
- ✅ User interactions

### Frontend Logging Code

Located in any `client/src/` file:
```typescript
// Info log
console.log("Component rendered", data);

// Warning
console.warn("Deprecated function used");

// Error
console.error("API call failed", error);

// Debug (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log("Debug info");
}
```

### React Query DevTools (Optional)

You can also use React Query DevTools to see API state:
```typescript
// Already included - shows in browser console
// TanStack Query logs query states automatically
```

---

## 🔄 Key Differences from Java/Angular

### Java/Angular Stack
```
Backend (Java):
├── Log4j/Logback configuration
├── application.properties (log file paths)
├── logs/application.log (typical location)
└── Console output (stdout)

Frontend (Angular):
├── Browser Console (F12)
├── Angular DevTools
└── Network tab for HTTP calls
```

### Node.js/React Stack (This Project)
```
Backend (Node.js/Express):
├── Console output (stdout/stderr)
├── /tmp/server.log (current setup)
├── Can redirect to any file
└── No separate logging framework (uses console.log)

Frontend (React):
├── Browser Console (F12)
├── React DevTools (extension)
├── Network tab for API calls
└── Vite DevTools (HMR info)
```

---

## 📝 Quick Reference

### View Backend Logs Now
```bash
# Real-time logs (press Ctrl+C to stop)
tail -f /tmp/server.log

# Last 20 lines
tail -20 /tmp/server.log

# Search for errors
grep -i error /tmp/server.log
```

### View Frontend Logs Now
1. Open browser: http://localhost:5001
2. Press `F12` (or `Cmd+Option+I` on Mac)
3. Go to **Console** tab
4. See logs as you interact with the app

### Change Log File Location

To change where backend logs are saved, modify how you start the server:

```bash
# Current (saves to /tmp/server.log)
npm run dev > /tmp/server.log 2>&1 &

# Save to project directory
npm run dev > logs/server.log 2>&1 &

# Save to current directory
npm run dev > server.log 2>&1 &
```

---

## 🎯 Summary

- **Backend logs**: Terminal output or `/tmp/server.log` file
- **Frontend logs**: Browser Console (F12 → Console tab)
- **They are SEPARATE**: Backend runs on server, Frontend runs in browser
- **Backend logs API requests automatically**
- **Frontend logs need to be added manually** (or use browser DevTools)

