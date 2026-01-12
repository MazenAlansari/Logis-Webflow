# Logis-Webflow

A full-stack logistics and fleet management web application with role-based access control (Admin and Driver roles).

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **State Management**: TanStack Query (React Query)

## 📋 Prerequisites

Before running this project locally, ensure you have the following installed:

### Required Software

1. **Node.js** (v20 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **PostgreSQL** (v16 or higher)
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Or use Homebrew on macOS: `brew install postgresql@16`
   - Verify installation: `psql --version`

3. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

### Optional but Recommended

- **Git** - for version control
- **PostgreSQL GUI Tool** (pgAdmin, DBeaver, or TablePlus) - for database management

## 🛠️ Local Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/MazenAlansari/Logis-Webflow.git
cd Logis-Webflow
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up PostgreSQL Database

1. **Start PostgreSQL service** (if not running):
   ```bash
   # macOS (Homebrew)
   brew services start postgresql@16
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows
   # Start PostgreSQL service from Services panel
   ```

2. **Create a new database**:
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE logis_webflow;
   
   # Exit psql
   \q
   ```

   Or using command line:
   ```bash
   createdb logis_webflow
   ```

### Step 4: Configure Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your database credentials:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/logis_webflow
   PORT=5000
   NODE_ENV=development
   SESSION_SECRET=your-random-secret-key-here
   ADMIN_EMAIL=admin@logistics.com
   ADMIN_PASSWORD=admin123
   ADMIN_NAME=System Admin
   ```

   **Important Notes**:
   - Replace `your_username` and `your_password` with your PostgreSQL credentials
   - Generate a secure `SESSION_SECRET` for production (use: `openssl rand -base64 32`)
   - The `ADMIN_*` variables are used to create the initial admin user on first run

### Step 5: Set Up Database Schema

Run the database migrations to create the necessary tables:

```bash
npm run db:push
```

This will create the `users` table and other required schema in your database.

### Step 6: Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5000` (or the port specified in your `.env` file).

### Step 7: Access the Application

1. Open your browser and navigate to: `http://localhost:5000`
2. You'll be redirected to the login page
3. Use the admin credentials you set in `.env`:
   - Email: `admin@logistics.com` (or your `ADMIN_EMAIL`)
   - Password: `admin123` (or your `ADMIN_PASSWORD`)

## 📝 Available Scripts

- `npm run dev` - Start development server (with hot reload)
- `npm run build` - Build for production
- `npm run start` - Start production server (requires build first)
- `npm run check` - Type check TypeScript files
- `npm run db:push` - Push database schema changes to PostgreSQL

## 🗂️ Project Structure

```
Logis-Webflow/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
│   └── public/         # Static assets
├── server/              # Express backend
│   ├── auth.ts         # Authentication setup
│   ├── db.ts           # Database connection
│   ├── routes.ts       # API routes
│   └── index.ts        # Server entry point
├── shared/              # Shared code between client and server
│   ├── schema.ts       # Database schema (Drizzle)
│   └── routes.ts       # API route definitions
└── script/              # Build scripts
```

## 🔐 Default Admin User

On first run, the application automatically creates an admin user using the environment variables:
- `ADMIN_EMAIL` - Admin email (default: `admin@logistics.com`)
- `ADMIN_PASSWORD` - Admin password (default: `admin123`)
- `ADMIN_NAME` - Admin full name (default: `System Admin`)

**⚠️ Security Note**: Change the default admin password in production!

## 🚨 Troubleshooting

### Database Connection Issues

**Error**: `DATABASE_URL must be set`
- **Solution**: Ensure your `.env` file exists and contains `DATABASE_URL`

**Error**: `Connection refused` or `password authentication failed`
- **Solution**: 
  - Verify PostgreSQL is running: `pg_isready`
  - Check your database credentials in `.env`
  - Ensure the database exists: `psql -l | grep logis_webflow`

### Port Already in Use

**Error**: `Port 5000 is already in use`
- **Solution**: 
  - Change `PORT` in `.env` to a different port (e.g., `5001`)
  - Or stop the process using port 5000

### Module Not Found Errors

**Error**: `Cannot find module` or similar
- **Solution**: 
  - Delete `node_modules` and `package-lock.json`
  - Run `npm install` again

### Database Schema Issues

**Error**: `relation "users" does not exist`
- **Solution**: Run `npm run db:push` to create the database schema

## 🔒 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `PORT` | No | `5000` | Server port number |
| `NODE_ENV` | No | `development` | Environment mode |
| `SESSION_SECRET` | No | `replit_session_secret` | Secret for session encryption |
| `ADMIN_EMAIL` | No | `admin@logistics.com` | Initial admin email |
| `ADMIN_PASSWORD` | No | `admin123` | Initial admin password |
| `ADMIN_NAME` | No | `System Admin` | Initial admin name |

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

This is a private project. For issues or questions, please contact the repository owner.

## 📄 License

MIT

