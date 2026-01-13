# Quick Start Guide

## 🔐 Test Login Credentials

Use these credentials to log in to the application:

- **Email**: `admin@logistics.com`
- **Password**: `admin123`
- **Role**: ADMIN

After logging in, you'll be redirected to the Admin Dashboard at `/admin/home`.

## 📋 How to Check Server Logs

### Option 1: View Logs in Real-Time (Recommended)

If the server is running in the background, you can view logs in real-time:

```bash
# View the log file we created
tail -f /tmp/server.log

# Or if you started the server differently, check the terminal where it's running
```

### Option 2: Run Server in Foreground (See Logs Directly)

Stop the background server and run it in the foreground to see logs directly:

```bash
# Stop the background server
pkill -f "tsx server"

# Run server in foreground (you'll see all logs)
npm run dev
```

### Option 3: Check Server Status

```bash
# Check if server is running
ps aux | grep "tsx server" | grep -v grep

# Check what port it's listening on
lsof -i:5001
```

## 🚀 Starting/Stopping the Server

### Start Server (Background)
```bash
cd /Users/mazenansari/Documents/Software-Dev/replit/Logis-Webflow
npm run dev > /tmp/server.log 2>&1 &
```

### Start Server (Foreground - See Logs)
```bash
cd /Users/mazenansari/Documents/Software-Dev/replit/Logis-Webflow
npm run dev
```

### Stop Server
```bash
# Find and kill the server process
pkill -f "tsx server"

# Or find the PID and kill it
ps aux | grep "tsx server" | grep -v grep | awk '{print $2}' | xargs kill
```

## 📍 Application URLs

- **Main Application**: http://localhost:5001
- **Login Page**: http://localhost:5001/login
- **Admin Dashboard**: http://localhost:5001/admin/home (requires ADMIN role)
- **Driver Dashboard**: http://localhost:5001/driver/home (requires DRIVER role)
- **Profile Page**: http://localhost:5001/profile (requires authentication)
- **Change Password**: http://localhost:5001/change-password (requires authentication)

## 🔍 What Logs Show

The server logs include:
- Server startup messages
- API request logs (method, path, status code, duration)
- Database operations
- Authentication events
- Any errors or warnings

Example log output:
```
1:31:04 PM [express] serving on port 5001
1:32:15 PM [express] POST /api/login 200 in 45ms :: {"id":"...","username":"admin@logistics.com",...}
1:32:20 PM [express] GET /api/user 200 in 12ms
```

## 🛠️ Troubleshooting

### Server Not Starting?
- Check if port 5001 is already in use: `lsof -i:5001`
- Verify database is running: `pg_isready`
- Check `.env` file exists and has correct values

### Can't See Logs?
- Make sure server is running: `ps aux | grep "tsx server"`
- Check log file: `tail -20 /tmp/server.log`
- Run server in foreground to see logs directly

### Login Not Working?
- Verify admin user exists: `psql -d logis_webflow -c "SELECT username, role FROM users;"`
- Check credentials match `.env` file
- Clear browser cookies and try again

